const models = {
  AppStateModel : require('./AppStateModel'),
  OrcidModel : require('./OrcidModel')
}

if( typeof window !== 'undefined' ) {
  window.APP_MODELS = models;
}

module.exports = models;