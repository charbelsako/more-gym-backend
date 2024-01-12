require('dotenv').config();
const mongoose = require('mongoose');
const express = require('express');

// @routes
const userRouter = require('./routes/user');
const adminRouter = require('./routes/admin');
const staticDataRouter = require('./routes/staticdata');
// const trainerRouter = require('./routes/trainer');

const PORT = process.env.PORT;
const mongoURI = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@gymappcluster.rs63kkd.mongodb.net/?retryWrites=true&w=majority`;

mongoose
  .connect(mongoURI)
  .then(() => {
    console.log('Connected to Mongodb');
  })
  .catch(err => console.log(err));

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/api/v1/user', userRouter);
app.use('/api/v1/admin', adminRouter);
app.user('/api/v1/static-data', staticDataRouter);
// app.use('/api/v1/trainer', trainerRouter);

app.listen(PORT, () => {
  console.log(`listening on http://localhost:${PORT}`);
});
