var router = require('express').Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
    res.render('dashboard/dashboard.ejs', { title: 'Action Center' });
});

module.exports = router;
