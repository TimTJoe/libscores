const getDbInstance = require('@js/getDBInstance');
var sqlite3 = require("sqlite3").verbose();
var db = getDbInstance(sqlite3)
var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
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

