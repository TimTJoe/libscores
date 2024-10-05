import { populatePositions, populateSeasonsSelectors, populateSeasonTeams, updateCountdown,checkGameCountdowns} from "./utils.js";


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

    
    // Check countdowns every 10 seconds
    const dateTimeInput = "#gameTimeInput"; // Selector for the input field
    const timerTag = "#countdownDisplay"; // Selector for the display tag
    
    // Initialize countdown
    $('#gameTimeInput').on('change', function() {
        updateCountdown(dateTimeInput, timerTag);
    });
    
    // Start watching for game start
    // setInterval(watchGameStart(dateTimeInput, timerTag), 10000);
    setInterval(checkGameCountdowns, 10000);
    ;

    $("#home").on("change", async () => {
        const teamId = $(this).find("option:selected").attr('value'); // Get selected season ID
        const url = `/v1/api/clubs/${teamId}`;

          // Make an AJAX GET request to fetch the phase by ID
    $.get(url, function (data) {
    }).fail(function (jqXHR, textStatus, errorThrown) {
        // Handle error
        console.error('Error fetching phase:', textStatus, errorThrown);
        // alert('Failed to fetch the phase. Please try again later.');
    });
    })

});
