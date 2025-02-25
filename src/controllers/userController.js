const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { check, validationResult } = require('express-validator');
const User = require('../models/User');
const ApiError = require('../errors/ApiError');
const { saveImage, deleteImage } = require('../utils/images');

const HASH_COUNT = 4;
const AVATARS_FOLDER_NAME = 'avatars';

const generateJwt = (data) =>
  jwt.sign(data, process.env.JWT_SECRET_KEY, {
    expiresIn: '24h',
  });

module.exports = {
  registrValidation: [
    check('email', 'Not valid email').normalizeEmail().isEmail(),
    check('password', 'Password must be more than 5 symbols').isLength({
      min: 6,
    }),
  ],
  async registration(req, res, next) {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return next(ApiError.badRequest('Registration failed', errors.array()));
    }

    const { email, password } = req.body;
    const candidate = await User.findOne({ where: { email } });

    if (candidate) {
      return next(
        ApiError.badRequest('Registration error', [
          {
            msg: 'User with such email already existl',
            param: 'email',
          },
        ]),
      );
    }

    const hashPassword = await bcrypt.hash(password, HASH_COUNT);
    const user = await User.create({
      email,
      password: hashPassword,
    });
    const token = generateJwt({ id: user.id, email });

    return res
      .status(201)
      .json({ message: 'User registrated', data: { user, token } });
  },
  async login(req, res, next) {
    const { email, password } = req.body;
    const errorMessage = 'Wrong password or email';

    if (!email || !password) return next(ApiError.badRequest(errorMessage));

    const user = await User.findOne({
      where: { email },
      attributes: ['id', 'name', 'password', 'email', 'avatar'],
    });

    if (!user) return next(ApiError.badRequest(errorMessage));

    const isPassworEqual = bcrypt.compareSync(password, user.password);

    if (!isPassworEqual) return next(ApiError.badRequest(errorMessage));

    const token = generateJwt({ id: user.id, email: user.email });

    return res
      .status(201)
      .json({ message: 'User logged in', data: { user, token } });
  },
  async check(req, res, next) {
    const { id, email } = req.user;
    const token = generateJwt({ id, email });
    const user = await User.findByPk(id);

    if (!user) return next(ApiError.badRequest('User does not exist'));

    return res.json({ message: 'Auth success', data: { user, token } });
  },
  updateValidation: [
    check('email', 'Not valid email')
      .normalizeEmail()
      .isEmail()
      .custom(async (value, { req }) => {
        if (req.user.email === value) return Promise.resolve(value);
        const user = await User.findOne({ where: { email: value } });
        if (user) return Promise.reject('E-mail already in use');
        return Promise.resolve(value);
      }),
    check('oldPassword')
      .optional()
      .custom(async (value, { req }) => {
        if (!value && !req.query.newPassword) return Promise.resolve(value);
        const user = await User.findByPk(req.user.id, {
          attributes: ['password'],
        });
        const isPassworEqual = bcrypt.compareSync(value, user.password);
        if (!isPassworEqual) return Promise.reject('Old password not equal');
        return Promise.resolve(value);
      }),
    check('newPassword', 'Password must be more than 5 symbols')
      .if((value, { req }) => !!req.query.oldPassword)
      .isLength({
        min: 6,
      }),
  ],
  async update(req, res, next) {
    const errorMessage = 'Update user failed';
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return next(ApiError.badRequest(errorMessage, errors.array()));
    }

    const {
      name,
      surname,
      birthday,
      email,
      newPassword,
      avatar: newAvatar,
    } = req.body;
    const user = await User.findByPk(req.user.id, {
      attributes: [
        'id',
        'name',
        'surname',
        'birthday',
        'email',
        'password',
        'avatar',
      ],
    });

    if (!user) return next(ApiError.badRequest(errorMessage));

    let { password, avatar } = user;

    if (newPassword) password = await bcrypt.hash(newPassword, HASH_COUNT);

    if (avatar && avatar !== newAvatar) {
      await deleteImage(avatar).catch((err) =>
        next(ApiError.badRequest(err.message)),
      );
      avatar = null;
    }

    if (req.files && req.files[0]) {
      avatar = saveImage(req.files[0], AVATARS_FOLDER_NAME);
    }

    await user.update({
      name,
      surname,
      birthday: birthday || null,
      email,
      password,
      avatar,
    });

    const token = generateJwt({ id: user.id, email: user.email });

    return res.json({ message: 'User updated', data: { user, token } });
  },
};
