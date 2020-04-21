const chalk = require('chalk');
const express = require('express');
const compression = require('compression');
const expressStatusMonitor = require('express-status-monitor');
const path = require('path');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const errorHandler = require('errorhandler');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const cors = require('cors');
const MongoStore = require('connect-mongo')(session);

const { checkSSORedirect } = require('./handlers/user');
const { setApiVersion } = require('./middlewares/api');

const app = express();

/**
 * Load environment variables from .env file, where API keys and passwords are configured.
 */
dotenv.config({ path: '.env' });

const documentationv1 = require('./routes/documentationv1');
const apiv1 = require('./routes/apiv1');

/**
 * MongoDB connection
 */

/**
 * Connect to MongoDB.
 */
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.set('useNewUrlParser', true);
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.connection.on('error', err => {
  console.error(err);
  console.log('%s MongoDB connection error. Please make sure MongoDB is running.', chalk.red('✗'));
  process.exit();
});

/**
 * Initialize Mongo session.
 */
app.use(cookieParser(process.env.COOKIE_SECRET || 'cookie_secret'));
app.use(
  session({
    resave: true,
    saveUninitialized: true,
    secret: process.env.SESSION_SECRET,
    cookie: { maxAge: 1209600000 }, // two weeks in milliseconds
    store: new MongoStore({
      url: process.env.MONGODB_URI,
      autoReconnect: true
    })
  })
);

/**
 * Express configuration.
 */
app.set('host', process.env.OPENSHIFT_NODEJS_IP || '0.0.0.0');
app.set('port', process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 3001);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.use(
  cors({
    origin: true,
    credentials: true
  })
);
app.use(expressStatusMonitor());
app.use(compression());
app.use(checkSSORedirect());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(
  '/',
  express.static(path.join(__dirname, 'public'), {
    maxAge: 31557600000
  })
);

app.use('/documentation/v1', documentationv1);
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
  app.use((err, req, res) => {
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
    '%s App is running at %s in %s mode',
    chalk.green('✓'),
    process.env.BASE_URL,
    app.get('env')
  );
  console.log('  Press CTRL-C to stop\n');
});

module.exports = app;
