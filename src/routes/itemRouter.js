const itemController = require('../controllers/itemController');
const router = require('express').Router();
const authMiddleware = require('../middleware/authMiddleware');

router
  .get('/', authMiddleware, itemController.getAll)
  .get(
    '/:id',
    authMiddleware,
    itemController.getItemMiddleware,
    itemController.checkItemBelongsToUserGroupMiddleware,
    itemController.getOne,
  )
  .post(
    '/',
    authMiddleware,
    itemController.itemValidation,
    itemController.validateItemMiddleware,
    itemController.createOne,
  )
  .put(
    '/:id',
    authMiddleware,
    itemController.getItemMiddleware,
    itemController.checkItemBelongsToUserGroupMiddleware,
    itemController.itemValidation,
    itemController.validateItemMiddleware,
    itemController.updateOne,
  )
  .delete(
    '/:id',
    authMiddleware,
    itemController.getItemMiddleware,
    itemController.checkItemBelongsToUserGroupMiddleware,
    itemController.deleteOne,
  );

module.exports = router;
