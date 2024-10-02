const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const router = express.Router();
const { dbQuery, dbRun, dbGet, dbAll, createDbConnection } = require('@utils/dbUtils');
const upload = require('@middleware/upload');

// GET route to fetch all players
router.get('/', async (req, res) => {
    try {
        const db = await createDbConnection(sqlite3);
        const players = await dbQuery(db, 'SELECT * FROM players ORDER BY id DESC');

        res.status(200).json(players); // Return the list of players
    } catch (err) {
        console.error('Error fetching players:', err);
        res.status(500).json({ message: 'An error occurred while fetching players.' });
    }
});

// POST route to save a new player
router.post('/', upload.single("photo"), async (req, res) => {
    const photo = req.file ? req.file.filename : 'human.png';

    const { fullname,DOB,team,country,status,market_value,position } = req.body;

    // Validate required fields
    if (!fullname || !DOB || !team || !country) {
        return res.status(400).json({ error: 'Please fill all required fields' });
    }

    try {
        const db = await createDbConnection(sqlite3);

        // Insert the player data into the database
        const insertSql = `
            INSERT INTO players VALUES (?,?,?,?,?,?,?,?,?,?,?)
        `;
        const values = [null, fullname,DOB,position,team,country,null,status,market_value,null,photo];

        // Execute the insert query
        const playerId = await dbRun(db, insertSql, values);

        // Fetch the newly created player data
        // const club = await dbGet(db, `SELECT * FROM clubs WHERE id = ?`, [team]);
        const newPlayer = await dbGet(db, `SELECT players.*,
               clubs.id AS club_id,
               clubs.club AS club_name,
               clubs.badge AS club_logo
        FROM players 
        LEFT JOIN clubs ON players.club_id = clubs.id 
        WHERE players.id = ?`, [playerId]);
        // Return the newly created player data to the frontend
        res.status(201).json({player: newPlayer});
    } catch (error) {
        console.error('Error saving player:', error);
        res.status(500).json({ error: 'An error occurred while saving the player.' });
    }
});

// Get all players
router.get('/', async (req, res) => {
    try {
        const db = await createDbConnection(sqlite3);
        const query = 'SELECT * FROM players ORDER BY id DESC';
        const players = await dbQuery(db, query);

        res.status(200).json({ players });
    } catch (err) {
        console.error('Error fetching players:', err);
        res.status(500).json({ message: 'An error occurred while fetching players.' });
    }
});

// Get a single player by ID
router.get('/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const db = await createDbConnection(sqlite3);
        const query = `
        SELECT players.*,
               clubs.id AS club_id,
               clubs.club AS club_name,
               clubs.badge AS club_logo
        FROM players 
        LEFT JOIN clubs ON players.club_id = clubs.id 
        WHERE players.id = ?;  
    `;
        const player = await dbQuery(db, query, [id]);

        if (!player.length) {
            return res.status(404).json({ message: 'player not found.' });
        }

        res.status(200).json({ player: player[0] });
    } catch (err) {
        console.error('Error fetching player:', err);
        res.status(500).json({ message: 'An error occurred while fetching the player.' });
    }
});

// Update an existing player
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { start, end, games } = req.body;

    if (!start || !end || !games) {
        return res.status(400).json({ message: 'All fields are required.' });
    }

    try {
        const db = await createDbConnection(sqlite3);

        // Determine the new status of the player
        // const status = determineplayerStatus(start, end);

        const sql = `
            UPDATE players
            SET start = ?, end = ?, games = ?, status = ?
            WHERE id = ?
        `;
        const values = [start, end, games, status, id];

        const result = await dbRun(db, sql, values);

        if (result.changes === 0) {
            return res.status(404).json({ message: 'player not found.' });
        }

        // Fetch the updated player
        const updatedplayer = await dbQuery(db, 'SELECT * FROM players WHERE id = ?', [id]);

        res.status(200).json({ player: updatedplayer[0] });
    } catch (err) {
        console.error('Error updating player:', err);
        res.status(500).json({ message: 'An error occurred while updating the player.' });
    }
});

// Delete a player by ID
router.delete('/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const db = await createDbConnection(sqlite3);

        const result = await dbRun(db, 'DELETE FROM players WHERE id = ?', [id]);

        if (result.changes === 0) {
            return res.status(404).json({ message: 'player not found.' });
        }

        res.status(200).json({ message: 'player deleted successfully.' });
    } catch (err) {
        console.error('Error deleting player:', err);
        res.status(500).json({ message: 'An error occurred while deleting the player.' });
    }
});

module.exports = router;
