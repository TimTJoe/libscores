var router = require('express').Router();
const getDbInstance = require('@js/getDBInstance');
var sqlite3 = require("sqlite3").verbose();
var db = getDbInstance(sqlite3)

/* GET home page. */
router.get('/', async function(req, res, next) {
       let options = {
              title: "Update County Meet | Action Center ",
              page: "cm"
       }
       res.render('admin/cm-admin.ejs', options);
});
router.get('/all', async function(req, res, next) {
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



module.exports = router;
