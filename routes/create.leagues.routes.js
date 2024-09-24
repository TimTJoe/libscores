var express = require('express');
const upload = require('@middleware/upload');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
    res.render('create-leagues', { title: 'Create League' });
});

router.post('/', upload.single("league_logo"), function(req, res, next) {
    //TODO: Terryson: add new league record to the leagues table
    //write you code here.
    let logo = req.file.filename
});

module.exports = router;
