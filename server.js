const dotenv = require('dotenv');
dotenv.config();
require('module-alias/register');
var cookieParser = require('cookie-parser');
var express = require('express');
var path = require('path');
var logger = require('morgan');
var indexRouter = require('./routes/index.routes');
var liveRouter = require('./routes/live.routes');
var leaguesRouter = require('./routes/league.routes');
var teamsRouter = require('./routes/team.routes');
var apiRouter = require('./routes/api');
var createLeaguesRouter = require('./routes/create.leagues.routes');
var firstDivisionRouter = require('./routes/first.division.routes');
var countyMeetRouter = require('./routes/county.meet.routes');
var secondDivisionRouter = require('./routes/second.division.routes');
var womenLeagueRouter = require('./routes/women.league.routes');
var matchInfoRouter = require('./routes/match.info.routes');
var loginRouter = require('./routes/login.routes');
var signupRouter = require('./routes/signup.routes');
var countyRouter = require('./routes/api/county.routes');

var adminRouter = require('./routes/admin/admin.routes');
var cmRouter = require('./routes/admin/cm.routes');
var fdRouter = require('./routes/admin/fd.routes');
var sdRouter = require('./routes/admin/sd.routes');
var wlRouter = require('./routes/admin/wl.routes');


var cors = require("cors");
const getDbInstance = require('@js/getDBInstance');
var app = express();
var port = process.env.PORT || '3000'
var sqlite3 = require("sqlite3").verbose();
var restrict = require("@middleware/restrict");
var session = require("express-session");
var SQLiteStore = require("connect-sqlite3")(session)



// view engine setup
app.use(
  session({
    store: new SQLiteStore,
    secret: "RSTUVWXYZabcdefghijklmyz0123456789!@#$%^&*()_+[]{}|;:,.<>?",
    resave: true,
    saveUninitialized: false,
    cookie: { 
      secure: false, 
      // maxAge: 7*24*60*60*1000, //1 week
      maxAge: 60*60*1000, //1 min
    },
  }));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors()) 

//create database table
const db = getDbInstance(sqlite3)

db.serialize(function createDB() {
  db.run("CREATE TABLE IF NOT EXISTS editions (id INTEGER PRIMARY KEY AUTOINCREMENT,  edition VARCHAR(50) NOT NULL UNIQUE, start DATE NOT NULL, end DATE NOT NULL, host VARCHAR(50) NOT NULL)");
  db.run("CREATE TABLE IF NOT EXISTS counties(id INTEGER PRIMARY KEY AUTOINCREMENT,  county VARCHAR(50)  NOT NULL, flag VARCHAR(50) NULL)");
  db.run("CREATE TABLE IF NOT EXISTS county_meets(id INTEGER PRIMARY KEY AUTOINCREMENT,  county VARCHAR(50) NOT NULL, team_group VARCHAR(15) NOT NULL, edition_id INTEGER NOT NULL)");
  db.run("CREATE TABLE IF NOT EXISTS county_meet_matches(id INTEGER PRIMARY KEY AUTOINCREMENT,  home_team VARCHAR(50) NOT NULL, away_team VARCHAR(50) NOT NULL, score_1 INTEGER NULL, score_2 INTEGER NULL, start_time DATE NOT NULL, edition_id INTEGER NOT NULL)");
  db.run("CREATE TABLE IF NOT EXISTS county_meet_corners(id INTEGER PRIMARY KEY AUTOINCREMENT,  team_id INTEGER NOT NULL, corner_time VARCHAR(50) NOT NULL, match_id INTEGER NOT NULL)");
  db.run("CREATE TABLE IF NOT EXISTS county_meet_substitution(id INTEGER PRIMARY KEY AUTOINCREMENT,  player_in_id INTEGER NOT NULL, player_out_id INTEGER NOT NULL,  sub_time VARCHAR(50) NOT NULL, match_id INTEGER NOT NULL)");
  db.run("CREATE TABLE IF NOT EXISTS county_meet_players(id INTEGER  PRIMARY KEY AUTOINCREMENT,  first_name VARCHAR(50)  NOT NULL, middle_name VARCHAR(50) NULL, last_name VARCHAR(50) NOT NULL, DOB DATE NOT NULL, photo VARCHAR(50) NULL, county_id INTEGER NOT NULL)");
  db.run("CREATE TABLE IF NOT EXISTS county_meet_goals(id INTEGER  PRIMARY KEY AUTOINCREMENT,  player_id VARCHAR(50)  NOT NULL, match_id INTEGER NOT NULL, goal INTEGER NOT NULL)");
  db.run("CREATE TABLE IF NOT EXISTS county_meet_cards(id INTEGER  PRIMARY KEY AUTOINCREMENT,  player_id VARCHAR(50)  NOT NULL, match_id INTEGER NOT NULL, card INTEGER NOT NULL, card_time VARCHAR(50) NOT NULL)");
  db.run("CREATE TABLE IF NOT EXISTS county_meet_standing(id INTEGER  PRIMARY KEY AUTOINCREMENT,  county_meet_id INTEGER NOT NULL, county_id INTEGER NOT NULL, play INTEGER NOT NULL, win INTEGER NOT NULL, loss INTEGER NOT NULL, draws INTEGER NOT NULL, goals_for INTEGER NOT NULL, goals_against INTEGER NOT NULL, points INTEGER NOT NULL)");
  db.run("CREATE TABLE IF NOT EXISTS county_meet_match_lineup(id INTEGER  PRIMARY KEY AUTOINCREMENT,  player_id INTEGER NOT NULL, county_id INTEGER NOT NULL, match_id INTEGER NOT NULL)");
});

// Routes handlers
app.use('/', indexRouter);
app.use('/live', liveRouter);
app.use('/leagues', leaguesRouter);
app.use('/teams', teamsRouter);
app.use('/create_leagues', createLeaguesRouter);
app.use('/first_division', firstDivisionRouter);
app.use('/second_division', secondDivisionRouter);
app.use('/women_league', womenLeagueRouter);
app.use('/county_meet', countyMeetRouter);
app.use('/match_info', matchInfoRouter);
app.use('/signup', signupRouter);

app.use("/counties", countyRouter)
app.use('/api', apiRouter);

// dashboard route handlers
app.use('/login', loginRouter);
// app.use("/admin", restrict)
app.use('/admin', adminRouter);
app.use('/admin/cm', cmRouter);
app.use('/admin/fd', fdRouter);
app.use('/admin/sd', sdRouter);
app.use('/admin/wl', wlRouter);


// start server
app.listen(port, function listener() {
  console.log(`App is listening at http//localhost:${port}`);
});
