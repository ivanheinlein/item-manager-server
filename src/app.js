const path = require('path');

const logger = require('morgan');
const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const multer = require('multer');
const upload = multer();

const models = require('./models/index');
const indexRouter = require('./routes/index');
const errorHandler = require('./middleware/errorHandingMiddleware');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(upload.any());
app.use(express.static(path.resolve(__dirname, '../static')));
app.use('/api', indexRouter);

app.use(errorHandler);

module.exports = app;
