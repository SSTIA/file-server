const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const checksum = require('../checksum.json');

/* GET home page. */
router.get('/', function(req, res, next) {
  let data = [];
  const dir = req.query.path || '/';
  if (!path.isAbsolute(dir)) {
    res.render('index', {title: 'SSTIA File Server', data: data});
    return;
  }
  const dir_path = path.join('./public', dir);
  fs.readdir(dir_path, (err, results) => {
    if (err) {
      results = [];
    } else {
      if (dir_path !== path.join('./public', '/')) {
        results.unshift('..');
      }
    }
    // console.log(results);
    let directories = [];
    let files = [];
    results.forEach(name => {
      const stats = fs.statSync(path.join(dir_path, name));
      if (stats.isDirectory()) {
        directories.push({
          type: 'Directory',
          name: name,
          path: path.join(dir, name),
          dir: true,
        });
      } else if (stats.isFile()) {
        const file_path = path.join(dir, name);
        console.log(file_path);
        if (checksum[file_path]) {
          const info = checksum[file_path];
          files.push({
            type: 'File',
            name: name,
            path: file_path,
            size: info.size,
            md5: info.md5,
            sha1: info.sha1,
          });
        }
      }
    });
    // console.log(data);
    data = directories.concat(files);
    res.render('index', {title: 'SSTIA File Server', data: data});
  });
});

module.exports = router;
