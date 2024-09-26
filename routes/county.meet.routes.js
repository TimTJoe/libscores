var express = require('express');
var router = express.Router();
const getDbInstance = require('@js/getDBInstance');
var sqlite3 = require("sqlite3").verbose();
var db = getDbInstance(sqlite3)


/* GET users listing. */
router.get('/', function(req, res, next) {
    const {tab} = req.query

        let options = { 
            title: 'County Meet', 
            league: "cm", 
            page: "county_meet",
            logo: "/images/county_meet.png",
            tab
            }

        res.render('county-meet', options );
        
});

router.get('/:tab', function(req, res, next) {
    const {tab} = req.params
    let options = { 
        title: 'County Meet', 
        league: "cm", 
        page: "county_meet",
        logo: "/images/county_meet.png",
        tab
     }

  db.all("SELECT * FROM editions", function (err, rows) {
        if(err) { throw new Error(err)} 
        else { 
            console.log(rows)
            options.editions = rows
            switch (tab) {
                case "results":
                    res.render('results', options) 
                    break;
                case "standings":
                    res.render('cm-standings', options) 
                    break;
                case "fixtures":
                    res.render('fixtures', options) 
                    break;
                case "statistics":
                    res.render('statistics', options) 
                    break;
                default:
                    res.render('county-meet', options );
                    break;
            }
        }
    });



});

module.exports = router;
