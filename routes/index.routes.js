var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', async function(req, res, next) {
  let leagues = {}
  let options = { title: 'libScores', league: "/" }
  try {
       res.render('index', options);
  } catch (err) {
    options.err = err
    res.render('index', options);
  }
});

module.exports = router;
