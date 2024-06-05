const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const authRouter = require('./auth/authRouter'); 
const diaryRouter = require('./diary/diaryRouter');
const calendarRouter = require('./calendar/calendarRouter');
const sidebarRouter = require('./sidebar/sidebarRouter');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use("/auth", authRouter);
app.use("/diary", diaryRouter);
app.use("/calendar", calendarRouter);
app.use("/sidebar", sidebarRouter);

module.exports = app;
