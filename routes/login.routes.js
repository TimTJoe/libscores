var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
    res.render('login.ejs', { title: 'Log in' });
});

router.post('/', function(req, res, next) {
   //handle login here
});

module.exports = router;

