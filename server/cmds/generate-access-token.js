const api = require('../lib/orcid-api');

(async function(){
  let json = await api.generateToken();
  console.log(json);
})();