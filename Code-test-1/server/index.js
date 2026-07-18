import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { readFileSync, existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

// REST-based Gemini caller — bypasses the SDK so we control API version directly.
// Tries every (version, model) combination until one succeeds.
const GEMINI_BASE = 'https://generativelanguage.googleapis.com';
const GEMINI_CONFIGS = [
  { version: 'v1',     model: 'gemini-2.0-flash' },
  { version: 'v1',     model: 'gemini-2.0-flash-lite' },
  { version: 'v1',     model: 'gemini-1.5-flash' },
  { version: 'v1',     model: 'gemini-1.5-pro' },
  { version: 'v1beta', model: 'gemini-2.0-flash' },
  { version: 'v1beta', model: 'gemini-2.0-flash-lite' },
  { version: 'v1beta', model: 'gemini-1.5-flash-latest' },
  { version: 'v1beta', model: 'gemini-1.5-pro-latest' },
];

function toRestParts(parts) {
  return parts.map(p => {
    if (p.inlineData) {
      return { inline_data: { mime_type: p.inlineData.mimeType, data: p.inlineData.data } };
    }
    return p; // { text: '...' } passes through unchanged
  });
}

async function geminiGenerate(apiKey, parts) {
  const restParts = toRestParts(Array.isArray(parts) ? parts : [{ text: parts }]);
  const body = JSON.stringify({ contents: [{ parts: restParts }] });
  let lastError;

  // Try both auth styles — API key as query param OR as x-goog-api-key header
  const authStyles = [
    { label: 'queryparam', buildReq: (base) => ({ url: `${base}?key=${apiKey}`, extraHeaders: {} }) },
    { label: 'header',     buildReq: (base) => ({ url: base,                    extraHeaders: { 'x-goog-api-key': apiKey } }) },
  ];

  for (const { version, model } of GEMINI_CONFIGS) {
    for (const { label, buildReq } of authStyles) {
      try {
        const base = `${GEMINI_BASE}/${version}/models/${model}:generateContent`;
        const { url, extraHeaders } = buildReq(base);
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...extraHeaders },
          body,
        });
        const data = await res.json();
        const errMsg = res.ok ? '' : (data?.error?.message || `HTTP ${res.status}`);
        const errStatus = res.ok ? '' : (data?.error?.status || '');
        console.log(`[gemini] ${version}/${model} [${label}] → ${res.status}${errStatus ? ' ' + errStatus : ''} ${errMsg.substring(0, 80)}`);

        if (!res.ok) {
          // 429 = quota exceeded — key IS valid, Google recognised it
          if (res.status === 429 || errStatus === 'RESOURCE_EXHAUSTED') {
            const err = new Error(`QUOTA_EXCEEDED: ${errMsg}`);
            throw err; // bubbles up immediately — no point trying other models
          }
          const isUnavailable =
            res.status === 404 ||
            errMsg.includes('not found') ||
            errMsg.includes('not supported');
          const err = new Error(`[${res.status} ${errStatus}] ${errMsg}`);
          lastError = err;
          if (isUnavailable) break; // skip to next model
          throw err;
        }

        const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
        console.log(`[gemini] SUCCESS — ${version}/${model} [${label}]`);
        return text;
      } catch (err) {
        if (err.message?.startsWith('[')) throw err; // already classified
        lastError = err;
        console.error(`[gemini] Network error ${version}/${model} [${label}]:`, err.message);
      }
    }
  }
  throw lastError || new Error('No Gemini model available for this API key.');
}
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// ── Mock responses ──────────────────────────────────────────────────────────
const MOCK_RESPONSES = {
  'hint': {
    concept: 'Algebraic Thinking',
    hint: 'Think about what happens when you isolate the variable on one side. What operation would undo the current operation applied to x?',
    encouragement: 'You are on the right track! Try working backwards from the result.',
  },
  'teach': {
    concept: 'Solving Linear Equations',
    explanation: 'A linear equation has the form ax + b = c, where a, b, c are constants and x is the unknown. To solve it, we perform inverse operations to isolate x on one side of the equation.',
    worked_example: {
      problem: 'Solve: 3x + 7 = 22',
      steps: [
        'Start with: 3x + 7 = 22',
        'Subtract 7 from both sides: 3x = 15',
        'Divide both sides by 3: x = 5',
        'Verify: 3(5) + 7 = 15 + 7 = 22 ✓',
      ],
      answer: 'x = 5',
    },
    practice_question: 'Now try: 2x + 9 = 25. What is x?',
    next_topic: 'Systems of Linear Equations',
    analogy: 'Think of the equation like a balance scale. Whatever you do to one side, you must do to the other to keep it balanced.',
  },
  'step-by-step': {
    concept: 'Step-by-Step Solution',
    steps: [
      { step: 1, action: 'Identify the equation type', detail: 'This is a linear equation in one variable.' },
      { step: 2, action: 'Isolate the variable term', detail: 'Move all terms with x to one side using addition or subtraction.' },
      { step: 3, action: 'Solve for x', detail: 'Divide or multiply both sides by the coefficient of x.' },
      { step: 4, action: 'Verify your answer', detail: 'Substitute x back into the original equation to confirm.' },
    ],
    answer: 'x = 5',
    practice_question: 'Try: 4x − 3 = 13',
    next_topic: 'Inequalities',
  },
  'full': {
    concept: 'Linear Equations — Full Solution',
    theory: 'Linear equations are first-degree polynomial equations. They represent straight lines graphically and have exactly one solution (unless degenerate).',
    explanation: 'To solve 3x + 7 = 22, we apply the principle of equality: performing the same operation on both sides preserves the equation\'s truth.',
    worked_example: {
      problem: 'Solve: 3x + 7 = 22',
      steps: [
        { step: '3x + 7 = 22', reason: 'Original equation' },
        { step: '3x = 22 − 7', reason: 'Subtract 7 from both sides (additive inverse)' },
        { step: '3x = 15', reason: 'Simplify right side' },
        { step: 'x = 15 ÷ 3', reason: 'Divide both sides by 3 (multiplicative inverse)' },
        { step: 'x = 5', reason: 'Final answer' },
      ],
    },
    verification: '3(5) + 7 = 15 + 7 = 22 ✓ The solution is correct.',
    real_world: 'Linear equations model many real scenarios: calculating time, distance, pricing, and more.',
    practice_question: 'Challenge: 5x + 12 = 3x + 28. Solve for x.',
    next_topic: 'Quadratic Equations',
  },
};

