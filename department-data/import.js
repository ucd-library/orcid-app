const path = require('path');
const firestore = require('./lib/firestore');
const parse = require('./lib/parse');

process.on('unhandledRejection', e => console.error(e));

const deptImports = {
  eei : {
    name : 0,
    id : 1,
    deptNo : 3,
    deptName : 4,
    deptAddr : 5
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