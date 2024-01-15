const express = require('express');
const cors = require('cors');
const indexRouter = require('./routes/index');

const app = express();
app.use(cors({
  origin: 'http://localhost:5173'
}))

app.use(indexRouter);

module.exports = app;
