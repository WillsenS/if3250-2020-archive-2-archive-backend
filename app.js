const chalk = require('chalk');
const express = require('express');
const compression = require('compression');
const expressStatusMonitor = require('express-status-monitor');
const path = require('path');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');

const { setApiVersion } = require('./middlewares/api');

const app = express();

/**
 * Load environment variables from .env file, where API keys and passwords are configured.
 */
dotenv.config({ path: '.env' });

const apiv1 = require('./routes/apiv1');

/**
 * Express configuration.
 */
app.set('host', process.env.OPENSHIFT_NODEJS_IP || '0.0.0.0');
app.set('port', process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.use(expressStatusMonitor());
app.use(compression());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/api/v1', setApiVersion('1.0'), apiv1);

/**
 * Resource Not Found handler.
 */
app.use('*', (req, res) => {
  res.status(404).json({
    apiVersion: res.locals.apiVersion,
    error: {
      code: 404,
      message: 'Could not find associated resource'
    }
  });
});

/**
 * Error handler.
 */
if (process.env.NODE_ENV === 'development') {
  app.use(errorHandler());
} else {
  app.use((err, req, res, next) => {
    console.error(`Request Error - An error has occurred with message: ${err.message}`);
    res.status(500).json({
      apiVersion: res.locals.apiVersion,
      error: {
        code: 500,
        message: 'We are very sorry for this trouble'
      }
    });
  });
}

/**
 * Start Express server.
 */
app.listen(app.get('port'), () => {
  console.log(
    '%s App is running at http://localhost:%d in %s mode',
    chalk.green('✓'),
    app.get('port'),
    app.get('env')
  );
  console.log('  Press CTRL-C to stop\n');
});

module.exports = app;
