var express = require('express');
const upload = require('../middlewares/upload');
var router = express.Router();


router.get('/', function(req, res, next) {

    const options = { 
        title: 'Orange First Division League', 
        logo: "/images/league_1.png",
        league: "l1",
        page: "first_division",
        tab: "/"
    }
    res.render('first-division', options );

});

router.get('/:tab', function(req, res, next) {

    const {tab} = req.params

    const options = { 
        title: 'Orange First Division League', 
        logo: "/images/league_1.png",
        league: "l1",
        page: "first_division",
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
            res.render('first-division', options );
            break;
    }

});


module.exports = router;
