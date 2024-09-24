var express = require('express');
const upload = require('../middlewares/upload');
var router = express.Router();

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

    switch (tab) {
        case "results":
            res.render('results', options) 
            break;
        case "standings":
            res.render('standings', options) 
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

});

module.exports = router;
