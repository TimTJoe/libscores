var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
    res.render('results', { title: 'Results', league: "results" });
});

module.exports = router;
