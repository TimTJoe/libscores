var router = require('express').Router();
router.get('/', async function(req, res, next) {
       let options = {
              title: "Update First Division League | Action Center",
              page: "fd"
       }
       res.render('admin/fd-admin.ejs', options);
});

module.exports = router;
