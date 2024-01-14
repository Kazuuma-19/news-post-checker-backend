const express = require('express');
const cors = require('cors');
const indexRouter = require('./routes/index');

const app = express();
app.use(cors())

app.use(indexRouter);

module.exports = app;
