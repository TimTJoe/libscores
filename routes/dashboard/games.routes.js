const express = require('express');
const { dbQuery, dbRun, dbGet, dbAll, createDbConnection } = require('@utils/dbUtils');
const router = express.Router();
const moment = require('moment');
const games = require('@/data/games.json'); // Mock "database"

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

    const db = await createDbConnection();
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

// PUT route to update game score and scorer table
router.put('/:game_id/score', async (req, res) => {
    let io = req.io

    const { team_id, minutes, player_id } = req.body; // Get team_id, minutes, and player_id from the request
    const { game_id } = req.params; // Get game_id from the request parameters

    // Query the games table to find the game based on game_id
    const getGameSql = 'SELECT * FROM games WHERE id = ?';
    const db = await createDbConnection();


    try {
        const gameResult = await dbQuery(db, getGameSql, [game_id]);

        if (!gameResult || gameResult.length === 0) {
            return res.status(404).json({ error: 'Game not found' });
        }

        const game = gameResult[0];
        // console.log('team id', team_id)

        let updateSql;
        let updatedGoals;

        // Check if the team_id matches the home or away team and update accordingly
        if (game.home == team_id) {
            updateSql = 'UPDATE games SET home_goal = home_goal + 1 WHERE id = ?';
            updatedGoals = { ...game, home_goal: game.home_goal + 1 };
        } else if (game.away == team_id) {
            updateSql = 'UPDATE games SET away_goal = away_goal + 1 WHERE id = ?';
            updatedGoals = { ...game, away_goal: game.away_goal + 1 };
        } else {
            return res.status(400).json({ error: 'Team ID does not match game teams' });
        }

        // Update the game in the database
        await dbQuery(db,updateSql, [game_id]);

        // Insert into the scorer table with goal and minutes
        const insertScorerSql = 'INSERT INTO scorers VALUES (?, ?, ?, ?, ?)';
        await dbQuery(db, insertScorerSql, [null,player_id, game_id, 1, minutes]);

        // Query the scorer table to get the latest entry
        const getScorerSql = 'SELECT * FROM scorers WHERE game_id = ? AND player_id = ? ORDER BY id DESC LIMIT 1';
        const scorerResult = await dbQuery(db,getScorerSql, [game_id, player_id]);

        // Query the players table to get player details
        const getPlayerSql = 'SELECT * FROM players WHERE id = ?';
        const playerResult = await dbQuery(db,getPlayerSql, [player_id]);

        if (!playerResult || playerResult.length === 0) {
            return res.status(404).json({ error: 'Player not found' });
        }

        const playerDetails = playerResult[0];

        // Emit updated game scores and scorer details to all connected clients
        io.emit('scoreUpdated', {
            game: updatedGoals,
            scorer: {
                id: scorerResult[0].id,
                player_id: scorerResult[0].playerid,
                game_id: scorerResult[0].gameid,
                goal: scorerResult[0].goal,
                minutes: scorerResult[0].minutes,
                player_details: playerDetails, // Include player details
            },
        });

        // Return the updated game data and scorer to the client
        res.status(200).json({ game: updatedGoals, scorer: scorerResult[0] });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'An error occurred while updating the game score' });
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
