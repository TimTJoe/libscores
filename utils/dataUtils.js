// utils/dataUtils.js

const { dbAll, useTournamentDB } = require('@utils/dbUtils');

// Function to fetch groups data by tournament ID
async function getGroupsData(tournamentId) {
    const db = await useTournamentDB();
    const groupsQuery = `
        SELECT groups.id AS group_id, groups.name AS group_name, teams.id AS team_id, teams.name AS team_name, teams.badge AS badge
        FROM groups 
        JOIN teams ON groups.team_id = teams.id 
        WHERE groups.tournament_id = ?
        ORDER BY groups.name
    `;
    return await dbAll(db, groupsQuery, [tournamentId]);
}

// Function to fetch teams data by tournament ID
async function getTeamsData(tournamentId) {
    const db = await useTournamentDB();
    const teamsQuery = `
        SELECT teams.id AS team_id, teams.name AS team_name, teams.badge
        FROM teams 
        JOIN groups ON teams.id = groups.team_id 
        WHERE groups.tournament_id = ?
    `;
    return await dbAll(db, teamsQuery, [tournamentId]);
}

// Function to fetch matches data by tournament ID
async function getMatchesData(tournamentId) {
    const db = await useTournamentDB();
    const matchesQuery = `
        SELECT * FROM fixtures 
        WHERE tournament_id = ?
        ORDER BY start
    `;
    return await dbAll(db, matchesQuery, [tournamentId]);
}

module.exports = { getGroupsData, getTeamsData, getMatchesData };
