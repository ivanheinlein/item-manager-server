const { check, validationResult } = require('express-validator');
const { Op } = require('sequelize');
const Item = require('../models/Item');
const User = require('../models/User');
const Category = require('../models/Category');
const Group = require('../models/Group');
const ItemCategory = require('../models/ItemCategory');
const ApiError = require('../errors/ApiError');
const { saveImage, deleteImage } = require('../utils/images');

const ITEM_FOLDER_NAME = 'items';

module.exports = {
  itemValidation: [check('name', 'Name is require').trim().notEmpty()],
  validateItemMiddleware(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(
        ApiError.badRequest('Item validation failed', errors.array()),
      );
    }
    return next();
  },
  async getItemMiddleware(req, res, next) {
    const item = await Item.findByPk(req.params.id, {
      include: [Category, User],
    });
    if (!item) return next(ApiError.badRequest('Item does not exist'));
    req.item = item;
    return next();
  },
  async checkItemBelongsToUserGroupMiddleware(req, res, next) {
    const userFriends = await Group.findAll({
      where: { userId: req.user.id },
      attributes: ['friendId'],
    });
    const groupIds = [
      req.user.id,
      ...userFriends.map(({ friendId }) => friendId),
    ];
    if (!groupIds.includes(req.item.userId)) {
      return next(ApiError.forbidden('You not allowed to edit this item'));
    }
    return next();
  },
  async getAll(req, res, next) {
    const {
      name,
      order: queryOrder,
      categories,
      dates,
      page,
      perPage,
      users,
    } = req.query;
    const where = {};

    if (Array.isArray(users) && users.length > 0) {
      where.userId = { [Op.in]: users.map((id) => parseInt(id, 10)) };
    } else {
      const userFriends = await Group.findAll({
        where: { userId: req.user.id },
        attributes: ['friendId'],
      });
      const groupIds = [
        req.user.id,
        ...userFriends.map(({ friendId }) => friendId),
      ];
      where.userId = { [Op.in]: groupIds };
    }

    if (Array.isArray(categories) && categories.length > 0) {
      const categorIds = categories.map((v) => parseInt(v, 10));
      const itemCategories = await ItemCategory.findAll({
        where: { categoryId: { [Op.in]: categorIds } },
      });
      const itemIds = itemCategories.map(({ itemId }) => itemId);
      where.id = { [Op.in]: itemIds };
    }

    const order = [['createdAt', queryOrder || 'DESC']];

    if (name) {
      where.name = {
        [Op.like]: `%${name}%`,
      };
    }

    if (Array.isArray(dates) && dates.length > 0) {
      const startDate = new Date(dates[0]);
      const endDate = dates[1] ? new Date(dates[1]) : new Date(dates[0]);
      endDate.setHours(23);
      endDate.setMinutes(59);
      endDate.setSeconds(59);

      where.createdAt = { [Op.between]: [startDate, endDate] };
    }

    const limit = parseInt(perPage, 10) || 30;
    const offset = (parseInt(page, 10) || 1) * limit - limit;
    const items = await Item.findAndCountAll({
      where,
      include: [Category, User],
      order,
      limit,
      offset,
    });
    return res.json({ message: 'Items received', data: items });
  },
  getOne(req, res, next) {
    return res.json({ data: { item: req.item } });
  },
  async createOne(req, res, next) {
    const { name, description, categories } = req.body;
    let image = null;
    const userId = req.user.id;

    if (req.files && req.files[0]) {
      image = saveImage(req.files[0], ITEM_FOLDER_NAME);
    }

    const newItem = await Item.create({
      name,
      description,
      image,
      userId,
    });

    if (Array.isArray(categories) && categories.length > 0) {
      await Promise.all(
        categories.map((catId) =>
          ItemCategory.create({
            categoryId: parseInt(catId, 10),
            itemId: newItem.id,
          }),
        ),
      );
    }

    const item = await Item.findByPk(newItem.id, { include: [Category, User] });

    return res.json({ message: 'Item created', data: { item } });
  },
  async updateOne(req, res, next) {
    const { item } = req;
    const { name, description, image: newImage, categories } = req.body;
    let { image } = item;

    if (image && image !== newImage) {
      await deleteImage(image).catch((err) =>
        next(ApiError.badRequest(err.message)),
      );
      image = null;
    }

    if (req.files && req.files[0]) {
      image = saveImage(req.files[0], ITEM_FOLDER_NAME);
    }

    const newCategories = Array.isArray(categories)
      ? categories.map((id) => parseInt(id, 10))
      : [];
    const curItemCategories = item.categories.map(({ id }) => id);

    const ubindCategories = curItemCategories.filter(
      (id) => !newCategories.includes(id),
    );

    const bindCategories = newCategories.filter(
      (id) => !curItemCategories.includes(id),
    );

    ubindCategories.forEach(async (categoryId) => {
      const itemCat = await ItemCategory.findOne({
        where: { categoryId, itemId: item.id },
      });
      console.log('delete = ', categoryId);
      if (itemCat) itemCat.destroy();
    });

    bindCategories.forEach((categoryId) => {
      console.log('create = ', categoryId);
      ItemCategory.create({ categoryId, itemId: item.id });
    });

    await item.update({ name, description, image });

    return res.json({ message: 'Item updated', data: { item } });
  },
  async deleteOne(req, res, next) {
    const { item } = req;
    const { image } = item;

    if (image) {
      await deleteImage(image).catch((err) =>
        next(ApiError.badRequest(err.message)),
      );
    }

    await item.destroy();

    return res.json({ message: 'Item deleted' });
  },
};
