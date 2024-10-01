export function formatDate(date) {
    let _date = new Date(date);
    let formatedDate = new Intl.DateTimeFormat("us-EN", {
      month: "short",
      day: "2-digit",
      year: "numeric"
    }).format(_date);
  
    return formatedDate;
  }

  export function removeWordFromEnd(text, word) {
    if (text.endsWith(word)) {
      return text.slice(0, -word.length).trim();
    }
    return text;
  }

  export function getPageUrl() {
    let url = $(location).attr('href');
    return url.replace(/\/\s*$/, "").split('/').pop();
  }
  export function getPage() {
    let url = $(location).attr('href');

// Remove any trailing slash, then split the URL by '/'
let segments = url.replace(/\/\s*$/, "").split('/');

// Return the second-to-last segment (the page name)
return segments.length > 1 ? segments[segments.length - 2] : null;
  }
  

  export function showSnackbar(message) {
    var snackbar = $('#snackbar');
    snackbar.text(message); // Set the dynamic text
  
    snackbar.addClass('show');
  
    // After 3 seconds, remove the show class to hide the snackbar
    setTimeout(function() {
      snackbar.removeClass('show');
    }, 3000);
  }
  
  export function calculateAge(dateString) {
    const today = new Date();
    const birthDate = new Date(dateString);

    // Calculate the difference in years, months, and days
    let years = today.getFullYear() - birthDate.getFullYear();
    let months = today.getMonth() - birthDate.getMonth();
    let days = today.getDate() - birthDate.getDate();

    // Adjust if the current month/day is before the birth month/day
    if (days < 0) {
        months--;
        days += new Date(today.getFullYear(), today.getMonth(), 0).getDate();
    }

    if (months < 0) {
        years--;
        months += 12;
    }

    // Return the result based on the time passed
    if (years > 0) {
        return `${years} year${years > 1 ? 's' : ''} old`;
    } else if (months > 0) {
        return `${months} month${months > 1 ? 's' : ''} old`;
    } else {
        return `${days} day${days > 1 ? 's' : ''} old`;
    }
}

/**
 * Populate the seasons select dropdown
 * @param {string} selectId - The ID of the select element to populate
 */
export function populateSeasonsSelect(selectId) {
  if (!selectId) {
      console.error("Select ID is required.");
      return;
  }

  const $select = $(`#${selectId}`);

  // Fetch seasons from API and populate the dropdown
  getSeasons().then(seasons => {
      // Clear existing options
      $select.empty();

      // Populate the select with new options
      seasons.forEach(season => {
          const formattedDate = formatSeasonDates(season.start, season.end); // Use the updated utility function
          const option = $('<option></option>').val(season.id).text(formattedDate);
          $select.append(option);
      });
  }).catch(err => {
      console.error(err);
  });
}

/**
 * Format season dates from start and end date strings to a readable format.
 * @param {string} startDate - The start date in a string format.
 * @param {string} endDate - The end date in a string format.
 * @returns {string} Formatted date range or an error message.
 */
export function formatSeasonDates(startDate, endDate) {
  const start = new Date(startDate); // Create Date object from start date
  const end = new Date(endDate); // Create Date object from end date

  // Check if the dates are valid
  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      console.error("Invalid date format:", { startDate, endDate });
      return "Invalid Date Range"; // Return a fallback value
  }

  const startMonth = start.toLocaleString('default', { month: 'short' }); // Short month name
  const startYear = start.getFullYear(); // Extract year from start date
  const endMonth = end.toLocaleString('default', { month: 'short' }); // Short month name for end date
  const endYear = end.getFullYear(); // Extract year from end date

  return `${startMonth} ${startYear} - ${endMonth} ${endYear}`; // Format and return
}



/**
* Fetch the list of seasons from the API
* @returns {Promise<Array>} A promise that resolves with the list of seasons
*/
export function getSeasons() {
  return new Promise((resolve, reject) => {
      const apiRoute = '/dashboard/seasons'; // Updated to point to the seasons endpoint
      
      $.get(apiRoute, function(data, textStatus) {
          if (textStatus === "success") {
              resolve(data); // Assuming the response contains an array of season objects
          } else {
              reject("Error fetching seasons.");
          }
      }, "json");
  });
}
/**
 * Fetches team suggestions based on the provided query.
 * 
 * @param {string} query - The search term for team suggestions.
 * @returns {Promise<Array>} A promise that resolves to an array of team suggestions.
 * @throws {Error} Throws an error if the AJAX request fails.
 */
