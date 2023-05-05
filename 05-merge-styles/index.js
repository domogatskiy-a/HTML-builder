const path = require('path');
const fs = require('fs');

const linkSrc = path.resolve(__dirname, 'styles');
const linkDest = path.resolve(__dirname, 'project-dist', 'bundle.css');

const buildStyle = (linkSrc, linkDest) => {
  const writableStream = fs.createWriteStream(linkDest);

  fs.readdir(linkSrc, {withFileTypes: true}, (err, files) => {
    if(err) throw err;
    files.map(file => {
      if(file.isFile() && path.extname(file.name) === '.css'){
        const readableStream = fs.createReadStream(path.resolve(linkSrc, file.name));
        readableStream.pipe(writableStream);
      }
    });
  });
};

buildStyle(linkSrc, linkDest);

module.exports.buildStyle = buildStyle;