require('module-alias/register');
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require("express-session")
var SQLiteStore = require("connect-sqlite3")(session)
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var liveRouter = require('./routes/live.routes');
var leaguesRouter = require('./routes/league.routes');
var teamsRouter = require('./routes/team.routes');
var apiRouter = require('./routes/api.routes');
var apiRouter = require('./routes/api.routes');
var createLeaguesRouter = require('./routes/create.leagues.routes');
var firstDivisionRouter = require('./routes/first.division.routes');
var countyMeetRouter = require('./routes/county.meet.routes');
var secondDivisionRouter = require('./routes/second.division.routes');
var womenLeagueRouter = require('./routes/women.league.routes');
var matchInfoRouter = require('./routes/match.info.routes');
var signupRouter = require('./routes/signup.routes');
const db = require('@js/db');
var cors = require("cors")
var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(
  session({
    store: new SQLiteStore,
    secret: "RSTUVWXYZabcdefghijklmyz0123456789!@#$%^&*()_+[]{}|;:,.<>?",
    resave: true,
    saveUninitialized: false,
    cookie: { 
      secure: false, 
      maxAge: 60*60*1000, //1 hr
    },
  }));
app.use(cors()) 

db.serialize(() => {
  db.run('CREATE TABLE IF NOT EXISTS Leagues( ID INTEGER  PRIMARY KEY AUTOINCREMENT, Name VARCHAR(50) NOT NULL, logo VARCHAR(50) NOT NULL)');
    db.run('CREATE TABLE IF NOT EXISTS teams( id INTEGER  PRIMARY KEY AUTOINCREMENTxt, name VARCHAR(50) NOT NULL, logo VARCHAR(50) NOT NULL)');
    db.run('CREATE TABLE IF NOT EXISTS groups( id INTEGER  PRIMARY KEY AUTOINCREMENT, team VARCHAR(50) NOT NULL, year DATE NOT NULL)');
    db.run('CREATE TABLE IF NOT EXISTS goals( id INTEGER  PRIMARY KEY AUTOINCREMENT, player_id INTEGER NOT NULL, match_id INTEGER NULL, goal VARCHAR(50) NOT NULL)');
    db.run('CREATE TABLE IF NOT EXISTS matches( home VARCHAR(50) NOT NULL, away VARCHAR(50) NOT NULL, start VARCHAR(50) NOT NULL, end VARCHAR(50) NOT NULL, status VARCHAR(50) NOT NULL)');
    db.run('CREATE TABLE IF NOT EXISTS cards( id INTEGER  PRIMARY KEY AUTOINCREMENT, card VARCHAR(50) NOT NULL, pllayer_id INTEGER NOT NULL, match_id INTEGER NOT NULL)');
    db.run('CREATE TABLE IF NOT EXISTS scores( id INTEGER  PRIMARY KEY AUTOINCREMENT, home_score INTEGER NOT NULL, away_score INTEGER NOT NULL, home_team_id VARCHAR(50) NOT NULL, away_team_id INTEGER NOT NULL, match_id INTEGER NOT NULL)');
    db.run('CREATE TABLE IF NOT EXISTS timer( id INTEGER  PRIMARY KEY AUTOINCREMENT, minutes NUMERIC NOT NULL, second NUMERIC NOT NULL, extra_time NUMERIC NOT NULL, period VARCHAR NOT NULL)');
    db.run('CREATE TABLE IF NOT EXISTS players(id INTEGER  PRIMARY KEY AUTOINCREMENT,  first_name VARCHAR(50)  NOT NULL, middle_name VARCHAR(50)NULL, last_name VARCHAR(50) NOT NULL, DOB DATE NOT NULL, team_id INTEGER NOT NULL, player_id INTEGER NOT NULL)');
});

// Routes handlers
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/users', usersRouter);
app.use('/live', liveRouter);
app.use('/leagues', leaguesRouter);
app.use('/teams', teamsRouter);
app.use('/api', apiRouter);
app.use('/create_leagues', createLeaguesRouter);
app.use('/first_division', firstDivisionRouter);
app.use('/second_division', secondDivisionRouter);
app.use('/women_league', womenLeagueRouter);
app.use('/county_meet', countyMeetRouter);
app.use('/match_info', matchInfoRouter);
app.use('/signup', signupRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
