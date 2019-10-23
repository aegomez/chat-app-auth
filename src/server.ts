import express from 'express';
import compression from 'compression';
import morgan from 'morgan';
import passport from 'passport';

import { connect } from './db';
///
/// TODO: change the location out of config
///
import { passportConfig } from './auth';
import { registerRouter, loginRouter } from './routes';

const PORT = process.env.PORT || 2000;

const app = express();

// express middleware
app.use(express.json());
app.use(compression());
app.use(morgan('dev'));

// connect to database
connect()
  .then(() => console.log('Succesfully connected to DB.'))
  .catch(error => {
    console.error('Could not connect to database', error);
    // errors.dbConnectionFailed = 'Service is unavailable';
  });

// Passport config and middleware
app.use(passport.initialize());
passportConfig(passport);

// Routes
app.use('/api/users', registerRouter);
app.use('/api/users', loginRouter);

app.listen(PORT, () => `Server up and ruuning on port ${PORT}`);
