const path = require('path');
const fs = require('fs');
const { stdout } = process;

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


const writePortionData = (writableStream, data, startIndex, dataIndex, componentsIndex, linkSrc) => {
  for(let index = startIndex; index < dataIndex.length; index += 1){
    if(!componentsIndex.includes(dataIndex[index])){
      writableStream.write(data[dataIndex[index]]);
    } else {
      const readableStream = fs.createReadStream(
        path.resolve(linkSrc, data[dataIndex[index]] + '.html'), 'utf-8');
      let componentsData = '';

      readableStream.on('data', line => {componentsData += line;});
      readableStream.on('error', err => stdout.write(err.message));
      readableStream.on('end', () => {
        writableStream.write(componentsData);
        writePortionData(writableStream, data, index + 1, dataIndex, componentsIndex, linkSrc);
      });
      break;
    }
  }
};

const changeTemplate = (data, components, linkComponents, linkDest) => {
  let arrData = data.split(/({{|}})/);
  let componentsIndex = [];
  const dataIndex = arrData.map((dat, ndx, arr) => {
    if(dat !== '{{' && dat !== '}}'){
      if(!components.includes(dat)){
        return ndx;
      } else {
        if(arr[ndx - 1] === '{{' && arr[ndx + 1] === '}}') {
          componentsIndex.push(ndx);
          return ndx;
        }
      }
    }
  }).filter(ndx => ndx !== undefined);
  
  const writableStream = fs.createWriteStream(path.resolve(linkDest, 'index.html'));
  writePortionData(writableStream, arrData, 0, dataIndex, componentsIndex, linkComponents);  
};

const buildHtml = (linkSrc, linkDest) => {
  const linkComponents = path.resolve(__dirname, 'components');
  const components = [];

  fs.readdir(linkComponents, {withFileTypes: true}, (err, files) => {
    if(err) throw err;
    files.map(file => {
      if(file.isFile() && path.extname(file.name) === '.html'){
        components.push(path.basename(file.name, '.html'));        
      }
    });
    const readableStream = fs.createReadStream(linkSrc, 'utf-8');
    let data = '';

    readableStream.on('data', line => {data += line;});
    readableStream.on('error', err => stdout.write(err.message));
    readableStream.on('end', () => changeTemplate(data, components, linkComponents, linkDest));
  });
};

const projectDist = path.resolve(__dirname, 'project-dist');

fs.mkdir(projectDist, { recursive: true}, (err) => {
  if(err) throw err.message;
});

buildStyle(
  path.resolve(__dirname, 'styles'),
  path.resolve(projectDist, 'style.css'),
);

copyDir(__dirname, 'assets', projectDist, 'assets');

buildHtml(path.resolve(__dirname, 'template.html'), projectDist);