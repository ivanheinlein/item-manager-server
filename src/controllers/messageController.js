const ApiError = require('../errors/ApiError');
const Message = require('../models/Message');
const User = require('../models/User');

module.exports = {
  async getAll(req, res, next) {
    const receiverId = req.user.id;
    const messages = await Message.findAll({
      where: { receiverId },
      include: User,
    });
    return res.json({ data: { messages } });
  },
  async createOne(req, res, next) {
    const userId = req.user.id;
    const { receiverId, type, text } = req.body;
    const messege = await Message.create({ userId, receiverId, type, text });

    return res.json({ data: { messege } });
  },
  async deleteOne(req, res, next) {
    const messageId = req.params.id;
    const message = await Message.findByPk(messageId);

    if (!message) {
      return next(
        ApiError.badRequest(`Message with id=${messageId} is not exist`),
      );
    }

    await message.destroy();

    return res.json({ message: `Message id="${messageId}" deleted` });
  },
};
