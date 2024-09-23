var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
    res.render('league', { title: 'League' });
});

router.post('/create_leagues', function(req, res, next) {
    //TODO: Terryson: add new league record to the leagues table
    //write you code here.
    res.render("create-leagues.ejs", {title: "Create Leagues"})
});

router.get('/create_leagues', function(req, res, next) {
    res.render("create-leagues.ejs", {title: "Create Leagues"})
});

router.get('/first_division', function(req, res, next) {
    res.render('league', { title: 'First Division', logo: "/images/league_1.png"});
});

router.get('/second_division', function(req, res, next) {
    res.render('second_division', { title: 'Second Division'});
});

router.get('/county_meet', function(req, res, next) {
    res.render('county_meet', { title: 'County Meet', logo: "/images/county_meet.png"});
});
router.get('/women_league', function(req, res, next) {
    res.render('league', { title: 'Women League', logo: "/images/women_league.jpg"});
});




module.exports = router;
