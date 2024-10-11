const express = require('express');
const { dbQuery, dbRun, dbGet, dbAll, useLeaguesDB, getGameDetails, getGameActivities, getPlayersInGame, getScorersInGame  } = require('@utils/dbUtils');
const router = express.Router();
const moment = require('moment');

// Helper function to handle errors
const handleError = (res, err, customMessage = 'An error occurred') => {
    console.error(err);
    res.status(500).json({ message: customMessage });
};

// More specific routes go first

// GET all games for a specific date
router.get('/date/:dateId', async (req, res) => {
    const { dateId } = req.params;
    const db = await useLeaguesDB();

    try {
        const query = `
            SELECT g.id, g.start, g.home_goal,g.away_goal,
                   ht.club AS homeTeamName, ht.badge AS homeTeamBadge, 
                   at.club AS awayTeamName, at.badge AS awayTeamBadge
            FROM games g
            INNER JOIN clubs ht ON g.home = ht.id
            INNER JOIN clubs at ON g.away = at.id
            WHERE DATE(g.start) = ?
            ORDER BY g.start ASC
        `;
        const games = await dbQuery(db, query, [dateId]);
        // console.log(games);

        if (games.length === 0) {
            return res.json({ message: 'No games found for this date.' });
        }

        res.json({ games });
    } catch (error) {
        console.error('Error fetching games:', error);
        res.status(500).json({ message: 'Internal server error.', error });
    }
});

// GET lineups for a specific game by ID
router.get('/:id/lineups', async (req, res) => {
    const { id } = req.params;
    const db = await useLeaguesDB();

    try {
        const query = `
           SELECT games.*,
    games.start, games.id AS game_id, games.status, games.period, games.season_id, 
    lineups.team_id, lineups.player_id, lineups.number, lineups.position, lineups.start AS lineup_start, 
    clubs.id AS club_id, clubs.club AS club_name, clubs.badge, clubs.market_value, 
    players.id AS player_id, players.fullname AS player_name, players.DOB, players.country_id, players.position AS player_position
FROM games
LEFT JOIN lineups ON games.id = lineups.game_id
LEFT JOIN clubs ON lineups.team_id = clubs.id
LEFT JOIN players ON lineups.player_id = players.id
WHERE games.id = ?;
`;

        const result = await dbAll(db, query, [id]);
        console.log(result)
        

        if (result.length === 0) {
            return res.status(404).json({ message: 'Game or lineups not found.' });
        }

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

        const teams = {};
        result.forEach(row => {
            const teamId = row.team_id;

            if (!teams[teamId]) {
                teams[teamId] = {
                    teamId: row.club_id,
                    teamName: row.club_name,
                    badge: row.badge,
                    stadium: row.stadium,
                    players: []
                };
            }

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

        const teamIds = Object.keys(teams);
        if (teamIds.length > 0) {
            game.lineup.teamOne = teams[teamIds[0]];
        }
        if (teamIds.length > 1) {
            game.lineup.teamTwo = teams[teamIds[1]];
        }

        res.status(200).json(game);
    } catch (err) {
        handleError(res, err, 'Error fetching game lineups.');
    } finally {
        if (db) {
            db.close();
        }
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
        const db = await useLeaguesDB();
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

// GET all games with modified season structure
router.get('/', async (req, res) => {
    try {
        const db = await useLeaguesDB();
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

// Route to get game activities, goals, and player scorers
router.get('/:id/activities', async (req, res) => {
    const gameId = req.params.id;

    try {
        // Fetch all the necessary data using utility functions
        const gameDetails = await getGameDetails(gameId);
        const activities = await getGameActivities(gameId);
        // const players = await getPlayersInGame(gameId);
        const scorers = await getScorersInGame(gameId);

        // Structure the response data
        const response = {
            game: gameDetails,
            activities: activities,
            scorers: scorers
        };

        // Send the aggregated data as a JSON response
        res.json(response);
    } catch (error) {
        console.error('Error fetching game activities:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});


// GET a single game by ID with season structure
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const db = await useLeaguesDB();
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

module.exports = router;
