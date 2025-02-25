const categoryController = require('../controllers/categoryController');
const router = require('express').Router();
const authMiddleware = require('../middleware/authMiddleware');

router
  .get('/', authMiddleware, categoryController.getAll)
  .get(
    '/:id',
    authMiddleware,
    categoryController.getCategoryMiddleware,
    categoryController.getOne,
  )
  .post(
    '/',
    authMiddleware,
    categoryController.categoryValidation,
    categoryController.validateCategoryMiddleware,
    categoryController.createOne,
  )
  .put(
    '/:id',
    authMiddleware,
    categoryController.getCategoryMiddleware,
    categoryController.categoryValidation,
    categoryController.validateCategoryMiddleware,
    categoryController.checkCategoryBelongsToUserGroupMiddleware,
    categoryController.updateOne,
  )
  .delete(
    '/:id',
    authMiddleware,
    categoryController.getCategoryMiddleware,
    categoryController.checkCategoryBelongsToUserGroupMiddleware,
    categoryController.deleteOne,
  );

module.exports = router;
