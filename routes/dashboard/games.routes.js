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


// Route handler to fetch all games and their home and away team info
router.get('/', async (req, res) => {
    try {
        const db = await createDbConnection();

        // SQL query to fetch all games with their respective home and away team details
        const query = `
            SELECT 
                games.id AS gameId,
                games.start AS gameTime,
                games.status,
                games.period,
                home_club.club AS homeTeamName,
                home_club.badge AS homeTeamBadge,
                home_club.market_value AS homeTeamMarketValue,
                away_club.club AS awayTeamName,
                away_club.badge AS awayTeamBadge,
                away_club.market_value AS awayTeamMarketValue
            FROM games
            JOIN clubs AS home_club ON games.home = home_club.id
            JOIN clubs AS away_club ON games.away = away_club.id;
        `;

        // Execute the query to get the list of games
        const games = await dbAll(db, query);

        // Check if any games are returned
        if (games.length === 0) {
            return res.render('dashboard/games.dash.ejs', {title: 'games', games: [] });  // Render with an empty games array
        }

        // Pass the games data to the EJS template for rendering
        res.render('dashboard/games.dash.ejs', {title: 'games', games });

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

// Route to handle saving game and inserting lineups
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

router.get("/:id/game", async (req, res) => {
    res.render("dashboard/game.info.ejs", {title: "Games info", gameId: req.params.id})
})



module.exports = router;
