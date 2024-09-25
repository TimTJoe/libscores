var express = require('express');
var router = express.Router();
var county = require('@routes/api/county.routes');

/* GET users listing. */
router.get('/', function(req, res, next) {
    res.render('api', { title: 'Api Testing' });
});

router.get('/counties', county.getAll);

module.exports = router;
