const path = require('path');
const fs = require('fs-extra');
// const firestore = require('./lib/firestore');
const parse = require('./lib/parse');
const ucdApi = require('../server/lib/ucd-iam-api');

const DATA_ROOT = path.join(__dirname, 'data');
const SERVER_ROOT = path.resolve(__dirname, '..', 'server', 'data');

process.on('unhandledRejection', e => console.error(e));

const deptImports = {
  eei : {
    email : 0,
    name : 1,
    startDate : 2
  }
};

(async function() {
  await clearDir();
  await importTitles();
  await importEEI();
})();

async function clearDir() {
  if( fs.existsSync(SERVER_ROOT) ) {
    await fs.remove(SERVER_ROOT);
  }
  await fs.mkdirp(SERVER_ROOT);
}

function importTitles() {
  return fs.copy(path.join(DATA_ROOT,'titles.json'), path.join(SERVER_ROOT, 'titles.json'));
}

async function importEEI() {
  let list = await parse(path.join(DATA_ROOT, 'eei.csv'));
  list.shift();
  let rowMap = deptImports.eei;

  let data = {};

  for( let row of list ) {
    let item = {};
    for( let itemKey in rowMap ) {
      item[itemKey] = row[rowMap[itemKey]];

      if( itemKey === 'email' ) {
        item.iam = await ucdApi.getIamFromEmail(item.email);
        if( !item.iam ) console.log('Unable to find IAM for: '+item.email);
      } else if( itemKey === 'startDate' ) {
        item.startDate = parseDate(item.startDate);
      }
    }

    data[item.iam] = item;
  }

  return fs.writeFile(
    path.join(SERVER_ROOT, 'eei.json'), 
    JSON.stringify(data, '  ', '  ')
  );
}


const MONTHS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'nov', 'dec'];
function parseDate(date) {
  date = date.split('-');
  
  let day = parseInt(date[0]);
  let month = MONTHS.indexOf(date[1].toLowerCase());
  let year = parseInt('20'+date[2]);

  return new Date(year, month, day, 0, 0, 0).toISOString();
}