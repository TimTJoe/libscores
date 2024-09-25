var router = require('express').Router();
const getDbInstance = require('@js/getDBInstance');
var sqlite3 = require("sqlite3").verbose();
var db = getDbInstance(sqlite3)

router.get('/', async function(req, res, next) {
       let options = {
              title: "Update County Meet | Action Center ",
              page: "cm"
       }
       res.render('admin/cm-admin.ejs', options);
});

router.get('/editions/all', async function(req, res, next) {
       try {
       db.all("SELECT * FROM editions", function (err, rows) {
              if(err) {
                     throw new Error(err);
              } else {
                     res.status(200).json({editions: rows})
              }
              });
       } catch (error) {
              res.status(400).json(error)
       }
});

router.post('/', async function(req, res, next) {
       try {
              let {edition,start,end,host} = req.body
              db.run(
                     "INSERT INTO editions VALUES (?,?,?,?,?)",
                     [null, edition, start, end, host],
                     function (err) {
                       if(err) {
                            throw new Error(err);
                       } else {
                            db.all("SELECT * FROM editions WHERE id=?", [this.lastID], function (err, rows) {
                                   if (err)  {
                                          throw new Error(err) }
                                   else {
                                          res.status(200).json({success: true, data: rows});
                                   };
                                 });
                       }
                     }
                   );
       } catch (error) {
              res.status(400).json({error})
       }
});

router.post('/matches', async function(req, res, next) {
       try {
              let {home_team, away_team, score_1, score_2,match_date, start_time, edition_id} = req.body
              db.run(
                     "INSERT INTO county_meet_matches VALUES (?,?,?,?,?,?,?,?)",
                     [null, home_team, away_team, score_1, score_2, start_time, edition_id, match_date],
                     function (err) {
                       if(err) {
                            throw new Error(err);
                       } else {
                            db.all("SELECT * FROM county_meet_matches WHERE id=?", [this.lastID], function (err, rows) {
                                   if (err)  {
                                          throw new Error(err) }
                                   else {
                                          res.status(200).json({success: true, data: rows});
                                   };
                                 });
                       }
                     }
                   );
       } catch (error) {
              res.status(400).json({error})
       }
});

router.get('/matches/all', async function(req, res, next) {
       try {
       db.all("SELECT * FROM county_meet_matches", function (err, rows) {
              if(err) {
                     throw new Error(err);
              } else {
                     res.status(200).json({matches: rows, games: rows})
              }
              });
       } catch (error) {
              res.status(400).json(error)
       }
});

router.get('/matches', async function(req, res, next) {
       let options = {
              title: "Count Meet Matches",
              page: "cmm"
       }
       res.render('admin/cm/match.cm.ejs', options);
});

router.get('/editions', async function(req, res, next) {
       let options = {
              title: "Count Meet Editions",
              page: "cme"
       }
       res.render('admin/cm/edition.cm.ejs', options);
});



module.exports = router;