function buildSystemPrompt(profile, mode) {
  const ageInstructions = {
    '8-10': 'You are teaching a child aged 8-10. Use simple words, fun stories, and everyday analogies. Avoid technical jargon. Make learning feel like an adventure. Use encouraging language.',
    '11-13': 'You are teaching a middle schooler aged 11-13. Use intuitive examples and relatable real-world scenarios. Connect math to things they care about. Build confidence through step-by-step clarity.',
    '14-18': 'You are teaching a high school student aged 14-18. Use curriculum-aligned explanations. Be precise but approachable. Connect concepts to exam preparation. Show the "why" behind formulas.',
    'university': 'You are teaching a university student. Use formal mathematical language and notation. Include proofs when relevant. Assume calculus and linear algebra knowledge. Be rigorous.',
    'jee': 'You are teaching a JEE/competitive exam aspirant. Focus on problem-solving strategies, shortcuts, and multiple approaches. Highlight common exam traps. Efficiency matters.',
    'olympiad': 'You are teaching an Olympiad student. Emphasize elegant proofs, multiple approaches, and deep mathematical insight. Explore generalizations. Mathematical beauty matters.',
    'research': 'You are helping a mathematics researcher or advanced student. Use precise mathematical language, cite relevant theory, and discuss connections to advanced topics and open problems.',
  };

  const modeInstructions = {
    'hint': 'Give ONLY a brief hint (2-3 sentences). Do not reveal the solution. Guide their thinking with a question or nudge. Be Socratic.',
    'teach': 'Teach the concept fully. Include: the core concept, an intuitive explanation, a worked example, a practice question, and the next suggested topic.',
    'step-by-step': 'Provide a detailed step-by-step solution. Number each step clearly. Explain the reasoning at each step. End with a practice problem.',
    'full': 'Provide the complete solution with full theory, multiple approaches if applicable, verification, real-world context, and a challenging follow-up.',
  };

  const goalContext = {
    'school': 'The student is learning for school curriculum mastery.',
    'jee': 'The student is preparing for JEE (Joint Entrance Examination).',
    'olympiad': 'The student is training for Mathematics Olympiads (IMO, AMC, etc.).',
    'university': 'The student is studying university-level mathematics.',
    'research': 'The student is engaged in mathematical research.',
  };

  return `You are Euler AI, an expert mathematics mentor. ${ageInstructions[profile?.ageGroup] || ageInstructions['14-18']}

${goalContext[profile?.goal] || goalContext['school']}

${modeInstructions[mode] || modeInstructions['teach']}

RESPONSE FORMAT (always use this JSON structure):
{
  "concept": "Name of the mathematical concept",
  "explanation": "Your main explanation (use LaTeX for math: $inline$ or $$block$$)",
  "worked_example": {
    "problem": "Example problem",
    "steps": ["step 1", "step 2", ...],
    "answer": "Final answer"
  },
  "practice_question": "A follow-up practice question",
  "next_topic": "Suggested next topic to study",
  "hint": "(only for hint mode) The hint text",
  "steps": "(only for step-by-step) Array of {step, action, detail} objects"
}

IMPORTANT:
- Always respond in valid JSON
- Use LaTeX notation for all mathematical expressions
- Adapt vocabulary to the student's level
- Be encouraging and build confidence
- Never just give answers without explanation (unless in Full Solution mode)`;
}

function getMockResponse(mode, profile) {
  const base = MOCK_RESPONSES[mode] || MOCK_RESPONSES['teach'];
  return {
    ...base,
    mock: true,
    message: 'This is a sample response. Add your Gemini API key in Settings to get real AI-powered answers.',
    profile_adapted: profile ? `Adapted for ${profile.ageGroup || 'general'} level, goal: ${profile.goal || 'school'}` : null,
  };
}

