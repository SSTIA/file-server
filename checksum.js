const fs = require('fs');
const crypto = require('crypto');
const path = require('path');
const filesize = require('filesize');
const ProgressBar = require('progress');

const public_dir = 'public';

try {
  fs.statSync(public_dir);
} catch (e) {
  fs.mkdirSync(public_dir);
}

let data = {};
const result_path = path.join('.', 'checksum.json');
if (fs.existsSync(result_path)) {
  data = JSON.parse(fs.readFileSync(result_path, 'utf8'));
}

async function calculate(dir) {
  const dir_path = path.join('./public', dir);
  const results = fs.readdirSync(dir_path);
  for (let i = 0; i < results.length; i++) {
    const name = results[i];
    const absolute_path = path.join(dir_path, name);
    const file_path = path.join(dir, name);
    const stats = fs.statSync(absolute_path);
    if (stats.isDirectory()) {
      await calculate(file_path);
    } else if (stats.isFile()) {
      if (data.hasOwnProperty(file_path) && data[file_path].size === stats.size) {
        console.log(file_path, 'unchanged');
      } else {
        await new Promise((resolve, reject) => {
          const bar = new ProgressBar(file_path + ' hashing [:bar] :rate/bps :percent :etas', {
            complete: '=',
            incomplete: ' ',
            width: 20,
            total: stats.size
          });
          const rs = fs.createReadStream(path.join('./public', file_path));
          const md5 = crypto.createHash('md5');
          const sha1 = crypto.createHash('sha1');
          rs.on('data', data => {
            md5.update(data);
            sha1.update(data);
            bar.tick(data.length);
          });
          rs.on('end', function () {
            data[file_path] = {
              size: stats.size,
              filesize: filesize(stats.size),
              md5: md5.digest('hex'),
              sha1: sha1.digest('hex'),
            };
            resolve();
          });
        });
      }
      console.log(data[file_path]);
      console.log();
    }
  }
}

setTimeout(async () => {
  await calculate('/');
  fs.writeFileSync('checksum.json', JSON.stringify(data, null, 4));
}, 0);

