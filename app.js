const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const methodOverride = require('method-override')
const session = require('express-session')
const flash = require('connect-flash');
const createError = require('http-errors');
const cors = require('cors');

const dashboardRouter = require('./app/dashboard/router.js');
const biroRouter = require('./app/biro/router.js');
const vacancyRouter = require('./app/vacancy/router.js');
const supervisorRouter = require('./app/supervisor/router.js');
const pegumpegRouter = require('./app/peg-umpeg/router.js');
const pembinaRouter = require('./app/pembina/router.js');
const submissionRouter = require('./app/submission/router.js');
const internRouter = require('./app/intern/router.js');
const placementRouter = require('./app/placement/router.js');
const logbookRouter = require('./app/logbook/router.js');
const scoreRouter = require('./app/score-component/router.js');
const certificateRouter = require('./app/certificate/router.js');

// API
const authRouter = require('./app/authenticate/router.js');
const vacancyRouterAPI = require('./app/vacancy/routerAPI.js');
const submissionRouterAPI = require('./app/submission/routerAPI.js');
const internRouterAPI = require('./app/intern/routerAPI.js');
const logbookRouterAPI = require('./app/logbook/routerAPI.js');
const scoreComponentRouterAPI = require('./app/score-component/routerAPI.js');
const evaluationRouterAPI = require('./app/evaluation/routerAPI.js');
const certificateRouterAPI = require('./app/certificate/routerAPI.js');
const documentRouterAPI = require('./app/document/routerAPI.js');
const dashboardRouterAPI = require('./app/dashboard/routerAPI.js');

const app = express();
const urlAPI = `/api/v1`
app.use(cors())

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
app.use('/intern', internRouter);
app.use('/submission', submissionRouter);
app.use('/placement', placementRouter);
app.use('/logbook', logbookRouter);
app.use('/certificate', certificateRouter);
app.use('/score', scoreRouter);


// APIs
app.use(`${urlAPI}/auth`, authRouter);
app.use(`${urlAPI}/vacancy`, vacancyRouterAPI);
app.use(`${urlAPI}/submission`, submissionRouterAPI);
app.use(`${urlAPI}/intern`, internRouterAPI);
app.use(`${urlAPI}/logbook`, logbookRouterAPI);
app.use(`${urlAPI}/score-component`, scoreComponentRouterAPI);
app.use(`${urlAPI}/evaluation`, evaluationRouterAPI);
app.use(`${urlAPI}/certificate`, certificateRouterAPI);
app.use(`${urlAPI}/dashboard`, dashboardRouterAPI);
app.use(`${urlAPI}/download`, documentRouterAPI);

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
