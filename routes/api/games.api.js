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


router.get('/:id/lineups', async (req, res) => {
    const { id } = req.params;

    const db = await createDbConnection();

    try {
        // Query to fetch game, lineup, clubs, and players details
        const query = `
            SELECT 
                games.*,
                games.id AS game_id, 
                games.status, 
                games.period, 
                games.season_id, 
                lineups.team_id, 
                lineups.player_id, 
                lineups.number, 
                lineups.position, 
                lineups.start, 
                clubs.*,
                clubs.id AS club_id,
                clubs.club AS club_name, 
                clubs.badge, 
                clubs.market_value,
                players.*,
                players.id AS player_id,
                players.fullname AS player_name,
                players.DOB, 
                players.country_id,
                players.position AS player_position -- Avoid conflict with lineup.position
            FROM games
            LEFT JOIN lineups ON games.id = lineups.game_id
            LEFT JOIN clubs ON lineups.team_id = clubs.id
            LEFT JOIN players ON lineups.player_id = players.id
            WHERE games.id = ?;
        `;

        const result = await dbAll(db, query, [id]);
        // console.log(result);
        
        if (result.length === 0) {
            return res.status(404).json({ message: 'Game or lineups not found.' });
        }

        // Initialize the response structure
        const game = {
            id: result[0].game_id,
            status: result[0].status,
            period: result[0].period,
            home: result[0].home,
            away: result[0].away,
            start: result[0].start,
            home_goal: result[0].home_goal,
            away_goal: result[0].away_goal,
            lineup: {}
        };

        // Helper object to track teams (to avoid duplicates)
        const teams = {};

        // Grouping teams and their players
        result.forEach(row => {
            const teamId = row.team_id;

            // If team hasn't been added yet, initialize the team object
            if (!teams[teamId]) {
                teams[teamId] = {
                    teamId: row.club_id,
                    teamName: row.club_name,
                    badge: row.badge,
                    stadium: row.stadium,
                    players: [] // This will hold the players for this team
                };
            }

            // Create the player object and add to the respective team's players array
            const player = {
                playerId: row.player_id,
                playerName: row.player_name,
                age: row.DOB,
                nationality: row.country_id,
                position: row.position,
                number: row.number,
                start: row.start
            };
            teams[teamId].players.push(player);
        });

        // Add the teams (teamOne and teamTwo) to the lineup object in the game structure
        const teamIds = Object.keys(teams);
        if (teamIds.length > 0) {
            game.lineup.teamOne = teams[teamIds[0]];  // First team
        }
        if (teamIds.length > 1) {
            game.lineup.teamTwo = teams[teamIds[1]];  // Second team
        }

        // Return the structured game data with team and player details
        res.status(200).json(game);
    } catch (err) {
        handleError(res, err, 'Error fetching game lineups.');
    } finally {
        if (db) {
            db.close();  // Ensure the database connection is closed
        }
    }
});

router.get('/date/:dateId', async (req, res) => {
    const { dateId } = req.params; // Extract the date from the URL
    const db = await createDbConnection(); // Create database connection

    try {
        const query = `
            SELECT g.*, g.id, g.start, ht.*, 
                   ht.club AS homeTeamName, ht.badge AS homeTeamBadge,at.*,
                   at.club AS awayTeamName, at.badge AS awayTeamBadge
            FROM games g
            INNER JOIN clubs ht ON g.home = ht.id
            INNER JOIN clubs at ON g.away = at.id
            WHERE DATE(g.start) = ?
            ORDER BY g.start ASC
        `;

        const games = await dbQuery(db, query, [dateId]); // Query the database with the dateId
        console.log(games)

        // If no games are found, send a message without returning a 404 status
        if (games.length === 0) {
            return res.json({ message: 'No games found for this date.' });
        }

        // Send the retrieved games as a JSON response
        res.json({ games });
    } catch (error) {
        console.error('Error fetching games:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
});


module.exports = router;
