const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const getDbInstance = require('@js/getDBInstance');
const router = express.Router();

// Utility functions for database operations
const dbQuery = (db, query, params = []) => {
    return new Promise((resolve, reject) => {
        db.all(query, params, (err, rows) => {
            if (err) return reject(err);
            resolve(rows);
        });
    });
};

// Utility function for running insert queries
const dbRun = (db, query, params = []) => {
    return new Promise((resolve, reject) => {
        db.run(query, params, function (err) {
            if (err) return reject(err); // Reject the promise if there's an error
            resolve(this.lastID); // Resolve with the last inserted ID
        });
    });
};

// Utility function for fetching a single item from the database
const dbGet = (db, query, params = []) => {
    return new Promise((resolve, reject) => {
        db.get(query, params, (err, row) => {
            if (err) return reject(err);
            resolve(row);
        });
    });
};

// GET route to fetch all seasons
router.get('/', async (req, res) => {
    try {
        const db = await getDbInstance(sqlite3);
        const seasons = await dbQuery(db, 'SELECT * FROM seasons ORDER BY id DESC');

        res.status(200).json(seasons); // Return the list of seasons
    } catch (err) {
        console.error('Error fetching seasons:', err);
        res.status(500).json({ message: 'An error occurred while fetching seasons.' });
    }
});

// POST route to save a new season
router.post('/', async (req, res) => {
    const { competition_id, start,status, end, teams, games } = req.body;

    // Validate required fields
    if (!competition_id || !start || !end) {
        return res.status(400).json({ error: 'All fields are required.' });
    }

    try {
        const db = await getDbInstance(sqlite3);

        // Insert the season data into the database
        const insertSql = `
            INSERT INTO seasons VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        const values = [null, competition_id, start, end, teams, status, games];

        // Execute the insert query
        const seasonId = await dbRun(db, insertSql, values);

        // Fetch the newly created season data
        const newSeason = await dbGet(db, `SELECT * FROM seasons WHERE id = ?`, [seasonId]);
        // Return the newly created season data to the frontend
        res.status(201).json(newSeason);
    } catch (error) {
        console.error('Error saving season:', error);
        res.status(500).json({ error: 'An error occurred while saving the season.' });
    }
});

// Get all seasons
router.get('/', async (req, res) => {
    try {
        const db = await getDbInstance(sqlite3);
        const query = 'SELECT * FROM seasons ORDER BY id DESC';
        const seasons = await dbQuery(db, query);

        res.status(200).json({ seasons });
    } catch (err) {
        console.error('Error fetching seasons:', err);
        res.status(500).json({ message: 'An error occurred while fetching seasons.' });
    }
});

// Get a single season by ID
router.get('/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const db = await getDbInstance(sqlite3);
        const season = await dbQuery(db, 'SELECT * FROM seasons WHERE id = ?', [id]);

        if (!season.length) {
            return res.status(404).json({ message: 'Season not found.' });
        }

        res.status(200).json({ season: season[0] });
    } catch (err) {
        console.error('Error fetching season:', err);
        res.status(500).json({ message: 'An error occurred while fetching the season.' });
    }
});

// Update an existing season
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { start, end, games } = req.body;

    if (!start || !end || !games) {
        return res.status(400).json({ message: 'All fields are required.' });
    }

    try {
        const db = await getDbInstance(sqlite3);

        // Determine the new status of the season
        // const status = determineSeasonStatus(start, end);

        const sql = `
            UPDATE seasons
            SET start = ?, end = ?, games = ?, status = ?
            WHERE id = ?
        `;
        const values = [start, end, games, status, id];

        const result = await dbRun(db, sql, values);

        if (result.changes === 0) {
            return res.status(404).json({ message: 'Season not found.' });
        }

        // Fetch the updated season
        const updatedSeason = await dbQuery(db, 'SELECT * FROM seasons WHERE id = ?', [id]);

        res.status(200).json({ season: updatedSeason[0] });
    } catch (err) {
        console.error('Error updating season:', err);
        res.status(500).json({ message: 'An error occurred while updating the season.' });
    }
});

// Delete a season by ID
router.delete('/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const db = await getDbInstance(sqlite3);

        const result = await dbRun(db, 'DELETE FROM seasons WHERE id = ?', [id]);

        if (result.changes === 0) {
            return res.status(404).json({ message: 'Season not found.' });
        }

        res.status(200).json({ message: 'Season deleted successfully.' });
    } catch (err) {
        console.error('Error deleting season:', err);
        res.status(500).json({ message: 'An error occurred while deleting the season.' });
    }
});

module.exports = router;
