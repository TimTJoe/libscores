var router = require('express').Router()
var sqlite3 = require("sqlite3").verbose();
var getDbInstance = require('@js/getDBInstance');
const { useLeaguesDB  } = require('@utils/dbUtils');
const db = useLeaguesDB()

router.get('/', function(req, res, next) {
    res.render("login.ejs", {title: "Login"})
});

router.post("/", (req, res, next) => {
    let { username, password } = req.body;
         db.all(
            "SELECT * FROM auth WHERE username=?",[username],
            function (err, rows) {
                if (err || rows.length === 0 || password !== rows[0]?.password) {
                    res.json({
                        err,
                        success: false, 
                        msg: "Username or password Incorrect."
                    })
                } else {
                    req.session.user = rows[0]
                    res.json({user:rows, success: true, msg: ""})};
            }
        );
       
  });

module.exports = router;
