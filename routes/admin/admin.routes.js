var router = require('express').Router();

/* GET home page. */
router.get('/', async function(req, res, next) {
       res.render('admin/dashboard.ejs', {title: "Contributor Dashboard"});
});

module.exports = router;
