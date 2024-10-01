const express = require('express');
const { dbQuery, dbRun, dbGet,dbAll, createDbConnection } = require('@utils/dbUtils');
const router = express.Router();

// Helper function to handle errors
const handleError = (res, err, customMessage = 'An error occurred') => {
    console.error(err);
    res.status(500).json({ message: customMessage });
};

// GET route to fetch all phases with season and club details
router.get('/', async (req, res) => {
    try {
        const db = await createDbConnection();

        // Query to join the phases table with seasons and clubs using foreign keys
        const query = `
             SELECT
                *, 
                phases.id AS phase_id, 
                phases.status AS phase_status, 
                clubs.club AS team_name
            FROM phases
            LEFT JOIN seasons ON phases.season_id = seasons.id
            LEFT JOIN clubs ON phases.team_id = clubs.id
            ORDER BY phases.id DESC;
        `;

        const phases = await dbQuery(db, query);

        if (phases.length === 0) {
            return res.status(404).json({ message: 'No phases found.' });
        }

        res.status(200).json(phases);
    } catch (err) {
        handleError(res, err, 'Error fetching phases.');
    }
});


// POST route to save a new phase
router.post('/', async (req, res) => {
    const { season, team } = req.body;

    // Validate required fields
    if (season === undefined || team === undefined) {
        return res.status(400).json({ error: 'season and team are required.' });
    }

    try {
        const db = await createDbConnection();
        
        // Check if the season exists
        const _season = await dbGet(db, 'SELECT status FROM seasons WHERE id = ?', [season]);
        if (!_season) {
            return res.status(404).json({ message: 'Season not found.' });
        }
       
        // Insert the new phase into the database
        const insertSql = `INSERT INTO phases VALUES (?,?, ?, ?)`;
        const values = [null, season, team, _season.status];

        console.log(season, team, _season.status)

        const phaseId = await dbRun(db, insertSql, values);
        const newPhase = await dbGet(db, `SELECT * FROM phases WHERE id = ?`, [phaseId]);

        res.status(201).json(newPhase);
    } catch (error) {
        handleError(res, error, 'Error saving phase.');
    }
});

// GET a single phase by ID
// GET a single phase by ID
router.get('/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const db = await createDbConnection();
        const query = `SELECT phases.id AS phase_id,
    phases.season_id,
    phases.status,
    clubs.*  -- Select all columns from the clubs table
FROM phases 
JOIN clubs ON phases.team_id = clubs.id 
WHERE phases.season_id = ?`;

        const phases = await dbAll(db, query, [id]);

        if (!phases || phases.length === 0) {
            return res.status(404).json({ message: 'No phases found for this season.' });
        }
        res.status(200).json({ teams: phases });
    } catch (err) {
        handleError(res, err, 'Error fetching phase.');
    }
});

// Update an existing phase
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { season_id, team_id } = req.body;

    if (season_id === undefined || team_id === undefined) {
        return res.status(400).json({ message: 'season_id and team_id are required.' });
    }

    try {
        const db = await createDbConnection();
        
        // Check if the season exists
        const season = await dbGet(db, 'SELECT status FROM seasons WHERE id = ?', [season_id]);
        if (!season) {
            return res.status(404).json({ message: 'Season not found.' });
        }

        const sql = `
            UPDATE phases
            SET season_id = ?, team_id = ?, status = ?
            WHERE id = ?
        `;
        const values = [season_id, team_id, season.status, id];

        const result = await dbRun(db, sql, values);
        if (result.changes === 0) {
            return res.status(404).json({ message: 'Phase not found.' });
        }

        const updatedPhase = await dbGet(db, 'SELECT * FROM phases WHERE id = ?', [id]);
        res.status(200).json({ phase: updatedPhase });
    } catch (err) {
        handleError(res, err, 'Error updating phase.');
    }
});

// Delete a phase by ID
router.delete('/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const db = await createDbConnection();

        const result = await dbRun(db, 'DELETE FROM phases WHERE id = ?', [id]);
        if (result.changes === 0) {
            return res.status(404).json({ message: 'Phase not found.' });
        }

        res.status(200).json({ message: 'Phase deleted successfully.' });
    } catch (err) {
        handleError(res, err, 'Error deleting phase.');
    }
});

module.exports = router;
