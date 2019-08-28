const createError = require('http-errors');
const express = require('express');
const cors = require('cors');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const sassMiddleware = require('node-sass-middleware');
const wsr = require("./lib/wsrouter");
const bodyParser = require('body-parser');
const api_support = require('./api/support');

const indexRouter = require('./routes/index');

let app = express();

app.use(cors());

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(bodyParser.json({ type: 'application/json' ,limit: '1024mb'}));
// TODO: VEr porque falla con type
// app.use(bodyParser.json({ type: 'application/*+json' ,limit: '1024mb'}));

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());
app.use(sassMiddleware({
    src: path.join(__dirname, 'public'),
    dest: path.join(__dirname, 'public'),
    outputStyle: 'compressed',
    indentedSyntax: false, // true = .sass and false = .scss
    sourceMap: true
}));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);

// Adding API routes
wsr.register(app, {
    resourcesDirectory: path.join(__dirname, "api/wiltel"),
    version: "1.0",
    headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-type"
    },
    authenticationFunction: api_support.wiltelAuthenticationFunction

});


// Adding API routes
wsr.register(app, {
    resourcesDirectory: path.join(__dirname, "api/nx"),
    version: "1.0",
    headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-type"
    },
    authenticationFunction: api_support.nxAuthenticationFunction

});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // show error in console
    if(err.status !== 404) console.error(err);

    // render the error page
    res.status(err.status || 500);
    res.render('error');

});


module.exports = app;
