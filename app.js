const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const methodOverride = require('method-override')
const session = require('express-session')
const flash = require('connect-flash');
const createError = require('http-errors');

const dashboardRouter = require('./app/dashboard/router.js');
const biroRouter = require('./app/biro/router.js');
const vacancyRouter = require('./app/vacancy/router.js');
const supervisorRouter = require('./app/supervisor/router.js');
const pegumpegRouter = require('./app/peg-umpeg/router.js');
const pembinaRouter = require('./app/pembina/router.js');
// const submissionRouter = require('./app/submission/router.js');

// API
const authRouter = require('./app/auth/router.js');

const app = express();

const urlAPI = `/api/v1`

//konfig express-session dan flash
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}))
app.use(flash());

app.use(methodOverride('_method'))

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// config admin-lte
app.use('/adminlte', express.static(path.join(__dirname, '/node_modules/admin-lte/')))

app.use('/', dashboardRouter);
app.use('/biro', biroRouter);
app.use('/vacancy', vacancyRouter);
app.use('/supervisor', supervisorRouter);
app.use('/pegumpeg', pegumpegRouter);
app.use('/pembina', pembinaRouter);
// app.use('/submission', submissionRouter);

// app.use(`${urlAPI}/auth`, authRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
