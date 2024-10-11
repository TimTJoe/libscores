var router = require('express').Router();
const getDbInstance = require('@js/getDBInstance');
var sqlite3 = require("sqlite3").verbose();
const { useLeaguesDB  } = require('@utils/dbUtils');
const db = useLeaguesDB()
const upload = require('@middleware/upload');

router.get('/', async function(req, res, next) {
       let options = {
              title: "Update County Meet | Action Center ",
              page: "cm"
       }
       res.render('admin/cm-admin.ejs', options);
});


router.post('/editions', async function(req, res, next) {
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

router.get('/editions', async function(req, res, next) {
       let options = {
              title: "Count Meet Editions",
              page: "editions"
       }
       res.render('admin/cm/edition.cm.ejs', options);
});

// county meet matches routes
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

// county meet groups routes
router.get('/groups', async function(req, res, next) {
       let options = {
              title: "Create Grouping ",
              page: "groups"
       }
       res.render('admin/cm/group.cm.ejs', options);
});

router.post('/groups', async function(req, res, next) {
       try {
              let{edition,county,group}= req.body
              db.run(
              "INSERT INTO groups VALUES (?,?,?,?)",
              [null, edition, county, group],
              function (err) {
                     if(err) {
                     throw new Error(err);
                     } else {
                     db.all(
                            "SELECT *, groups.id FROM groups LEFT OUTER JOIN counties ON counties.id=groups.county_id LEFT OUTER JOIN editions ON editions.id=groups.edition_id WHERE groups.groups=?",
                            [group],
                            function (err, rows) {
                                   if (err) {
                                   throw new Error(err);
                            } else {
                                   res.status(200).json({group:rows})
                                   };
                            }
                            );
                     }
              }
              );
       } catch (error) {
              res.status(400).json({error})
       }
});
router.get('/groups/all', async function(req, res, next) {
       try {
              
              db.all(
                     "SELECT *, groups.id FROM groups LEFT OUTER JOIN counties ON counties.id=groups.county_id LEFT OUTER JOIN editions ON editions.id=groups.edition_id",
                     function (err, rows) {
                            if (err) {
                            throw new Error(err);
                     } else {
                            res.status(200).json({groups:rows})
                            };
                     }
                     );
       } catch (error) {
              res.status(400).json({error})
       }
});


router.get('/players', async function(req, res, next) {
       let options = {
              title: "Add New Player ",
              page: "players"
       }
       res.render('admin/cm/players.cm.ejs', options);
});

router.post('/players', upload.single("photo"), async function(req, res, next) {
       let options = {
              title: "Add New Player ",
              page: "players"
       }
       try {
              let photo = req.file.filename
              let{firstName,middleName,lastName,county,DOB}= req.body
              db.run(
              "INSERT INTO county_meet_players VALUES (?,?,?,?,?,?,?)",
              [null,firstName,middleName,lastName,DOB, photo,county],
              function (err) {
                     if(err) {
                            throw new Error(err);
                     } else {
                            res.render('admin/cm/players.cm.ejs', options);
                     }
              }
              );
       } catch (error) {
              res.status(400).json({error})
       }
});


router.get('/players/all', async function(req, res, next) {
       try {
              
              db.all(
                     "SELECT *, county_meet_players.id FROM county_meet_players LEFT OUTER JOIN counties ON counties.id=county_meet_players.county_id",
                     function (err, rows) {
                            if (err) {
                            throw new Error(err);
                     } else {
                            res.status(200).json({players:rows})
                            };
                     }
                     );
       } catch (error) {
              res.status(400).json({error})
       }
});




module.exports = router;
