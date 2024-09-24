var router = require('express').Router();

router.get('/', async function(req, res, next) {
       let options = {
              title: "Update Women League | Action Center",
              page: "wl"
       }
       res.render('admin/wl-admin.ejs', options);
});

module.exports = router;
