const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const sassMiddleware = require('node-sass-middleware');
const wsr = require("./lib/wsrouter");
const bodyParser = require('body-parser');

const indexRouter = require('./routes/index');

let app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(bodyParser.json({ type: 'application/*+json' }));

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
    authenticationFunction: (req, res, next) => {

        const token = 'L2W-K0C-A3Q-6DR';

        if(
            req.headers.authorization &&
            req.headers.authorization.toLowerCase().split('bearer ')[1] === token.toLowerCase()
        ){
            next();
        }else{
            res.status(403).send({
                error: 0x0021,
                error_dsc:"Acceso denegado, credenciales inválidas."
            });

        }

    }

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
