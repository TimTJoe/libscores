var router = require('express').Router();

/* GET home page. */
router.get('/', async function(req, res, next) {
  let options = { title: 'Tournaments', league: "tournaments" }
  try {
       res.render('ui/tournaments.ejs', options);
  } catch (err) {
    options.err = err
    res.render('ui/tournaments.ejs', options);
  }
});

router.get('/:id', async function(req, res, next) {
  let options = { title: 'Tournaments', league: "tournaments" }
  try {
       res.render('ui/tournaments.ejs', options);
  } catch (err) {
    options.err = err
    res.render('ui/tournaments.ejs', options);
  }
});

module.exports = router;
