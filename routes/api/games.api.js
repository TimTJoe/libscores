const express = require('express');
const { dbQuery, dbRun, dbGet, dbAll, createDbConnection } = require('@utils/dbUtils');
const router = express.Router();
const moment = require('moment');

// Helper function to handle errors
const handleError = (res, err, customMessage = 'An error occurred') => {
    console.error(err);
    res.status(500).json({ message: customMessage });
};

// GET all games with modified season structure
router.get('/', async (req, res) => {
    try {
        const db = await createDbConnection();

        // Query to fetch all games with season details
        const query = `
            SELECT 
                games.*, 
                seasons.competition_id, 
                seasons.start AS season_start, 
                seasons.end AS season_end,
                seasons.teams AS season_teams,
                seasons.status AS season_status,
                COUNT(games.id) AS games_played
            FROM games
            LEFT JOIN seasons ON games.season_id = seasons.id
            GROUP BY seasons.id
            ORDER BY games.start DESC;
        `;

        const games = await dbQuery(db, query);

        if (!games.length) {
            return res.status(404).json({ message: 'No games found.' });
        }

        res.status(200).json(games);
    } catch (err) {
        handleError(res, err, 'Error fetching games.');
    }
});

// GET a single game by ID with season structure
router.get('/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const db = await createDbConnection();
        const query = `
            SELECT 
                games.*, 
                seasons.competition_id, 
                seasons.start AS season_start, 
                seasons.end AS season_end,
                seasons.teams AS season_teams,
                seasons.status AS season_status
            FROM games
            LEFT JOIN seasons ON games.season_id = seasons.id
            WHERE games.id = ?;
        `;

        const game = await dbGet(db, query, [id]);

        if (!game) {
            return res.status(404).json({ message: 'Game not found.' });
        }

        res.status(200).json(game);
    } catch (err) {
        handleError(res, err, 'Error fetching game.');
    }
});

// PUT to update game period (first half, second half, half-time)
router.put('/:id/period', async (req, res) => {
    const { id } = req.params;
    const { period } = req.body;

    if (!['first', 'halftime', 'second', 'fulltime'].includes(period)) {
        return res.status(400).json({ message: 'Invalid period value. It must be "first", "halftime", "second", or "fulltime".' });
    }

    try {
        const db = await createDbConnection();
        const result = await dbRun(db, 'UPDATE games SET period = ? WHERE id = ?', [period, id]);

        if (result.changes === 0) {
            return res.status(404).json({ message: 'Game not found.' });
        }

        const updatedGame = await dbGet(db, 'SELECT * FROM games WHERE id = ?', [id]);
        res.status(200).json(updatedGame);
    } catch (err) {
        handleError(res, err, 'Error updating game period.');
    }
});

// Route to calculate and return the current game time (in minutes)
router.get('/:id/game-time', async (req, res) => {
    const { id } = req.params;

    try {
        const db = await createDbConnection();
        const game = await dbGet(db, 'SELECT start, status, period FROM games WHERE id = ?', [id]);

        if (!game) {
            return res.status(404).json({ message: 'Game not found.' });
        }

        if (game.status === 'ended' || game.period === 'fulltime') {
            return res.status(200).json({ message: '90 minutes full time.' });
        }

        if (game.period === 'halftime') {
            return res.status(200).json({ message: 'Half-time.' });
        }

        // Calculate the minutes since the game started
        const startTime = moment(game.start, 'YYYY-MM-DD HH:mm:ss');
        const now = moment();
        const duration = moment.duration(now.diff(startTime));
        const minutesPassed = Math.floor(duration.asMinutes());

        if (minutesPassed >= 45 && game.period === 'first') {
            return res.status(200).json({ message: '45 minutes half-time.' });
        }

        if (minutesPassed >= 90 && game.period === 'second') {
            return res.status(200).json({ message: '90 minutes full-time.' });
        }

        res.status(200).json({ current_minutes: minutesPassed });
    } catch (err) {
        handleError(res, err, 'Error calculating game time.');
    }
});

module.exports = router;
