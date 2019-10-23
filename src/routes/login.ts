import { Router } from 'express';

const router = Router();

router.route('/login').post((_req, _res, next) => {
  next(new Error('not implemented'));
});

export { router as loginRouter };
