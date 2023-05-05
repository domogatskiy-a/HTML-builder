const path = require('path');
const fs = require('fs');
const { stdin, exit } = process;

const writableStream = fs.createWriteStream(path.resolve(__dirname, 'text.txt'));

const endInput = () => {
  writableStream.close();
  console.log('\x1b[32m\x1b[3m%s\x1b[0m', 'Сообщение записано.');
  exit();
};

console.log('\x1b[33m\x1b[5m%s\x1b[36m\x1b[3m', 'Введите сообщение:');

stdin.on('data', data => {
  if (data.toString().trim() == 'exit') {
    endInput(); 
  } else {
    writableStream.write(data);
  }
});

process.on('SIGINT', () => endInput());