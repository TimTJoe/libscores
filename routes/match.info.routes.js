var express = require('express');
const upload = require('../middlewares/upload');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
    res.render('match-info', { title: 'Match Info' });
});


module.exports = router;
