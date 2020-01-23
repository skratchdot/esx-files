#!/usr/bin/env node
'use strict';

var fs = require('fs');
var marked = require('marked');
var path = require('path');
var _ = require('underscore');

var walkSync = function(dir, fileList, baseDir) {
  var fs = fs || require('fs'),
    files = fs.readdirSync(dir),
    baseDir = baseDir || '';
  fileList = fileList || [];
  files.forEach(function(file) {
    if (fs.statSync(dir + '/' + file).isDirectory()) {
      fileList = walkSync(dir + '/' + file, fileList, baseDir);
    } else {
      fileList.push((dir + '/' + file).replace(baseDir, ''));
    }
  });
  return fileList;
};

var files = walkSync(__dirname, [], __dirname);
files = files.filter(function(file) {
  return file.indexOf('/.git/') === -1 && file.indexOf('/node_modules/') === -1;
});
var jsonData = files
  .map(f => {
    var obj = path.parse(f);
    obj.file = f;
    return obj;
  })
  .map(obj => {
    obj.group = obj.dir.split('/')[1];
    return obj;
  })
  .filter(obj => obj.group.length > 0);
var byDir = _.groupBy(jsonData, 'dir');
var dirs = _.uniq(_.pluck(jsonData, 'dir'));
var groups = _.uniq(_.pluck(jsonData, 'group'));
var readme = `# esx-files

a collection of esx related files


## Links

- [Github Project](https://github.com/skratchdot/esx-files/)
- [Project Page](https://projects.skratchdot.com/esx-files/)


## Files`;

Object.keys(byDir).forEach(function(dir) {
  readme += `\n\n### Directory: ${dir}\n`;
  byDir[dir].forEach(function(obj) {
    var b = obj.base;
    var f = obj.file;
    readme += `\n- [${b}](https://projects.skratchdot.com/esx-files${f})`;
  });
});

fs.writeFileSync('./README.md', readme, 'utf-8');
fs.writeFileSync('./index.html', marked(readme), 'utf-8');
fs.writeFileSync('./json/dirs.json', JSON.stringify(dirs, null, '  '), 'utf-8');
fs.writeFileSync(
  './json/groups.json',
  JSON.stringify(groups, null, '  '),
  'utf-8'
);
fs.writeFileSync(
  './json/data.json',
  JSON.stringify(jsonData, null, '  '),
  'utf-8'
);
