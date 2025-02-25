const messageController = require('../controllers/messageController');
const router = require('express').Router();
const authMiddleware = require('../middleware/authMiddleware');

router
  .get('/', authMiddleware, messageController.getAll)
  .post('/', authMiddleware, messageController.createOne)
  .delete('/:id', authMiddleware, messageController.deleteOne);

module.exports = router;
