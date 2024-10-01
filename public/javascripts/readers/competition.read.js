/**
 * Fetches competition and season details, including all teams in that season
 * @param {number} competitionId - The ID of the competition
 * @param {number} seasonId - The ID of the season
 * @returns {Promise<object>} - Returns the competition, season, and teams
 */
export function fetchCompetitionSeasonDetails(competitionId, seasonId) {
    return $.ajax({
        url: `/v1/api/competitions/${competitionId}/seasons/${seasonId}`,
        method: 'GET',
        dataType: 'json',
        success: function (response) {
            console.log("Competition and Season Details:", response);
            return response;
        },
        error: function (xhr, status, error) {
            console.error("Error fetching details:", status, error);
        }
    });
}

/**
 * Renders a table displaying the teams in a season for a competition
 * @param {object} data - The competition and season details, including teams
 */
export function renderTeamsTable(data) {
    // Create a fragment to append table elements
    const fragment = $(document.createDocumentFragment());

    // Create the table and headers
    const table = $('<table></table>').addClass('teams-table');
    const headerRow = `
        <thead>
            <tr>
                <th>Team ID</th>
                <th>Team Name</th>
                <th>Logo</th>
            </tr>
        </thead>
    `;
    table.append(headerRow);

    // Create the table body
    const tableBody = $('<tbody></tbody>');

    // Loop through teams and create rows
    data.season.teams.forEach(team => {
        const row = `
            <tr>
                <td>${team.id}</td>
                <td>${team.name}</td>
                <td><img src="${team.logo}" alt="${team.name} logo" width="50"></td>
            </tr>
        `;
        tableBody.append(row);
    });

    // Append the body to the table
    table.append(tableBody);

    // Append the table to the fragment
    fragment.append(table);

    // Finally, append the fragment to the DOM
    $('#teams-container').html(fragment); // Assumes there is a div with id="teams-container"
}

// Usage example
$(document).ready(function () {
    // const competitionId = 1; // Example competition ID
    // const seasonId = 2022;    // Example season ID

    // fetchCompetitionSeasonDetails(competitionId, seasonId)
    //     .then(function (data) {
    //         // Handle the data received from the API
    //         console.log("Received data:", data);
    //     });
});

