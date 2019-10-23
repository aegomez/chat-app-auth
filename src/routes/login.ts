import { Router } from 'express';
import { validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

import { createLoginValidation, checkIfEmail, validate } from '../validation';
import { findOne } from '../db';

const router = Router();
const secretOrKey = process.env.JWT_SECRET;

router
  .route('/login')
  .post(createLoginValidation(), validate, checkIfEmail())
  .post(async (req, res) => {
    // Check if request passes a name or an email
    const result = validationResult(req);
    const key = result.isEmpty() ? 'email' : 'name';

    try {
      // Find user by email or name
      const { nameOrEmail, password } = req.body;
      const user = await findOne(key, nameOrEmail);

      if (!user) {
        return res.status(404).json({
          errors: 'User not found'
        });
      }

      // If user exists, check the password
      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return res.status(400).json({
          errors: 'Incorrect password'
        });
      }

      // Create JWT Payload
      const payload = {
        id: user.id,
        name: user.name
      };

      // Sign token
      jwt.sign(
        payload,
        secretOrKey as string,
        {
          expiresIn: '7d',
          issuer: 'accounts.chat.app'
        },
        (_error, token) => {
          res.json({
            success: true,
            token: 'Bearer ' + token
          });
        }
      );
    } catch (error) {
      return res.status(500).json({
        errors: 'Login service is unavailable'
      });
    }
  });

export { router as loginRouter };
