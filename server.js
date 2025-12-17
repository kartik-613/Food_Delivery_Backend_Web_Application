const express = require('express');
const dbConnect = require('./src/config/db');
const dotenv = require('dotenv');
const cors = require('cors');
const mainRouter = require('./src/routers/main.router');
const cookieParser = require('cookie-parser');



dotenv.config();
const PORT = process.env.PORT || 3000;
const app = express();
app.use(express.json());

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,}
));

app.use(cookieParser());
app.use('/api', mainRouter);

dbConnect().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}).catch((err) => {
  console.error("Database connection failed", err);
});
