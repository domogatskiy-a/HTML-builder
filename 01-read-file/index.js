const path = require('path');
const fs = require('fs');
const { stdout, stderr } = process;

const readableStream = fs.createReadStream(path.resolve(__dirname, 'text.txt'), 'utf-8');

readableStream.on('data', chunk => stdout.write(chunk));
readableStream.on('error', err => stderr.write(err.message));