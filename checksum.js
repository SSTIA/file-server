const fs = require('fs');
const crypto = require('crypto');
const path = require('path');
const filesize = require('filesize');
const public_dir = 'public';

try {
  fs.statSync(public_dir);
} catch (e) {
  fs.mkdirSync(public_dir);
}

const data = {};

function calculate(dir) {
  const dir_path = path.join('./public', dir);
  const results = fs.readdirSync(dir_path);
  results.forEach(name => {
    const absolute_path = path.join(dir_path, name);
    const file_path = path.join(dir, name);
    const stats = fs.statSync(absolute_path);
    if (stats.isDirectory()) {
      calculate(file_path);
    } else if (stats.isFile()) {
      const file = fs.readFileSync(path.join('./public', file_path));
      const md5 = crypto.createHash('md5');
      const sha1 = crypto.createHash('sha1');
      md5.update(file);
      sha1.update(file);
      data[file_path] = {
        size: filesize(stats.size),
        md5: md5.digest('hex'),
        sha1: sha1.digest('hex'),
      };
    }
  });
}

calculate('/');
fs.writeFileSync('checksum.json', JSON.stringify(data, null, 4));

