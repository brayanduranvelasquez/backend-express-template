const bodyparser = require('body-parser');
const mongoose = require('mongoose');
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');

require('dotenv').config();

const app = express();

app.use(bodyparser.urlencoded({ extended: false }));
app.use(bodyparser.json());

var corsOptions = {
  origin: '*',
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));

const uri = `mongodb+srv://${process.env.USER}:${process.env.PASSWORD}@${process.env.DBNAME}.ygcal9t.mongodb.net/?retryWrites=true&w=majority`;

mongoose
  .connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Base de datos conectada'))
  .catch((e) => console.log('error db:', e));

app.use('/api/user', authRoutes);

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`servidor andando en: ${PORT}`);
});
