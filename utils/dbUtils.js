const sqlite3 = require('sqlite3').verbose();

/**
 * Creates a database connection based on the environment.
 * @returns {sqlite3.Database} The SQLite database connection.
//  */
// function useLeaguesDB() {
//     let db;

//     if (process.env.NODE_ENV === 'development') {
//         // Use local SQLite file in development
//         db = new sqlite3.Database(process.env.LEAGUES_DB_PATH, (err) => {
//             if (err) {
//                 console.error('Error connecting to the local leagues database:', err.message);
//             } else {
//                 console.log('Connected to the local leagues  database.');
//             }
//         });
//     } else if (process.env.NODE_ENV === 'production') {
//         // Use the cloud SQLite URL in production
//         db = new sqlite3.Database(process.env.PROD_DB_URL, (err) => {
//             if (err) {
//                 console.error('Error connecting to the cloud leagues database:', err.message);
//             } else {
//                 console.log('Connected to the  cloud leagues database.');
//             }
//         });
//     } else {
//         console.error('NODE_ENV is not set or is unrecognized.');
//     }

//     return db;
// }

function useTournamentDB() {
    let db;

    if (process.env.NODE_ENV === 'development') {
        // Use local SQLite file in development
        db = new sqlite3.Database(process.env.TOURNAMENTS_DB_PATH, (err) => {
            if (err) {
                console.error('Error connecting to the local leagues database:', err.message);
            } else {
                console.log('Connected to the local TOURNAMENTS database.');
            }
        });
    } else if (process.env.NODE_ENV === 'production') {
        // Use the cloud SQLite URL in production
        db = new sqlite3.Database(process.env.PROD_DB_URL, (err) => {
            if (err) {
                console.error('Error connecting to the cloud tournament database:', err.message);
            } else {
                console.log('Connected to the  cloud tournaments database.');
            }
        });
    } else {
        console.error('NODE_ENV is not set or is unrecognized.');
    }

    return db;
}

function useLeaguesDB() {
    let db;
    if (process.env.NODE_ENV === 'development') {
        // Use local SQLite file in development
        db = new sqlite3.Database(process.env.LEAGUES_DB_PATH, (err) => {
            if (err) {
                console.error('Error connecting to the local LEAGUES database:', err.message);
            } else {
                console.log('Connected to the local LEAGUES database.');
            }
        });
    } else if (process.env.NODE_ENV === 'production') {
        // Use the cloud SQLite URL in production
        db = new sqlite3.Database(process.env.PROD_DB_URL, (err) => {
            if (err) {
                console.error('Error connecting to the cloud LEAGUES database:', err.message);
            } else {
                console.log('Connected to the LEAGUESET cloud database.');
            }
        });
    } else {
        console.error('NODE_ENV is not set or is unrecognized.');
    }

    return db;
}


/**
 * Executes a query that returns multiple rows.
 * @param {sqlite3.Database} db - The database connection.
 * @param {string} query - The SQL query to execute.
 * @param {Array} [params=[]] - The parameters for the SQL query.
 * @returns {Promise<Array>} A promise that resolves to the rows returned by the query.
 */
const dbQuery = (db, query, params = []) => {
    return new Promise((resolve, reject) => {
        db.all(query, params, (err, rows) => {
            if (err) return reject(err);
            resolve(rows);
        });
    });
};

/**
 * Executes an insert or update query.
 * @param {sqlite3.Database} db - The database connection.
 * @param {string} query - The SQL query to execute.
 * @param {Array} [params=[]] - The parameters for the SQL query.
 * @returns {Promise<number>} A promise that resolves to the last inserted ID.
 */
const dbRun = (db, query, params = []) => {
    return new Promise((resolve, reject) => {
        db.run(query, params, function (err) {
            if (err) return reject(err);
            resolve(this.lastID);
        });
    });
};

