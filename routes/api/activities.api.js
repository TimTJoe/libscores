var express = require('express');
var router = express.Router();
// var county = require('@routes/api/county.routes');

/* GET users listing. */
router.get('/', function(req, res, next) {
    res.render('api', { title: 'Api Testing' });
});


// POST route to add activity
router.post('/', (req, res) => {
    const { game_id, team_id, type, minutes } = req.body;

    const sql = 'INSERT INTO activities (game_id, team_id, type, minutes) VALUES (?, ?, ?, ?)';
    db.run(sql, [game_id, team_id, type, minutes], function(err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        // Emit activity update to all connected clients
        io.emit('activityAdded', {
            id: this.lastID,
            game_id,
            team_id,
            type,
            minutes
        });

        res.status(201).json({ id: this.lastID, game_id, team_id, type, minutes });
    });
});


// router.get('/counties', county.getAll);

module.exports = router;
