#!/bin/bash
node server/index.js &
SERVER_PID=$!
node_modules/.bin/vite --port 5000 --host
kill $SERVER_PID 2>/dev/null
