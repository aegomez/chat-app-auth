import {
  ExtractJwt,
  Strategy as JwtStrategy,
  StrategyOptions
} from 'passport-jwt';
import { PassportStatic } from 'passport';

import { findById } from '../db';

const options: StrategyOptions = {
  secretOrKey: process.env.JWT_SECRET,
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  issuer: 'accounts.chat.app'
};

export const passportConfig = (passport: PassportStatic): void => {
  passport.use(
    new JwtStrategy(options, (jwtPayload, done) => {
      findById(jwtPayload.id)
        .then(user => done(null, user || false))
        .catch(error => done(error, false));
    })
  );
};
