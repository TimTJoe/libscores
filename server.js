const dotenv = require('dotenv');
dotenv.config();
require('module-alias/register');
var cookieParser = require('cookie-parser');
var path = require('path');
var logger = require('morgan');
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const app = express();
const server = http.createServer(app);  // Create the HTTP server instance
const io = new Server(server);          // Initialize Socket.io with the server
app.use((req, res, next) => {
  req.io = io;
  next();
});

var cors = require("cors");
var port = process.env.PORT || '3000'
var protected = require("@middleware/restrict");
var session = require("express-session");
var SQLiteStore = require("connect-sqlite3")(session)


app.use(cors()) 
app.use(
  session({
    store: new SQLiteStore,
    secret: "RSTUVWXYZabcdefghijklmyz0123456789!@#$%^&*()_+[]{}|;:,.<>?",
    resave: true,
    saveUninitialized: false,
    cookie: { 
      secure: false, 
      // maxAge: 7*24*60*60*1000, //1 week
      maxAge: 60*60*1000, //1 hr
    },
  }));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
// Export io for use in other files

// leagues and frontend routes
var liveRouter = require('./routes/live.routes');
var resultRouter = require('./routes/results.routes');
var fixtureRouter = require('./routes/fixtures.routes');
var leaguesRouter = require('./routes/league.routes');
const teamRoutes = require('./routes/team.routes');
var apiRouter = require('./routes/api');
var firstDivisionRouter = require('./routes/first.division.routes');
var countyMeetRouter = require('./routes/county.meet.routes');
var secondDivisionRouter = require('./routes/second.division.routes');
var womenLeagueRouter = require('./routes/women.league.routes');
var matchInfoRouter = require('./routes/match.info.routes');
var signupRouter = require('./routes/signup.routes');
const searchRoutes = require('./routes/search.routes'); 

// dashboard/admin routes
var adminRouter = require('./routes/admin/admin.routes');
var cmRouter = require('./routes/admin/cm.routes');
var fdRouter = require('./routes/admin/fd.routes');
var sdRouter = require('./routes/admin/sd.routes');
var wlRouter = require('./routes/admin/wl.routes');
var loginRouter = require('./routes/login.routes');
var tournamentsRouter = require('./routes/tournaments');


// NEW UI ROUTES HANDLERS
var homeUIRouter = require('./routes/ui/index.ui.routes');

// Routes handlers
app.use('/', homeUIRouter);
app.use('/live', liveRouter);
app.use('/results', resultRouter);
app.use('/fixtures', fixtureRouter);
app.use('/leagues', leaguesRouter);
app.use('/', teamRoutes); 
app.use('/search', searchRoutes); 
app.use('/tournaments', tournamentsRouter);


// app.use('/create_leagues', createLeaguesRouter);
app.use('/first_division', firstDivisionRouter);
app.use('/second_division', secondDivisionRouter);
app.use('/women_league', womenLeagueRouter);
app.use('/county_meet', countyMeetRouter);
app.use('/match_info', matchInfoRouter);
app.use('/signup', signupRouter);

app.use('/admin', adminRouter);
app.use('/admin/cm', cmRouter);
app.use('/admin/fd', fdRouter);
app.use('/admin/sd', sdRouter);
app.use('/admin/wl', wlRouter);

// DASHBOARD ROUTES
// dashboard routes
var dashboardRouter = require('./routes/dashboard');
var clubsRouter = require('./routes/dashboard/clubs.routes');
var competitionRouter = require('./routes/dashboard/competition.routes');
var seasonRouter = require('./routes/dashboard/season.routes');
var phaseRouter = require('./routes/dashboard/phase.routes');
var gamesRouter = require('./routes/dashboard/games.routes');
var playersRouter = require('./routes/dashboard/players.routes');
var tournamentsDashRouter = require('./routes/dashboard/tournaments.routes');
var teamsDashRouter = require('./routes/dashboard/teams.routes');


// DASHBOARD ROUTES HANDLERS
app.use("/dashboard", protected)
app.use("/dashboard", dashboardRouter)
app.use("/dashboard/clubs", clubsRouter)
app.use("/dashboard/competitions", competitionRouter)
app.use("/dashboard/seasons", seasonRouter)
app.use("/dashboard/phases", phaseRouter)
app.use("/dashboard/games", gamesRouter)
app.use("/dashboard/players", playersRouter)
app.use("/dashboard/tournaments", tournamentsDashRouter)
app.use("/dashboard/teams", teamsDashRouter)


// fetch data api routes
var countyRouter = require('./routes/api/county.routes');
var clubApiRouter = require('./routes/api/clubs.api');
var creatorRouter = require('./routes/api/creator.routes')
var gamesApiRouter = require('./routes/api/games.api')
var competitionsApiRouter = require('./routes/api/competitions.api')
var activitiesApiRouter = require('./routes/api/activities.api');
var tournamentsApiRouter = require('./routes/api/tournaments.api');
var ajaxApiRouter = require('./routes/api/ajax.api');

const { createLeagueTables, createTournamentTables } = require('./utils/tablesUtils');
// CREATE TABLES FOR LEAGUES DB
createLeagueTables()
//CREATE TABLE FOR TOURNAMENTS DB
createTournamentTables()

// API v1 Endpoints
app.use("/counties", countyRouter)
app.use("/v1/api/counties", countyRouter)
app.use("/login", loginRouter)
app.use("/v1/api", apiRouter)
app.use("/v1/api/clubs", clubApiRouter)
app.use("/v1/api/creates", creatorRouter)
app.use("/v1/api/games", gamesApiRouter)
app.use("/v1/api/competitions", competitionsApiRouter) 
app.use("/v1/api/activities", activitiesApiRouter)
app.use("/v1/api/tournaments", tournamentsApiRouter)
app.use("/v1/api/ajax", ajaxApiRouter)


// Listen for socket connections
io.on('connection', (socket) => {
  console.log('a socket.io user connected');

  // Optional: Handle disconnect
  socket.on('disconnect', () => {
      console.log('user socket.io disconnected');
  });
});

// Export io for use in other files
module.exports = io;

// start server
server.listen(port, function listener() {
  console.log(`App is listening at http//localhost:${port}`);
});
