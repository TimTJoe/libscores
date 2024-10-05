const { dbQuery, dbRun, dbGet, dbAll, createDbConnection } = require('@utils/dbUtils');
var router = require('express').Router();
// var sqlite3 = require("sqlite3").verbose();
// var getDbInstance = require('@js/getDBInstance');
// var db = getDbInstance(sqlite3);

router.get('/', async (req, res) => {
    try {
        const db = await createDbConnection(); // Consistent database connection method
        
        const query = `SELECT * FROM clubs`;
        const clubs = await dbAll(db, query);  // Use dbAll for querying all rows

        if (!clubs.length) {
            return res.status(404).json({ message: 'No clubs found.' });
        }

        res.status(200).json({ clubs });
    } catch (error) {
        console.error('Error fetching clubs:', error);
        res.status(500).json({ message: 'An error occurred while fetching the clubs.' });
    }
});


// Route 2: Suggest clubs (query search)
router.get('/suggest', async (req, res) => {
    const { q } = req.query; // Get the query parameter

    if (!q || q.trim() === '') {
        return res.status(400).json({ message: 'Query parameter is required.' });
    }

    try {
        const query = `SELECT id, club FROM clubs WHERE club LIKE ? LIMIT 10`; // Adjust the query as necessary
        const params = [`%${q}%`]; // Use parameterized query to prevent SQL injection

        let db = await createDbConnection();

        // Execute the database query
        const teams = await dbQuery(db, query, params); // Assuming dbQuery is defined in your dbUtils

        // Return the suggestions as JSON
        return res.status(200).json(teams);
    } catch (err) {
        console.error('Error fetching team suggestions:', err);
        return res.status(500).json({ message: 'An error occurred while fetching team suggestions.' });
    }
});

// Route 3: Get all players for a specific club by clubId
router.get('/:clubId/players', async (req, res) => {
    const { clubId } = req.params;

    try {
        const db = await createDbConnection();
        
        const query = `
            SELECT 
                players.id AS player_id,
                players.fullname AS player_name,
                players.DOB AS player_dob,
                players.position AS player_position,
                players.status AS player_status,
                players.market_value AS player_market_value,
                players.photo AS player_photo,
                clubs.id AS club_id, -- Added club ID
                clubs.club AS club_name,
                clubs.badge AS club_logo,
                clubs.founded AS club_founded,
                clubs.squad AS club_squad,
                clubs.stadium AS club_stadium
            FROM players 
            LEFT JOIN clubs ON players.club_id = clubs.id 
            WHERE players.club_id = ?;
        `;

        const players = await dbAll(db, query, [clubId]);

        // If no players are found for the given clubId
        if (!players.length) {
            return res.status(200).json({ message: 'No players available for this club.' });
        }

        // Format the response with club and player details
        const response = {
            club: {
                id: players[0].club_id,  // Added club ID to the response
                name: players[0].club_name,
                logo: players[0].club_logo,
                founded: players[0].club_founded,
                squad: players[0].club_squad,
                stadium: players[0].club_stadium
            },
            players: players.map(player => ({
                id: player.player_id,
                fullname: player.player_name,
                DOB: player.player_dob,
                position: player.player_position,
                status: player.player_status,
                market_value: player.player_market_value,
                photo: player.player_photo,
            }))
        };

        res.status(200).json(response);
    } catch (err) {
        console.error('Error fetching players:', err);
        res.status(500).json({ message: 'An error occurred while fetching the players.' });
    }
});

// Route 4: Get a specific club by its id
router.get('/:id', async function(req, res, next) {
    let { id } = req.params;
    try {
        db.all("SELECT * FROM clubs WHERE id=?", [id], function (err, rows) {
            if (err || rows.length === 0) {
                throw new Error(err);
            } else {
                res.status(200).json({ club: rows, msg: false });
            }
        });
    } catch (error) {
        res.status(400).json({ error, msg: "Club doesn't exist" });
    }
});

module.exports = router;
