var express = require('express');
const upload = require('../middlewares/upload');
var router = express.Router();



router.get('/', function(req, res, next) {
    const {tab} = req.query

    let options = { 
        title: 'Orange Second Division League', 
        logo: "/images/league_2.jpg",
        league: "l2",
        page: "second_division",
        tab
    }
   
            res.render('second-division', options );
   

     
});
router.get('/:tab', function(req, res, next) {
    const {tab} = req.params

    let options = { 
        title: 'Orange Second Division League', 
        logo: "/images/league_2.jpg",
        league: "l2",
        page: "second_division",
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
            res.render('second-division', options );
            break;
    }

     
});
module.exports = router;
