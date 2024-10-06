const express = require('express');
const router = express.Router();
const { dbQuery } = require('@utils/dbUtils');

// Helper function to get full game details (including home and away team names)
async function getGameDetails(game_id) {
    // Query to fetch game info
    const gameSql = `SELECT g.id, g.home, g.away, g.start, g.status, g.period, g.home_goal, g.away_goal
                     FROM games g
                     WHERE g.id = ?`;
    const game = await dbQuery(gameSql, [game_id]);
    if (!game.length) return null;  // No game found

    // Query to fetch home and away team info
    const homeTeamSql = `SELECT id, club AS name FROM clubs WHERE id = ?`;
    const awayTeamSql = `SELECT id, club AS name FROM clubs WHERE id = ?`;
    
    const homeTeam = await dbQuery(homeTeamSql, [game[0].home]);
    const awayTeam = await dbQuery(awayTeamSql, [game[0].away]);

    if (!homeTeam.length || !awayTeam.length) return null;  // If no teams found

    // Return the game details with home and away teams
    return {
        id: game[0].id,
        start: game[0].start,
        status: game[0].status,
        period: game[0].period,
        home_goal: game[0].home_goal,
        away_goal: game[0].away_goal,
        home_team: homeTeam[0],
        away_team: awayTeam[0]
    };
}

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

module.exports = router;
