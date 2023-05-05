const path = require('path');
const fs = require('fs');
const {stdout} = process;

const pathFolder = path.resolve(__dirname, 'secret-folder');

const fileInfo = (file, pathFolder) => {
  if(file.isFile()){
    const pathFile = path.resolve(pathFolder, file.name);
    const extname = path.extname(file.name);
    const basename = path.basename(pathFile, extname);
    fs.stat(pathFile, (err, stat) => {
      stdout.write(`${basename} - ${extname.slice(1)} - ${Math.round(stat.size / 1024 * 1000)/1000} kb\n`);
    });
    
  }
};

fs.readdir(pathFolder, {withFileTypes: true}, (err, files) => {
  if(err) throw err;
  files.map(file => fileInfo(file, pathFolder));
});