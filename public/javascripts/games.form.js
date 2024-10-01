import { populatePositions, populateSeasonsSelectors, populateSeasonTeams } from "./utils.js";

$(document).ready(function () {
    // Populate initial positions and seasons
    populatePositions();
    populateSeasonsSelectors();

    // Get competition ID from the URL, assuming the URL is like /dashboard/competitions/1/games/new
const competitionId = window.location.pathname.split('/')[3]; // Extract competitionId from URL

    // Event listener for when the season is selected
    $('.season-selector').change(function () {
        const seasonId = $(this).find("option:selected").attr('value'); // Get selected season ID
        
        // If a season is selected, call populateSeasonTeams to load the teams for that season
        if (seasonId) {
            populateSeasonTeams(seasonId, competitionId);
        }
    });
});