// ── Routes ──────────────────────────────────────────────────────────────────

app.post('/api/ask', upload.single('image'), async (req, res) => {
  try {
    const { question, mode = 'teach', profile } = req.body;
    const parsedProfile = typeof profile === 'string' ? JSON.parse(profile) : profile;

    // Get API key: from request header, then env
    const apiKey = req.headers['x-gemini-key'] || process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.json({ success: true, data: getMockResponse(mode, parsedProfile), mock: true });
    }

    const systemPrompt = buildSystemPrompt(parsedProfile, mode);
    const userQuestion = question || 'Please analyze the mathematical content in the image.';

    const parts = [];

    if (req.file) {
      parts.push({
        inlineData: {
          data: req.file.buffer.toString('base64'),
          mimeType: req.file.mimetype,
        },
      });
      parts.push({ text: `${systemPrompt}\n\nUser question about the image: ${userQuestion}` });
    } else {
      parts.push({ text: `${systemPrompt}\n\nUser question: ${userQuestion}` });
    }

    const responseText = await geminiGenerate(apiKey, parts);

    let parsed;
    try {
      const jsonMatch = responseText.match(/```json\n?([\s\S]*?)\n?```/) || responseText.match(/\{[\s\S]*\}/);
      const jsonStr = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : responseText;
      parsed = JSON.parse(jsonStr);
    } catch {
      parsed = {
        concept: 'Mathematics',
        explanation: responseText,
        worked_example: null,
        practice_question: null,
        next_topic: null,
      };
    }

    res.json({ success: true, data: parsed, mock: false });
  } catch (error) {
    console.error('API error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/simplify', async (req, res) => {
  try {
    const { originalResponse, question, profile } = req.body;
    const apiKey = req.headers['x-gemini-key'] || process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.json({
        success: true,
        data: {
          concept: originalResponse.concept,
          explanation: 'Let me explain this in a simpler way! Think of it like this: when you have a problem, you break it into smaller pieces. Each piece is easier to solve. Then you put them all together to get your answer. It\'s like solving a puzzle!',
          worked_example: originalResponse.worked_example,
          practice_question: 'Can you try a similar but simpler problem?',
          next_topic: originalResponse.next_topic,
        },
        mock: true,
      });
    }

    const prompt = `The student said they did NOT understand this explanation about "${originalResponse.concept}".

Original explanation: ${JSON.stringify(originalResponse)}

Please provide a SIMPLER explanation using:
- More basic language
- A different analogy or story
- Smaller, more digestible steps
- More encouragement

Student profile: ${JSON.stringify(profile)}
Original question: ${question}

Respond in the same JSON format as before but with simpler content.`;

    const responseText = await geminiGenerate(apiKey, prompt);

    let parsed;
    try {
      const jsonMatch = responseText.match(/```json\n?([\s\S]*?)\n?```/) || responseText.match(/\{[\s\S]*\}/);
      const jsonStr = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : responseText;
      parsed = JSON.parse(jsonStr);
    } catch {
      parsed = { concept: originalResponse.concept, explanation: responseText };
    }

    res.json({ success: true, data: parsed, mock: false });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/validate-key', async (req, res) => {
  try {
    const { apiKey } = req.body;
    if (!apiKey) return res.json({ valid: false, error: 'No API key provided.' });

    const trimmed = apiKey.trim();
    await geminiGenerate(trimmed, 'Say "OK" in one word.');
    res.json({ valid: true });
  } catch (error) {
    const msg = error.message || '';
    console.error('[validate-key] RAW ERROR:', msg);

    // QUOTA_EXCEEDED means Google recognised and authenticated the key — treat as valid
    if (msg.startsWith('QUOTA_EXCEEDED:')) {
      console.log('[validate-key] Key is valid (quota-limited) — accepting.');
      return res.json({ valid: true, quotaWarning: true });
    }

    let friendly;
    if (msg.includes('API_KEY_INVALID') || msg.includes('API key not valid') || msg.includes('INVALID_ARGUMENT')) {
      friendly = 'Invalid API key. Double-check you copied the full key from Google AI Studio.';
    } else if (msg.includes('PERMISSION_DENIED') || msg.includes('403')) {
      friendly = 'Permission denied. Make sure the key has Gemini API access.';
    } else if (msg.includes('UNAUTHENTICATED') || msg.includes('401')) {
      friendly = 'Authentication failed. Make sure you copied the full key correctly.';
    } else if (msg.includes('ENOTFOUND') || msg.includes('ECONNREFUSED') || msg.includes('ETIMEDOUT')) {
      friendly = 'Network error reaching Google. Check your internet connection.';
    } else {
      friendly = msg.substring(0, 300) || 'Validation failed. Please try again.';
    }
    res.json({ valid: false, error: friendly });
  }
});

// Serve built frontend in production
const distPath = path.join(__dirname, '..', 'dist');
if (existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Euler AI server running on port ${PORT}`));
