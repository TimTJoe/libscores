$(document).ready(function () {
    // Populate clubs on page load
    fetchAndRenderClubs();
    
    // Populate countries for the select dropdown
    populateCountriesSelect('countries');
});

/**
 * Fetch and render the clubs list
 */
export function fetchAndRenderClubs() {
    getClubs().then(clubs => {
        renderClubsTable(clubs);
    }).catch(err => {
        console.error(err);
    });
}

/**
 * Fetch the list of clubs via API
 * @returns {Promise<Array>} A promise that resolves with the list of clubs
 */
export function getClubs() {
    return new Promise((resolve, reject) => {
        $.get("/v1/api/clubs", function (data, textStatus) {
            if (textStatus === "success") {
                resolve(data.clubs); // Resolve with club data
            } else {
                reject("An error occurred while fetching clubs data.");
            }
        }, "json");
    });
}

/**
 * Fetch club details by ID
 * @param {number} id - The ID of the club
 * @returns {Promise<Object>} A promise that resolves with the club data
 */
export function getClubById(id) {
    return new Promise((resolve, reject) => {
        $.get(`/v1/api/clubs/${id}`, function (data, textStatus) {
            if (textStatus === "success") {
                resolve(data.club);
            } else {
                reject("An error occurred while fetching club details.");
            }
        }, "json");
    });
}

/**
 * Render clubs table with the given list of clubs
 * @param {Array} clubs - List of clubs to render
 */
function renderClubsTable(clubs) {
    const $clubsTable = $('#clubs');
    const clubRows = clubs.map((team, index) => createClubRow(team, index)).join('');

    // Append all rows at once for better performance
    $clubsTable.append(clubRows);
}

/**
 * Create a single table row HTML string for a club
 * @param {Object} team - The club object
 * @param {number} index - The index of the club
 * @returns {string} The HTML string for the club table row
 */
function createClubRow(team, index) {
    return `
        <tr class="tr" id="${index}">
            <td class="td">
                <img src="/images/${team.badge}" class="tiny-logo">
            </td>
            <td class="first wide td row">
                <a href="/dashboard/clubs/${team.id}">${team.club}</a>
            </td>
            <td class="td">${team.squad == null ? '0' : team.squad}</td>
            <td class="td">${team.country_id == 1 ? 'Liberia' : team.country_id}</td>
            <td class="td">${team.market_value}</td>
            <td class="td">${team.stadium}</td>
            <td class="td">${team.founded}</td>
        </tr>`;
}

/**
 * Populate a country select dropdown
 * @param {string} selectId - The ID of the select element to populate
 */
export function populateCountriesSelect(selectId) {
    if (!selectId) {
        console.error("Select ID is required.");
        return;
    }

    const $select = $(`#${selectId}`);

    // Fetch countries from API and populate the dropdown
    getCountries().then(countries => {
        // Clear existing options
        $select.empty();

        // Populate the select with new options
        countries.forEach(country => {
            const option = $('<option></option>').val(country.country).text(country.country);
            $select.append(option);
        });
    }).catch(err => {
        console.error(err);
    });
}

/**
 * Fetch the list of countries from the API
 * @returns {Promise<Array>} A promise that resolves with the list of countries
 */
export function getCountries() {
    return new Promise((resolve, reject) => {
        const apiRoute = '/v1/api/creates/countries';
        
        $.get(apiRoute, function (data, textStatus) {
            if (textStatus === "success") {
                resolve(data); // Assuming the response contains an array of country objects
            } else {
                reject("Error fetching countries.");
            }
        }, "json");
    });
}
