var router = require('express').Router();
const getDbInstance = require('@js/getDBInstance');
var sqlite3 = require("sqlite3").verbose();
const { useLeaguesDB  } = require('@utils/dbUtils');
const db = useLeaguesDB()

/* GET home page. */
router.get('/', async function(req, res, next) {
       let options = {
              title: "Action Center",
              page: "admin"
       }
       res.render('admin/dashboard.ejs', options);
});

router.get('/counties/all', async function(req, res, next) {
       try {
              db.all("SELECT * FROM counties", function (err, rows) {
                     if(err) {
                            throw new Error(err);
                     } else {
                            res.status(200).json({counties: rows})
                     }
                     });
              } catch (error) {
                     res.status(400).json(error)
              }
});

module.exports = router;