export function fetchTeamSuggestions(query) {
  return new Promise((resolve, reject) => {
      $.ajax({
          url: '/v1/api/clubs/suggest', // This is the endpoint we just defined
          method: 'GET',
          data: { q: query },
          success: function (data) {
              resolve(data);
          },
          error: function (err) {
              reject(err);
          }
      });
  });
  
}

// Helper function to handle errors
export const handleError = (res, err, customMessage = 'An error occurred') => {
  console.error(err);
  res.status(500).json({ message: customMessage });
};

/**
 * Fetches all phases by making an AJAX GET request to the /dashboard/phases route.
 * Returns a promise that resolves with the phase data or rejects if there's an error.
 *
 * @returns {Promise<Array>} A promise that resolves to an array of phase objects.
 */
export function getPhases() {
  return new Promise((resolve, reject) => {
      const apiRoute = '/dashboard/phases'; // Endpoint for fetching phases

      $.get(apiRoute, function(data, textStatus) {
          if (textStatus === "success") {
              resolve(data); // Assuming the response contains an array of phase objects
          } else {
              reject("Error fetching phases.");
          }
      }, "json").fail(function(jqXHR, textStatus, errorThrown) {
          reject(`Error fetching phases: ${textStatus} - ${errorThrown}`);
      });
  });
}


/**
 * Populate the phases select dropdown.
 * @param {string} selectId - The ID of the select element to populate.
 */
export function populatePhasesSelect(selectId) {
    if (!selectId) {
        console.error("Select ID is required.");
        return;
    }

    const $select = $(`#${selectId}`);

    // Fetch phases from the API and populate the dropdown
    getPhases().then(phases => {
        // Clear existing options
        $select.empty();

        // Populate the select with new options
        phases.forEach(phase => {
          const formattedDate = formatSeasonDates(phase.start, phase.end); // Use the updated utility function
         
            const option = $('<option></option>').val(phase.phase_id).text(formattedDate);
            // $select.append(`<option value="001" selected>Select Phases</option>`)
            $select.append(option);

        });
    }).catch(err => {
        console.error('Error populating phases:', err);
    });
}

/**
 * Fetches and renders phase information based on a provided phase ID.
 * If no ID is provided, it fetches all phases.
 *
 * @param {number|null} phaseId - The ID of the phase to fetch. If null, fetches all phases.
 */
export function renderPhases(phaseId = null) {
  // Construct the URL based on whether a phase ID is provided
  const url = phaseId ? `/dashboard/phases/${phaseId}` : '/dashboard/phases';
  const $phaseList = $('#phaseList'); // Cache the phase list element

  // Make an AJAX GET request to fetch the phase(s)
  $.get(url)
      .done(function (data) {
          // Clear the existing list of phases
          $phaseList.empty();

          if (phaseId) {
              // If a specific phase ID is provided
              if (data.teams) {
                  $phaseList.append(
                      `<li>Phase ID: ${data.teams.phase_id} - Team: ${data.teams.team_name} - Status: ${data.teams.status}</li>`
                  );
              } else {
                  $phaseList.append('<li>No teams found for this phase.</li>');
              }
          } else {
              // If fetching all phases
              if (data.length > 0) {
                  $.each(data, function (index, phase) {
                      $phaseList.append(
                          `<li>Phase ID: ${phase.phase_id} - Status: ${phase.phase_status} - Team: ${phase.team_name}</li>`
                      );
                  });
              } else {
                  $phaseList.append('<li>No phases found.</li>');
              }
          }
      })
      .fail(function (jqXHR, textStatus, errorThrown) {
          // Handle error
          console.error('Error fetching phase(s):', textStatus, errorThrown);
          alert('Failed to fetch the phase(s). Please try again later.');
      });
}

/**
 * Populate all select elements with the class 'season-selector' with season data.
 */
export function populateSeasonsSelectors() {
  // Select all elements with the class 'season-selector'
  const $selectors = $('.season-selector');

  if ($selectors.length === 0) {
    // console.error("No select elements with the class 'season-selector' found.");
    return;
  }

  // Fetch seasons from the API and populate the dropdowns
  getSeasons()
    .then((seasons) => {
      // Clear and populate each season selector
      $selectors.each(function () {
        const $select = $(this);
        
        // Clear existing options
        $select.empty();

        // Add a default 'Select a season' option
        $select.append('<option value="">Select a season</option>');

        // Populate the select with new options from the API data
        seasons.forEach((season) => {
          const formattedDate = formatSeasonDates(season.start, season.end);
          const option = $('<option></option>').val(season.id).text(`${season.id} - ${formattedDate}`);
          $select.append(option);
        });
      });
    })
    .catch((err) => {
      console.error('Error populating seasons selectors:', err);
    });
}


