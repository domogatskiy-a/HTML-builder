const path = require('path');
const fs = require('fs');

const compareAndRm = (linkCopy, linkMain) => {
  
  fs.readdir(linkMain, {withFileTypes: true}, (err, filesMain) => {
    if(err) throw err;
    
    fs.readdir(linkCopy, {withFileTypes: true}, (err, files) => {
      if(err) throw err;
      
      const arrRmFiles = files.filter(file => !filesMain.map(file => file.name).includes(file.name)).map(file => file.name);
      arrRmFiles.forEach(file => {
        const pathFile = path.resolve(linkCopy, file);
        
        fs.rm(pathFile, { force: true, recursive: true, maxRetries: 2}, err => {
          if(err) throw err;
        });
      });
    });
  });

};

const copyFilesAndFolders = (linkCopy, linkMain) => {
  fs.readdir(linkMain, {withFileTypes: true}, (err, filesMain) => {
    if(err) throw err;
    filesMain.map(file => {
      if(file.isFile()){
        const pathSrc = path.resolve(linkMain, file.name);
        const pathDest = path.resolve(linkCopy, file.name);
        fs.copyFile(pathSrc, pathDest, err => {
          if(err) throw err;
        });
      }
      if(file.isDirectory()){
        copyDir(linkMain, file.name, linkCopy, file.name);  
      }
    });
  });
};

const mkDir = (link, folder, linkDest, folderCopy) => {
  const linkCopy = path.resolve(linkDest, folderCopy);
  const linkMain = path.resolve(link, folder);
  fs.mkdir(linkCopy, { recursive: true}, (err, pathMkDir) => {
    if(err) throw err.message;
    if(pathMkDir === undefined) {
      compareAndRm(linkCopy, linkMain);
    }
    copyFilesAndFolders(linkCopy, linkMain);
  });
};

const copyDir = (link, folder, linkCopy, folderCopy) => {
  mkDir(link, folder, linkCopy, folderCopy);
};

copyDir(__dirname, 'files', __dirname, 'files-copy');

module.exports.copyDir = copyDir;

