$(document).ready(function () {
    fetchAndRenderTournaments('tournamentList')
});

export function fetchAndRenderTournaments(elementId) {
    // Send a request to the API endpoint to get the players of the specified club
    const targetElement = $(`#${elementId}`);
    $.get(`/v1/api/tournaments`, function(data) {
        // Find the target element by clubId


        if (!targetElement.length) {
            console.error(`No element found with ID: ${elementId}`);
            return;
        }

        // Clear the existing content in the target element
        targetElement.empty();

        // Check if the response contains the message about no players
        if (data.message) {
            const noRecordMsg = `<p class="">${data.message}</p>`;
            targetElement.append(noRecordMsg);
            return;
        }

        // Iterate through the players and build the HTML structure if players are found
        data.tournaments.forEach(tournament => {
            const playerHTML = `
                <a href="/dashboard/tournaments/${tournament.id}" class="row small-padding border small-round">
                    <img src="/images/${tournament.badge}" alt="" class="mid-logo">
                    <p class="small cap">${tournament.name}</p>
                    <i class="fa fa-arrow-right move-right black margin-right"></i>
                </a>
            `;

            // Append the player card to the target element
            targetElement.prepend(playerHTML);
        });
    }).fail(function() {
        // Handle request failure
        const errorMessage = '<p class="error-message">Error fetching tournaments. Please try again later.</p>';
        targetElement.append(errorMessage);
    });
}
