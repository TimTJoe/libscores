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
router.get('/results', async function(req, res, next) {
  let leagues = {}
  let options = { title: 'Results', league: "results" }
  try {
       res.render('live', options);
  } catch (err) {
    options.err = err
    res.render('live', options);
  }
});
router.get('/fixtures', async function(req, res, next) {
  let leagues = {}
  let options = { title: 'Fixtures', league: "fixtures" }
  try {
       res.render('live', options);
  } catch (err) {
    options.err = err
    res.render('live', options);
  }
});
router.get('/live', async function(req, res, next) {
  let leagues = {}
  let options = { title: 'Live', league: "live" }
  try {
       res.render('live', options);
  } catch (err) {
    options.err = err
    res.render('live', options);
  }
});

module.exports = router;
