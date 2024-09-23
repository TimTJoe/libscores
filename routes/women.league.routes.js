var express = require('express');
const upload = require('../middleware/upload');
var router = express.Router();


router.get('/', function(req, res, next) {
    const {tab} = req.params

    let options = { 
        title: 'Women League', 
        logo: "/images/women_league.jpg",
        param: req.params,
        league: "wl",
        page: "women_league",
        tab
    }
   
            res.render('women-league', options );
    
});
router.get('/:tab', function(req, res, next) {
    const {tab} = req.params

    let options = { 
        title: 'Women League', 
        logo: "/images/women_league.jpg",
        league: "wl",
        page: "women_league",
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
        default:
            res.render('women-league', options );
            break;
    }
});

module.exports = router;
