const mongoose = require('mongoose');
const express = require('express');
const cookieParser = require('cookie-parser');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

// @routes
const userRouter = require('./routes/user');
const adminRouter = require('./routes/admin');
const staticDataRouter = require('./routes/staticdata');
const authRouter = require('./routes/auth/authRouter');
const trainerRouter = require('./routes/trainer');

const cors = require('cors');
const corsOptions = require('./config/corsOptions');
const credentials = require('./middleware/credentials');

const PORT = process.env.PORT;
const mongoURI = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@gymappcluster.rs63kkd.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;

mongoose
  .connect(mongoURI)
  .then(() => {
    console.log('Connected to Mongodb');
  })
  .catch(err => console.log(err));

const app = express();
app.use(cookieParser());
app.use(credentials);
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/api/v1/auth/', authRouter);
app.use('/api/v1/user', userRouter);
app.use('/api/v1/admin', adminRouter);
app.use('/api/v1/trainer', trainerRouter);
app.use('/api/v1/static-data', staticDataRouter);

app.use(express.static(path.join(__dirname, '../more-gym-app/build')));

// @NOTE: this line is for development only
app.get('*', (req, res) =>
  res.sendFile(
    path.resolve(__dirname, '../', 'more-gym-app', 'build', 'index.html')
  )
);

app.listen(PORT, () => {
  console.log(`listening on http://localhost:${PORT}`);
});