/**
 * Fetches all phases by making an AJAX GET request to the /dashboard/phases route.
 * The fetched data is displayed dynamically in the UI by populating a list element with phase details.
 */
export function fetchPhases() {
  $.get('/dashboard/phases', function (data) {
      // Handle success - log the phases data to the console

      // Clear any existing data in the phase list
      $('#phaseList').empty();

      // Append each phase's details to the list element
      $.each(data, function (index, phase) {
          $('#phaseList').append(
              `<li>${phase.id} - ${phase.club} - ${phase.team_name}</li>`
          );
      });

  }).fail(function (jqXHR, textStatus, errorThrown) {
      // Handle error
      console.error('Error fetching phases:', textStatus, errorThrown);
      // alert('Failed to fetch phases. Please try again later.');
  });
}


/**
 * Function to fetch a specific phase by ID and display its details, including multiple teams.
 * @param {number} phaseId - The ID of the phase to fetch.
 */
export function fetchPhaseById(phaseId) {
  // Construct the URL with the phase ID
  const url = `/dashboard/phases/${phaseId}`;

  // Make an AJAX GET request to fetch the phase by ID
  $.get(url, function (data) {
      const $phaseList = $('#phaseList');
      $phaseList.empty(); // Clear the existing list of phases

      console.log("1 phase", data)

      // If there are multiple teams, iterate and display each
      if (data.teams && data.teams.length > 0) {
          data.teams.forEach(team => {
              $phaseList.append(`<li>${data.phase_id} - Team: ${team.team_name}</li>`);
          });
      } else {
          // Handle case when no teams are returned
          $phaseList.append('<li>No teams found for this phase.</li>');
      }
  }).fail(function (jqXHR, textStatus, errorThrown) {
      // Handle error
      console.error('Error fetching phase:', textStatus, errorThrown);
      alert('Failed to fetch the phase. Please try again later.');
  });
}

/**
 * Populates all select elements with the class 'positions' with soccer field positions.
 * 
 * The options include various soccer positions such as "GK - Goalkeeper", "CM - Central Midfielder", etc.
 */
export function populatePositions() {
    const positions = [
        { value: "GK", label: "GK - Goalkeeper" },
        { value: "RB", label: "RB - Right Back" },
        { value: "CB", label: "CB - Center Back" },
        { value: "LB", label: "LB - Left Back" },
        { value: "RWB", label: "RWB - Right Wing Back" },
        { value: "LWB", label: "LWB - Left Wing Back" },
        { value: "CM", label: "CM - Central Midfielder" },
        { value: "RM", label: "RM - Right Midfielder" },
        { value: "LM", label: "LM - Left Midfielder" },
        { value: "RW", label: "RW - Right Winger" },
        { value: "LW", label: "LW - Left Winger" },
        { value: "CF", label: "CF - Center Forward" },
        { value: "ST", label: "ST - Striker" }
    ];

    // Select all <select> elements with the class "positions"
    $('select.positions').each(function () {
        const $select = $(this);

        // Clear existing options
        $select.empty();

        // Append new options
        positions.forEach(function (position) {
            $select.append($('<option>', {
                value: position.value,
                text: position.label
            }));
        });
    });
}

/**
 * Fetches and populates the teams for the selected season and competition into the .season-teams <select> element.
 * 
 * @param {string} seasonId - The ID of the selected season.
 * @param {string} competitionId - The ID of the competition from the URL.
 * 
 * @returns {void} - This function doesn't return any value. It dynamically updates the .season-teams element with options.
 * 
 * @example
 * populateSeasonTeams('1', '2'); // Populates teams for season 1 and competition 2
 */
export function populateSeasonTeams(seasonId, competitionId) {
    $.ajax({
        url: `/v1/api/competitions/${competitionId}/seasons/${seasonId}/clubs`,
        type: 'GET',
        success: function (data) {
            // Access the teams array within the season object
            const teams = data.season.teams || []; // Fallback to an empty array if no teams

            let options = '<option value="">Select a Team</option>';
            teams.forEach(team => {
                options += `<option value="${team.id}">${team.name}</option>`;
            });
            $('.season-teams').html(options); // Render the clubs into the select element
        },
        error: function (err) {
            console.error("Error fetching clubs: ", err);
        }
    });
}















