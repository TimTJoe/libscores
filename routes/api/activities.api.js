const express = require('express');
const router = express.Router();
// const {  } = require('@utils/dbUtils');
const { getGameDetails, getGameActivities, getPlayersInGame, getScorersInGame ,dbQuery} = require('@utils/dbUtils');



// POST route to add an activity
router.post('/', async (req, res) => {
    const { game_id, team_id, type, minutes } = req.body;

    // SQL query to insert activity
    const activitySql = 'INSERT INTO activities (game_id, team_id, type, minutes) VALUES (?, ?, ?, ?)';

    try {
        // Insert activity
        const result = await dbQuery(activitySql, [game_id, team_id, type, minutes]);

        // Get full game details (with teams)
        const gameDetails = await getGameDetails(game_id);
        if (!gameDetails) {
            return res.status(404).json({ error: 'Game or teams not found' });
        }

        // Determine which team's name to return based on team_id
        const teamName = team_id === gameDetails.home_team.id ? gameDetails.home_team.name : gameDetails.away_team.name;

        // Emit activityAdded event with full details, including the team name instead of team_id
        io.emit('activityAdded', {
            id: result.lastID,  // ID of the newly inserted activity
            game: gameDetails,  // Full game details
            activity: {
                id: result.lastID,
                game: gameDetails,  // Pass the game details instead of just the game_id
                team: teamName,     // Pass the specific team name instead of team_id
                type,
                minutes
            }
        });

        // Respond with success and full details
        res.status(201).json({
            id: result.lastID,
            game: gameDetails,  // Full game details
            activity: {
                id: result.lastID,
                game: gameDetails,  // Pass the game details instead of just the game_id
                team: teamName,     // Pass the specific team name instead of team_id
                type,
                minutes
            }
        });
    } catch (err) {
        console.error('Error adding activity:', err.message);
        res.status(500).json({ error: 'An unexpected error occurred' });
    }
});

// GET route to fetch activities by game_id
router.get('/:game_id', async (req, res) => {
    const { game_id } = req.params;

    try {
        // Fetch game details (including team info)
        const gameDetails = await getGameDetails(game_id);
        if (!gameDetails) {
            return res.status(404).json({ error: 'Game or teams not found' });
        }

        // Query to fetch all activities for the game
        const activitiesSql = `SELECT id, game_id, team_id, type, minutes 
                               FROM activities 
                               WHERE game_id = ?`;
        const activities = await dbQuery(activitiesSql, [game_id]);

        // Modify each activity to replace team_id with team name
        const formattedActivities = activities.map(activity => {
            const teamName = activity.team_id === gameDetails.home_team.id 
                ? gameDetails.home_team.name 
                : gameDetails.away_team.name;

            return {
                id: activity.id,
                game: gameDetails,  // Pass full game details
                team: teamName,     // Replace team_id with team name
                type: activity.type,
                minutes: activity.minutes
            };
        });

        // Respond with the full game details and formatted activities
        res.status(200).json({
            game: gameDetails,
            activities: formattedActivities
        });
    } catch (err) {
        console.error('Error fetching activities:', err.message);
        res.status(500).json({ error: 'An unexpected error occurred' });
    }
});



// Route to get game activities, goals, and player scorers
router.get('/:id/activities', async (req, res) => {
    const gameId = req.params.id;

    try {
        // Fetch all the necessary data using utility functions
        const gameDetails = await getGameDetails(gameId);
        const activities = await getGameActivities(gameId);
        const players = await getPlayersInGame(gameId);
        const scorers = await getScorersInGame(gameId);

        // Structure the response data
        const response = {
            game: gameDetails,
            activities: activities,
            players: players,
            scorers: scorers
        };

        // Send the aggregated data as a JSON response
        res.json(response);
    } catch (error) {
        console.error('Error fetching game activities:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});





module.exports = router;
