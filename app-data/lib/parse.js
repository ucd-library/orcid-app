const parse = require('csv-parse');
const fs = require('fs');

module.exports = (file) => {
  return new Promise((resolve, reject) => {
    let txt = fs.readFileSync(file);
    parse(txt, {}, (err, csv) => {
      if( err ) reject(err);
      else resolve(csv);
    });
  });
}