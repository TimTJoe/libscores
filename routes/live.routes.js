var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
    res.render('live', { title: 'Live', league: "live" });
});

module.exports = router;
