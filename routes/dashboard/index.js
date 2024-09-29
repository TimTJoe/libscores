var router = require('express').Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
    res.render('dashboard', { title: 'Action Center' });
});

module.exports = router;
