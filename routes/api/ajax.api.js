var router = require('express').Router();
var axios = require("axios");
const baseURL = process.env.API_BASE_URL || 'http://localhost:3000';
const { getGroupsData, getTeamsData, getMatchesData } = require('@utils/dataUtils');

/**
 * Handles AJAX requests for fetching groups, teams, or matches.
 * @route GET /ajax/:type/:id
 * @param {string} type - The type of data to fetch (groups, teams, or matches).
 * @param {string} id - The ID of the tournament.
 * @returns {Promise<void>} Renders the appropriate EJS file with the fetched data.
 */
router.get('/:type/:id', async (req, res) => {
    const { id } = req.params; // Extract the tournament ID
    const type = req.params.type; // This will be either 'groups', 'teams', or 'matches'

    try {
        let data;

        // Determine which function to call based on the type
        if (type === 'groups') {
            data = await getGroupsData(id);
            console.log(data)
        } else if (type === 'teams') {
            data = await getTeamsData(id);
        } else if (type === 'matches') {
            data = await getMatchesData(id);
        } else {
            return res.status(400).send('Invalid type requested.');
        }

        // Render the appropriate EJS file based on the type
        if (type === 'groups') {
            res.render('dashboard/groups.dash.ejs', { groups: data });
        } else if (type === 'teams') {
            res.render('dashboard/teams.dash.ejs', { teams: data });
        } else if (type === 'matches') {
            res.render('dashboard/matches.dash.ejs', { matches: data });
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Error loading data.');
    }
});

module.exports = router;
