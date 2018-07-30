const api = require('../lib/orcid-api');
const config = require('../config');

(async function(){
  api.setServerAccessToken(config.orcid.accessToken);
  let json = await api.search('given-names:justin');

  console.log(json);

  for( var i = 0; i < json.result.length; i++ ) {
    let response = await api.get(json.result[i]['orcid-identifier'].path);
    console.log(JSON.stringify(response, '  ', '  '));
    console.log();
  }

})();