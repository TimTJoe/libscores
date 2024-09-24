var router = require('express').Router();

router.get('/', async function(req, res, next) {
       let options = {
              title: "Update Second Division League | Action Center",
              page: "sd"
       }
       res.render('admin/sd-admin.ejs', options);
});

module.exports = router;
