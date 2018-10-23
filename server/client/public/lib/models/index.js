const models = {
  AppStateModel : require('./AppStateModel'),
  UserModel : require('./UserModel'),
  UcdModel : require('./UcdModel'),
  EmploymentModel : require('./EmploymentModel'),
  ValidatorModel : require('./ValidatorModel')
}

if( typeof window !== 'undefined' ) {
  window.APP_MODELS = models;
}

module.exports = models;