/**
 * Executes a query that returns all rows.
 * @param {sqlite3.Database} db - The database connection.
 * @param {string} query - The SQL query to execute.
 * @param {Array} [params=[]] - The parameters for the SQL query.
 * @returns {Promise<Array>} A promise that resolves to an array of rows returned by the query.
 */
const dbAll = (db, query, params = []) => {
    return new Promise((resolve, reject) => {
        db.all(query, params, (err, rows) => {
            if (err) return reject(err);
            resolve(rows);
        });
    });
};

/**
 * Executes a query that returns a single row.
 * @param {sqlite3.Database} db - The database connection.
 * @param {string} query - The SQL query to execute.
 * @param {Array} [params=[]] - The parameters for the SQL query.
 * @returns {Promise<Object>} A promise that resolves to the row returned by the query.
 */
const dbGet = (db, query, params = []) => {
    return new Promise((resolve, reject) => {
        db.get(query, params, (err, row) => {
            if (err) return reject(err);
            resolve(row);
        });
    });
};

// Function to get game details by gameId
// async function getGameDetails(gameId) {
//     const db = useLeaguesDB()
//     const gameQuery = `SELECT * FROM games WHERE id = ?`;
//     const game = await dbGet(db,gameQuery, [gameId]);
//     return game;
// }

// Helper function to get full game details (including home and away team names)
async function getGameDetails(game_id) {
    const db = useLeaguesDB()
    // Query to fetch game info
    const gameSql = `SELECT g.id, g.home, g.away, g.start, g.status, g.period, g.home_goal, g.away_goal FROM games g WHERE g.id = ?`;
    const game = await dbQuery(db,gameSql, [game_id]);
    if (!game.length) return null;  // No game found

    // Query to fetch home and away team info
    const homeTeamSql = `SELECT id, club AS name FROM clubs WHERE id = ?`;
    const awayTeamSql = `SELECT id, club AS name FROM clubs WHERE id = ?`;
    
    const homeTeam = await dbQuery(db,homeTeamSql, [game[0].home]);
    const awayTeam = await dbQuery(db,awayTeamSql, [game[0].away]);

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


// Function to get activities of a game by gameId
async function getGameActivities(gameId) {
    const db = useLeaguesDB()
    const activityQuery = `SELECT * FROM activities WHERE game_id = ?`;
    const activities = await dbAll(db,activityQuery, [gameId]);
    return activities;
}

async function getTeamDetails(teamId) {
    const db = useLeaguesDB()
    const clubQuery = `SELECT * FROM clubs WHERE id = ?`;
    const clubs = await dbAll(db,clubQuery, [teamId]);
    return clubs;
}

// Function to get the players who participated in the game
async function getPlayersInGame(gameId) {
    const db = useLeaguesDB()
    const playerQuery = `
        SELECT players.* FROM players 
        JOIN scorers ON players.id = scorers.player_id 
        WHERE scorers.game_id = ?`;
    const players = await dbAll(db,playerQuery, [gameId]);
    return players;
}

// Function to get the scorers and their goals in the game
async function getScorersInGame(gameId) {
    const db = useLeaguesDB()
    const scorerQuery = `
        SELECT players.id, players.fullname, players.club_id, scorers.goal, scorers.minutes FROM scorers
        JOIN players ON scorers.player_id = players.id
        WHERE scorers.game_id = ?`;
    const scorers = await dbAll(db,scorerQuery, [gameId]);
    return scorers;
}

/**
 * Helper function to handle errors and send a response.
 * @param {Response} res - Express response object.
 * @param {Error} err - The error object.
 * @param {string} [customMessage='An error occurred'] - Optional custom error message.
 */
const handleError = (res, err, customMessage = 'An error occurred') => {
    console.error(err);
    res.status(500).json({ message: customMessage });
};


// Export the utility functions
module.exports = {
    getTeamDetails,
    getGameDetails,
    getGameActivities,
    getPlayersInGame,
    getScorersInGame,
    useLeaguesDB,
    dbQuery,
    dbRun,
    dbGet,
    dbAll,
    useTournamentDB,
    handleError
};
