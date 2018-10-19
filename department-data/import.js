const path = require('path');
const firestore = require('./lib/firestore');
const parse = require('./lib/parse');

process.on('unhandledRejection', e => console.error(e));

const deptImports = {
  eei : {
    email : 0,
    name : 1,
    startDate : 2
  }
}

const DATA_ROOT = path.join(__dirname, 'data');

(async () => {
  await firestore.clearAll();

  for( let key in deptImports ) {
    let list = await parse(path.join(DATA_ROOT, key+'.csv'));
    list.shift();
    let rowMap = deptImports[key];
    
    for( let row of list ) {
      let item = {};
      for( let itemKey in rowMap ) {
        item[itemKey] = row[rowMap[itemKey]];
      }

      await firestore.insert(item);
    }
  } 

})();

const MONTHS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'nov', 'dec'];
function parseDate(date) {
  date = date.split('-');
  
  let day = parseInt(date[0]);
  let month = MONTHS.indexOf(date[1].toLowerCase());
  let year = parseInt('20'+date[2]);

  return new Date(year, month, day);
}