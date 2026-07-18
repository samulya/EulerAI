import { useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

interface MathRendererProps {
  content: string;
  className?: string;
}

export default function MathRenderer({ content, className = '' }: MathRendererProps) {
  const processed = useMemo(() => {
    if (!content) return '';
    return content
      .replace(/\\\[/g, '$$')
      .replace(/\\\]/g, '$$')
      .replace(/\\\(/g, '$')
      .replace(/\\\)/g, '$');
  }, [content]);

  return (
    <div className={`prose-math text-slate-700 leading-relaxed ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={{
          p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
          strong: ({ children }) => <strong className="font-semibold text-[#0F172A]">{children}</strong>,
          em: ({ children }) => <em className="italic text-slate-600">{children}</em>,
          code: ({ children }) => (
            <code className="bg-slate-100 text-[#1e3a5f] px-1.5 py-0.5 rounded text-sm font-mono">
              {children}
            </code>
          ),
          ul: ({ children }) => <ul className="list-disc list-inside space-y-1 my-2">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal list-inside space-y-1 my-2">{children}</ol>,
          li: ({ children }) => <li className="text-slate-700">{children}</li>,
        }}
      >
        {processed}
      </ReactMarkdown>
    </div>
  );
}
