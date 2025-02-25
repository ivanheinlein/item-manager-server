const { check, validationResult } = require('express-validator');
const { Op } = require('sequelize');
const Category = require('../models/Category');
const User = require('../models/User');
const Group = require('../models/Group');
const ApiError = require('../errors/ApiError');
const { saveImage, deleteImage } = require('../utils/images');

const CATEGORIES_FOLDER_NAME = 'categories';

module.exports = {
  categoryValidation: [
    check('name', 'Name is require').trim().notEmpty(),
    check('color', 'Color must be in hex format').isHexColor(),
  ],
  async getCategoryMiddleware(req, res, next) {
    const category = await Category.findByPk(req.params.id, { include: User });
    if (!category) return next(ApiError.badRequest('Category does not exist'));
    req.category = category;
    return next();
  },
  async checkCategoryBelongsToUserGroupMiddleware(req, res, next) {
    const userFriends = await Group.findAll({
      where: { userId: req.user.id },
      attributes: ['friendId'],
    });
    const groupIds = [
      req.user.id,
      ...userFriends.map(({ friendId }) => friendId),
    ];
    if (!groupIds.includes(req.category.userId)) {
      return next(ApiError.forbidden('You not allowed to edit this category'));
    }
    return next();
  },
  async getAll(req, res, next) {
    const userFriends = await Group.findAll({
      where: { userId: req.user.id },
      attributes: ['friendId'],
    });
    const groupIds = [
      req.user.id,
      ...userFriends.map(({ friendId }) => friendId),
    ];
    const categories = await Category.findAll({
      where: { userId: { [Op.in]: groupIds } },
      include: User,
    });
    return res.json({ message: 'Cagories received', data: { categories } });
  },
  getOne(req, res, next) {
    return res.json({ data: { category: req.category } });
  },
  validateCategoryMiddleware(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(
        ApiError.badRequest('Category validation failed', errors.array()),
      );
    }
    return next();
  },
  async createOne(req, res, next) {
    const { name, color, description } = req.body;
    let image = null;
    const userId = req.user.id;

    if (req.files && req.files[0]) {
      image = saveImage(req.files[0], CATEGORIES_FOLDER_NAME);
    }

    const newCategory = await Category.create({
      name,
      color,
      description,
      image,
      userId,
    });

    const category = await Category.findByPk(newCategory.id, {
      include: User,
    });

    return res.json({
      message: 'Category created',
      data: { category },
    });
  },
  async updateOne(req, res, next) {
    const { category } = req;
    const { name, color, description, image: newImage } = req.body;
    let { image } = category;

    if (image && image !== newImage) {
      await deleteImage(image).catch((err) =>
        next(ApiError.badRequest(err.message)),
      );
      image = null;
    }

    if (req.files && req.files[0]) {
      image = saveImage(req.files[0], CATEGORIES_FOLDER_NAME);
    }

    await category.update({ name, color, description, image });

    return res.json({ message: 'Category updated', data: { category } });
  },
  async deleteOne(req, res, next) {
    const { category } = req;
    const { image } = category;

    if (image) {
      await deleteImage(image).catch((err) =>
        next(ApiError.badRequest(err.message)),
      );
    }

    await category.destroy();

    return res.json({ message: 'Category deleted' });
  },
};
