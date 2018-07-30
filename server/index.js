const logger = require('./lib/logger');
logger.info('Starting server');

const express = require('express');
const session = require('express-session');

// global catch alls for errors
// TODO: kill app on error
process.on('uncaughtException', (e) => logger.fatal(e));
process.on('unhandledRejection', (e) => logger.fatal(e));

// create express instance
const app = express();

// setup sessions
app.use(session({
  name              : 'ucd-orcid-app',
  secret            : config.server.cookieSecret,
  resave            : false,
  maxAge            : config.server.cookieMaxAge,
  saveUninitialized : true
}));

// parse cookies and add compression
app.use(cookieParser()); 
app.use(compression());

// require custom endpoints
app.use(require('./controllers'));



app.listen(config.server.port, () => {
  logger.info(`Server ready on port ${config.server.port}`);
});