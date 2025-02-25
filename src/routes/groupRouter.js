const groupController = require('../controllers/groupController');
const router = require('express').Router();
const authMiddleware = require('../middleware/authMiddleware');

router
  .get('/', authMiddleware, groupController.getGroup)
  .post('/', authMiddleware, groupController.addToGroup)
  .post('/confirm', authMiddleware, groupController.confirmAddToGroup)
  .delete('/', authMiddleware, groupController.removeFromGroup)
  .get('/find', authMiddleware, groupController.findUser);

module.exports = router;
