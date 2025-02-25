const userController = require('../controllers/userController');
const router = require('express').Router();
const authMiddleware = require('../middleware/authMiddleware');

router
  .post(
    '/registration',
    userController.registrValidation,
    userController.registration,
  )
  .post('/login', userController.login)
  .get('/auth', authMiddleware, userController.check)
  .post(
    '/',
    authMiddleware,
    userController.updateValidation,
    userController.update,
  );

module.exports = router;
