const Router = require('express');

const router = new Router();
const userRouter = require('./userRouter');
const itemRouter = require('./itemRouter');
const categoryRouter = require('./categoryRouter');
const groupRouter = require('./groupRouter');
const messageRouter = require('./messageRouter');

router.use('/user', userRouter);
router.use('/item', itemRouter);
router.use('/category', categoryRouter);
router.use('/group', groupRouter);
router.use('/message', messageRouter);

module.exports = router;
