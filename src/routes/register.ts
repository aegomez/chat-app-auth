import { Router } from 'express';
import bcrypt from 'bcryptjs';

import {
  createRegisterValidation,
  createAvailabilityValidation,
  validate
} from '../validation';
import { User } from '../models';

const router = Router();

router
  .route('/register')
  .post(
    createRegisterValidation(),
    validate,
    createAvailabilityValidation(),
    validate
  )
  .post(async (req, res) => {
    // Create a new user
    const newUser = new User({
      name: req.body.name,
      email: req.body.email,
      password: ''
    });

    // Hash password before saving in database
    try {
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(req.body.password, salt);
      newUser.password = hash;
      const result = await newUser.save();

      return res.json(result);
    } catch (error) {
      return res.status(500).json({
        errors: 'Registration service is unavailable.'
      });
    }
  });

export { router as registerRouter };
