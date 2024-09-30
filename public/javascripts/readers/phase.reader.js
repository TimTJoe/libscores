import { populatePhasesSelect } from "../utils.js";

$(document).ready( function () {
    // Bind the change event on the #seasons select element
    $(document).on("change", "#barSeasons", async function () {
        let id = $(this).val();
        renderPhases(id)
    });
});

/**
 * Fetches and renders phase information.
 * It fetches all phases or a specific phase based on the provided data.
 *
 * @param {number|null} phaseId - The ID of the phase to fetch. If null, fetches all phases.
 */
export function renderPhases(phaseId = null) {
    // Construct the URL based on whether a phase ID is provided
    const url = phaseId ? `/dashboard/phases/${phaseId}` : '/dashboard/phases';
    const $fragment = $('#fragment'); // Cache the fragment element
  
    // Make an AJAX GET request to fetch the phase(s)
    $.get(url)
      .done(function (data) {
        console.log("data", data)
        data = data.teams
        // Clear the existing fragment content
        $fragment.empty();
  
        // Create document fragments for both the season and team tables
        const seasonFragment = $(document.createDocumentFragment());
        const teamFragment = $(document.createDocumentFragment());
  
        if (data.length >= 0) {
          // Iterate over the data and append to the fragments
          $.each(data, function (index, phase) {
  
            // Append team details to the team fragment
            teamFragment.append(`
              <tr>
                <td class="row">
                <img class="sm-logo" src="/images/${phase.badge}" alt="${phase.club} Badge">
                ${phase.club}</td>
                <td>${phase.founded}</td>
                <td>${phase.squad || 'N/A'}</td>
                <td>${phase.stadium}</td>
                <td>${phase.market_value}</td>
                <td></td>
              </tr>
            `);
          });
        } else {
          // Handle the case where no data is returned
          seasonFragment.append('<tr><td colspan="2">No seasons found.</td></tr>');
          teamFragment.append('<tr><td colspan="6">No teams found.</td></tr>');
        }
  
  
        $fragment.append(`
            <div class="bg-white small-padding margin-top small-round"><table id="teamTable" class="tiny">
            <thead>
                <tr><th>Club</th><th>Founded</th>
                <th>Squad</th><th>Stadium</th>
                <th>Market Value</th>
            </thead>
                <tbody></tbody>
            </table></div>`);
        $('#teamTable tbody').append(teamFragment);
      })
      .fail(function (jqXHR, textStatus, errorThrown) {
        // Handle error
        console.error('Error fetching phase(s):', textStatus, errorThrown);
      });
  }
  

