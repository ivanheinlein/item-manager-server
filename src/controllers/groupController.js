const { Op } = require('sequelize');
const Group = require('../models/Group');
const User = require('../models/User');
const Item = require('../models/Item');
const Category = require('../models/Category');
const ItemCategory = require('../models/ItemCategory');
const Message = require('../models/Message');
const ApiError = require('../errors/ApiError');
const { TYPES: MESSAGE_TYPES } = require('../utils/messages');

module.exports = {
  async getGroup(req, res, next) {
    const { user } = req;
    const group = await Group.findAll({
      where: { userId: user.id },
      attributes: ['friendId'],
    });
    const friendsIds = group.map(({ friendId }) => friendId);
    const users = await User.findAll({
      where: { id: { [Op.in]: friendsIds } },
    });
    return res.json({ data: { users } });
  },
  async addToGroup(req, res, next) {
    const { user } = req;
    const { id: friendId } = req.body;

    if (user.id.toString() === friendId.toString()) {
      return next(ApiError.badRequest("You can't add yourserf to group"));
    }

    const alreadyInGroup = await Group.findOne({
      where: { userId: user.id, friendId },
    });

    if (alreadyInGroup) {
      return next(
        ApiError.badRequest(`User with id=${friendId} is aleardy in group`),
      );
    }

    const friend = await User.findByPk(friendId);
    if (!friend) {
      return next(ApiError.badRequest(`User with id=${friendId} not exist`));
    }

    const message = {
      userId: user.id,
      receiverId: friendId,
      type: MESSAGE_TYPES.groupConfirm,
      text: `User ${user.email} ask you to join his(her) group`,
    };

    const messageExist = await Message.findOne({ where: message });
    if (!messageExist) {
      await Message.create(message);
    }

    return res.json({ message: 'Request successfully sent to your friend' });
  },
  async confirmAddToGroup(req, res, next) {
    const { messageId } = req.body;
    const message = await Message.findByPk(messageId);

    if (!message) {
      return next(
        ApiError.badRequest(`Message id="${messageId}" is not exist`),
      );
    }

    if (message.type !== MESSAGE_TYPES.groupConfirm) {
      return next(
        ApiError.badRequest(`Message id="${messageId}" has wrong type`),
      );
    }

    const { userId, receiverId: friendId } = message;

    await Group.create({ userId, friendId });
    await Group.create({ userId: friendId, friendId: userId });
    await message.destroy();
    const friend = await User.findByPk(userId);

    return res.json({ data: { friend } });
  },
  async removeFromGroup(req, res, next) {
    const { user } = req;
    const { id: friendId } = req.body;

    const groupFriend = await Group.findOne({
      where: { userId: user.id, friendId },
    });
    const groupFriendMirrow = await Group.findOne({
      where: { userId: friendId, friendId: user.id },
    });

    if (!groupFriend || !groupFriendMirrow) {
      return next(
        ApiError.badRequest(
          `User with id=${friendId} already not in your group`,
        ),
      );
    }

    const userItems = await Item.findAll({
      where: { userId: user.id },
      attributes: ['id'],
    });
    const userITemsIds = userItems.map(({ id }) => id);

    const friendCategories = await Category.findAll({
      where: { userId: friendId },
      attributes: ['id'],
    });
    const friendCategoriesIds = friendCategories.map(({ id }) => id);

    const userItemsFriendCategories = await ItemCategory.findAll({
      where: {
        itemId: { [Op.in]: userITemsIds },
        categoryId: { [Op.in]: friendCategoriesIds },
      },
    });

    await Promise.all(
      userItemsFriendCategories.map((itemCat) => itemCat.destroy()),
    );

    await groupFriend.destroy();
    await groupFriendMirrow.destroy();

    return res.json({
      message: `User with id=${friendId} removed from your group`,
    });
  },
  async findUser(req, res, next) {
    const { email } = req.query;

    const users = await User.findAll({
      where: { email: { [Op.like]: `%${email}%` } },
      attributes: ['id', 'email'],
    });

    return res.json({ data: { users } });
  },
};
