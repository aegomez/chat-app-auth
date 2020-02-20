import express from 'express';
import compression from 'compression';
import morgan from 'morgan';
import graphqlHTTP from 'express-graphql';

import { connect } from './db';
import { authSchema } from './graphql';

const PORT = process.env.PORT || 2000;

const app = express();

// express middleware
app.use(express.json());
app.use(compression());
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

app.use(
  '/q',
  graphqlHTTP((request, response) => ({
    schema: authSchema,
    graphiql: process.env.NODE_ENV === 'development',
    context: { response, cookie: request.headers.cookie }
  }))
);

// connect to database
connect()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server up and running on port ${PORT}.`);
    });
  })
  .catch(() => {
    console.error('Connect to DB failed after retries.');
  });
