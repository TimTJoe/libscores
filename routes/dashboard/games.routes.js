const express = require('express');
const { dbQuery, dbRun, dbGet, dbAll,getGameDetails, useLeaguesDB  } = require('@utils/dbUtils');
const router = express.Router();
const moment = require('moment');
const games = require('@/data/games.json'); // Mock "database"
const { getGameById, updateGameScore, insertScorer, getPlayerById } = require('@utils/gameUtils');

// Helper function to handle errors
const handleError = (res, err, customMessage = 'An error occurred') => {
    console.error(err);
    res.status(500).json({ message: customMessage });
};


// Route to handle redirect and render games for the current date
router.get('/', async (req, res) => {
    try {
        // Get the current date in 'YYYY-MM-DD' format
        const todayDate = moment().format('YYYY-MM-DD');
        
        // Redirect the user to the URL with the current date
        res.redirect(`/dashboard/games/${todayDate}`);
    } catch (err) {
        console.error('Error fetching games:', err);
        res.status(500).send('Internal server error.');
    }
});


router.get("/new", async (req,res) => {
    res.render("dashboard/games.form.ejs", {title: "New Game"})
})

router.get("/timer", async (req,res) => {
    res.render("dashboard/timer.ejs", {title: "live games", games})
})


router.post('/', async (req, res) => {
    const { homeTeamId, awayTeamId, homeGoals, awayGoals, gameTime, seasonId, players } = req.body;

    const db = await useLeaguesDB();
    try {


        // Calculate game status and period based on the gameTime
        const { status, period } = calculateGameStatusAndPeriod(gameTime);
    
        
        // Begin a transaction
        await dbRun(db, 'BEGIN TRANSACTION');

        // Insert the game details into the 'games' table (let the ID auto-increment)
        const gameInsertQuery = `
            INSERT INTO games VALUES (?,?, ?, ?, ?, ?, ?, ?, ?);
        `;

        await dbRun(db, gameInsertQuery, [
            null,
            homeTeamId, 
            awayTeamId, 
            gameTime, 
            status, 
            period || 'pending', 
            homeGoals || 0, 
            awayGoals || 0, 
            seasonId
        ]);

        // Get the last inserted game ID
        const gameIdResult = await dbGet(db, 'SELECT last_insert_rowid() as lastId');
        const gameId = gameIdResult.lastId;

        // Prepare the insert query for the lineups table
        const insertLineupQuery = `
            INSERT INTO lineups  VALUES (?,?, ?, ?, ?, ?, ?);
        `;

        // Use a prepared statement for bulk insertion
        const stmt = db.prepare(insertLineupQuery);

        // Insert each player's lineup data
        players.forEach(player => {
            const { playerId, teamId, number, position, start } = player;
            stmt.run(null,gameId, teamId, playerId, number, position, start);
        });

        // Finalize the prepared statement
        stmt.finalize();

        // Commit the transaction
        await dbRun(db, 'COMMIT');

        res.status(200).json({ message: 'Game and lineups saved successfully!', gameId });
    } catch (err) {
        console.error('Error saving game or inserting lineups:', err);
        await dbRun(db, 'ROLLBACK');
        res.status(500).json({ message: 'An error occurred while saving the game and lineups.' });
    } finally {
        if (db) {
            db.close(); // Always close the database connection if initialized
        } // Always close the database connection
    }
});


router.get("/:id/game", async (req, res) => {
    res.render("dashboard/game.info.ejs", {title: "Games info", gameId: req.params.id})
})

// Route to render games for a specific date and pass the date to the frontend
router.get('/:dateId', async (req, res) => {
    const { dateId } = req.params;

    try {
        // Pass the dateId to the EJS template for use in the frontend
        res.render('dashboard/games.dash.ejs', { 
            title: `Games for ${dateId}`,
            dateId: dateId // Pass the date to be used in the frontend
        });
    } catch (err) {
        console.error('Error fetching games:', err);
        res.status(500).send('Internal server error.');
    }
});

router.put('/:game_id/score', async (req, res) => {
    let io = req.io;

    const { team_id, minutes, player_id } = req.body; // Get team_id, minutes, and player_id from the request
    const { game_id } = req.params; // Get game_id from the request parameters

    try {
        // Fetch the game details using the utility function
        const game = await getGameById(game_id);
        if (!game) {
            return res.status(404).json({ error: 'Game not found' });
        }

        // Determine whether to update the home or away team score
        let isHomeTeam = game.home == team_id;
        if (!isHomeTeam && game.away != team_id) {
            return res.status(400).json({ error: 'Team ID does not match game teams' });
        }

        // Update the game score using the utility function
        const updatedGoals = await updateGameScore(game_id, isHomeTeam);

        // Insert the scorer into the database using the utility function
        const scorer = await insertScorer(player_id, game_id, 1, minutes);

        // Fetch player details using the utility function
        const playerDetails = await getPlayerById(player_id);
        if (!playerDetails) {
            return res.status(404).json({ error: 'Player not found' });
        }

        // Emit updated game scores and scorer details to all connected clients
        io.emit('scoreUpdated', {
            game: updatedGoals,
            scorer: {
                id: scorer.id,
                player_id: scorer.playerid,
                game_id: scorer.gameid,
                goal: scorer.goal,
                minutes: scorer.minutes,
                player_details: playerDetails, // Include player details
            },
        });

        // Return the updated game data and scorer to the client
        res.status(200).json({ game: updatedGoals, scorer });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'An error occurred while updating the game score' });
    }
});

// POST route to add an activity
router.post('/activities', async (req, res) => {
    let io = req.io;

    const { game_id, team_id, type, minutes } = req.body;
    console.log('teamid', team_id)
    const db = await useLeaguesDB();

    // SQL query to insert activity
    const activitySql = 'INSERT INTO activities VALUES (?,?, ?, ?, ?)';

    try {
        // Insert activity
        const result = await dbQuery(db, activitySql, [null,game_id, team_id, type, minutes]);

        // Get full game details (with teams)
        const gameDetails = await getGameDetails(game_id);
        if (!gameDetails) {
            return res.status(404).json({ error: 'Game or teams not found' });
        }

        // Determine which team's name to return based on team_id
        const teamName = team_id == gameDetails.home_team.id ? gameDetails.home_team.name : gameDetails.away_team.name;

        // Emit activityAdded event with full details, including the team name instead of team_id
        io.emit('activityAdded', {
            id: result.lastID,  // ID of the newly inserted activity
            game: gameDetails,  // Full game details
            activity: {
                team_id,
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
                team_id,
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

// Helper function to determine game status and period
const calculateGameStatusAndPeriod = (gameTime) => {
    const currentTime = new Date();
    const startTime = new Date(gameTime);

    let status, period;

    if (currentTime < startTime) {
        status = 'Scheduled';
        period = null; // Not started yet, no period
    } else {
        const minutesSinceStart = Math.floor((currentTime - startTime) / 60000); // Convert milliseconds to minutes
        
        if (minutesSinceStart < 45) {
            status = 'In Progress';
            period = 'First Half';
        } else if (minutesSinceStart >= 45 && minutesSinceStart < 90) {
            status = 'In Progress';
            period = 'Second Half';
        } else if (minutesSinceStart >= 90) {
            status = 'Completed';
            period = 'Full-Time';
        }
    }

    return { status, period };
};


module.exports = router;
