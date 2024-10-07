var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', async function(req, res, next) {
  let options = { title: 'libScores', league: "/" }
  try {
       res.render('ui/home.ui.ejs', options);
  } catch (err) {
    options.err = err
    res.render('ui/home.ui.ejs', options);
  }
});


module.exports = router;
