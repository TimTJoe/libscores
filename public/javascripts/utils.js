
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

export function fetchCountySuggestions(query) {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: '/v1/api/counties/suggest', // This is the endpoint we just defined
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
        //   alert('Failed to fetch the phase(s). Please try again later.');
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
    //   alert('Failed to fetch the phase. Please try again later.');
  });
}

/**
 * Populates all select elements with the class 'positions' with soccer field positions.
 * 
 * The options include various soccer positions such as "GK - Goalkeeper", "CM - Central Midfielder", etc.
 */
export function populatePositions() {
    const positions = [
        { value: "GK", label: "Goalkeeper" },
        { value: "DF", label: "Defender" },
        { value: "MF", label: "Midfielder" },
        { value: "FW", label: "Forward" },

    ]
    // const positions = [
    //     { value: "GK", label: "GK - Goalkeeper" },
    //     { value: "RB", label: "RB - Right Back" },
    //     { value: "CB", label: "CB - Center Back" },
    //     { value: "LB", label: "LB - Left Back" },
    //     { value: "RWB", label: "RWB - Right Wing Back" },
    //     { value: "LWB", label: "LWB - Left Wing Back" },
    //     { value: "CM", label: "CM - Central Midfielder" },
    //     { value: "RM", label: "RM - Right Midfielder" },
    //     { value: "LM", label: "LM - Left Midfielder" },
    //     { value: "RW", label: "RW - Right Winger" },
    //     { value: "LW", label: "LW - Left Winger" },
    //     { value: "CF", label: "CF - Center Forward" },
    //     { value: "ST", label: "ST - Striker" }
    // ];

    let $position = $('select.positions')

    $position.append('<option value="">Select a position</option>');

    // Select all <select> elements with the class "positions"
    $position.each(function () {
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

/**
 * Updates the countdown based on the selected date and time.
 *
 * @param {string} dateTimeInput - The ID of the datetime-local input element.
 * @param {string} timerTag - The ID of the tag where the countdown will be displayed.
 */
export function updateCountdown(dateTimeInput, timerTag) {
    const $dateTimeInput = $(dateTimeInput);
    const $timerTag = $(timerTag);

    // Get the selected datetime value from the input
    const selectedDateTime = new Date($dateTimeInput.val());

    if (isNaN(selectedDateTime)) {
        $timerTag.text("Invalid date");
        return;
    }

    const now = new Date();
    const timeDifference = Math.abs(selectedDateTime - now)
    // Calculate countdown components
    const seconds = Math.floor(timeDifference / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    // If the time is more than 90 minutes away
    const formattedDate = selectedDateTime.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        hour12: true,
    });
    
    // If the time is in the past
    if (timeDifference < 0) {
        $timerTag.text("FT");
        return;
    }


    // If the time is less than 90 minutes from now
    // let ms = convertMillisecond(timeDifference)
    // alert(ms)
   
    if (timeDifference < 90 * 60 * 1000) {
        const countdownText = `${minutes} : ${seconds % 60}`;
        $timerTag.text(countdownText);

        // Update every second
        const interval = setInterval(() => {
            const now = new Date();
            const newTimeDifference = selectedDateTime - now;

            if (newTimeDifference < 0) {
                clearInterval(interval);
                $timerTag.text(`${formattedDate}`).addClass("red");
                return;
            }

            const newSeconds = Math.floor(newTimeDifference / 1000);
            const newMinutes = Math.floor(newSeconds / 60);
            $timerTag.text(`${formattedDate}`);
        }, 1000);
    } else {
        $timerTag.text(`${formattedDate}`);
    }
}

// Function to check all countdowns every 10 seconds
export function checkGameCountdowns() {
    $('.gameCountdown').each(function() {
        const $this = $(this);
        const timeText = $this.text();

        // Check if it still displays the formatted time
        if (!timeText.includes('FT') && !timeText.includes('The event has already occurred.')) {
            const selectedDateTime = new Date($this.data('datetime')); // Assuming the datetime is stored in a data attribute

            const now = new Date();
            const timeDifference = selectedDateTime - now;

            // If the time has passed and is less than 90 minutes ago, update to "FT"
            if (timeDifference < 0) {
                const minutesPassed = Math.floor(-timeDifference / 1000 / 60);
                if (minutesPassed < 90) {
                    $this.text("FT");
                }
            }
        }
    });
}

function convertMillisecond(milliseconds) {
    let minutes = Math.round(Math.abs(milliseconds) / (1000 * 60))
    let hours = Math.round(Math.abs(milliseconds) / (1000 * 60 * 60))
    let days = Math.round(Math.abs(milliseconds) / (1000 * 60 * 60 * 24))

    if(minutes < 60) return minutes + " Mins"  + milliseconds
    else if(minutes < 24) return hours + " Hrs" + milliseconds
    else return days + " Days" + milliseconds
}

Date.prototype.addHours = function (h) {
    this.setHours(this.getHours()+h)
    return this
}
Date.prototype.addMinutes = function (m) {
    this.setHours(this.getMinutes()+m)
    return this
}

export function fetchTeamById(teamId) {
  const url = `/v1/api/clubs/${teamId}`;

    
  // Make an AJAX GET request to fetch the phase by ID
  $.get(url, function (data) {
    // console.log(data)
}).fail(function (jqXHR, textStatus, errorThrown) {
    // Handle error
    console.error('Error fetching phase:', textStatus, errorThrown);
    // alert('Failed to fetch the phase. Please try again later.');
});
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
 * Fetches the players of a specific club by clubId using jQuery and renders them into an element with the matching ID.
 *
 * @param {string} clubId - The ID of the club whose players are to be fetched and rendered.
 */
export function fetchAndRenderClubPlayers(clubId) {
    // Send a request to the API endpoint to get the players of the specified club
    $.get(`/api/clubs/${clubId}/players`, function(data) {
        // Find the target element by clubId
        const targetElement = $(`#${clubId}`);
        
        if (!targetElement.length) {
            console.error(`No element found with ID: ${clubId}`);
            return;
        }

        // Clear the existing content in the target element
        targetElement.empty();

        // Iterate through the players and build the HTML structure
        data.players.forEach(player => {
            const playerHTML = `
                <section id="homePlayers" class="border-right padding-right">
                    <span class="row small-bottom">
                        <small class="tiny bold" style="width: 188px;">Player</small>
                        <small class="tiny bold" style="width: 35px;">No</small>
                        <small class="tiny bold">Position</small>
                    </span>
                    <span class="row">
                        <label for="player-${player.id}" class="small max row margin-right" title="Select player">
                            <input type="checkbox" name="player" id="player-${player.id}">
                            <span>${player.fullname}</span>
                        </label>
                        
                        <input type="text" class="tiny-input" placeholder="${player.jersey_number || ''}" title="Player jersey number">
                        
                        <select id="position-${player.id}" name="position" class="small-select positions" title="Player position">
                            <option value="GK" ${player.position === 'GK' ? 'selected' : ''}>Goalkeeper</option>
                            <option value="DF" ${player.position === 'DF' ? 'selected' : ''}>Defender</option>
                            <option value="MF" ${player.position === 'MF' ? 'selected' : ''}>Midfielder</option>
                            <option value="FW" ${player.position === 'FW' ? 'selected' : ''}>Forward</option>
                        </select>
                    </span>
                </section>
            `;

            // Append the player card to the target element
            targetElement.append(playerHTML);
        });
    }).fail(function() {
        console.error('Error fetching or rendering players.');
    });
}


// Function to display phase messages
export const displayMsg = (tag, message, isError = false) => {
    $tag.show().removeClass('success error').addClass(isError ? 'error' : 'success').text(message);
};

/**
 * Extracts the game ID from a given URL.
 * Assumes the URL has the format: /dashboard/games/{gameId}/game.
 *
 * @returns {string | null} The game ID from the URL, or null if not found.
 */
export function getGameIdFromUrl() {
    const urlPath = window.location.pathname; // Get the current path, e.g., '/dashboard/games/3/game'
    const parts = urlPath.split('/'); // Split the URL path into parts

    // Find the position of "games" in the URL and return the following value (game ID)
    const gameIndex = parts.indexOf('games');
    if (gameIndex !== -1 && parts[gameIndex + 1]) {
        return parts[gameIndex + 1]; // Return the game ID
    }
    return null; // Return null if the game ID is not found
}

/**
 * Utility function to display the last 3 days, next day, and a "Live" tab.
 * Appends buttons to an element with the class 'dates'.
 * "Live" tab shows current live games and is active when the page loads.
 */
export function displayDateTabs() {
    const $datesContainer = $('.dates'); // Use jQuery to get the dates container
    const today = new Date(); // Get today's date
    const dateArray = []; // Create an array to hold the date objects

    // Generate the last 2 days, today, and the next day
    for (let i = 3; i > 0; i--) {
        const pastDate = new Date(today);
        pastDate.setDate(today.getDate() - i); // Subtract i days from today
        dateArray.push(pastDate);
    }
    dateArray.push(today); // Add today
    const nextDate = new Date(today);
    nextDate.setDate(today.getDate() + 1); // Add 1 day
    dateArray.push(nextDate);

    // Clear existing buttons (if any)
    $datesContainer.empty();

    // Create "Live" tab button
    const $liveButton = $('<button class="tab-btn link-btn" data-live="true">Live</button>');

    // Add the click event for the "Live" tab
    $liveButton.on('click', function() {
        // Remove active class from all buttons
        $('.tab-btn').removeClass('active');

        // Add active class to the clicked button (Live)
        $(this).addClass('active');

        // Get current date in the format YYYY-MM-DD
        const currentDate = today.toISOString().split('T')[0];

        // Fetch and render games for the current date (Live)
        fetchAndRenderGames(currentDate);
    });

    // Append the "Live" button to the dates container
    $datesContainer.append($liveButton);

    // Create buttons for each date
    $.each(dateArray, function(index, date) {
        const formattedDate = date.toISOString().split('T')[0]; // Get date in YYYY-MM-DD format
        const displayDate = date.toDateString() === today.toDateString() 
            ? 'Today' // Display "Today" if the date is today
            : date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: '2-digit' }); // e.g., "Wed, Oct 03"

        // Create button element using jQuery
        const $button = $(`<button class="tab-btn link-btn" data-dateid="${formattedDate}">${displayDate}</button>`);

        // Add active class to today's date button if it's not the live tab
        if (date.toDateString() === today.toDateString()) {
            $button.addClass('active'); // Set active class for today's date
        }

        // Add the click event for each date button
        $button.on('click', function() {
            // Remove active class from all buttons
            $('.tab-btn').removeClass('active');

            // Add active class to the clicked button
            $(this).addClass('active');

            // Fetch and render games for the selected date
            fetchAndRenderGames(formattedDate);
        });

        // Append button to the dates container
        $datesContainer.append($button);
    });

    // Trigger click on the "Live" button to make it the default active tab on page load
    $liveButton.trigger('click');
}


// ==============================================================
/**
 * Fetch and render games for a specific date.
 * Sends a request to the server and updates the UI with the game information.
 * 
 * @param {string} dateId - The date for which to fetch the games in YYYY-MM-DD format.
 */
export function fetchAndRenderGames(dateId) {
    const $gamesContainer = $('.games-container'); // Use jQuery to get the games container
    $gamesContainer.attr('id', `games-${dateId}`); // Update ID to match the clicked tab dateId

    // Clear existing content
    $gamesContainer.empty(); // Clear existing games if any

    $.get(`/v1/api/games/date/${dateId}`)
        .done(function(data) {
            // Check if there are games available
            if (!data || !data.games || data.games.length === 0) {
                $gamesContainer.html('<p>No games available for this date.</p>');
                return;
            }

            // Create a fragment for better performance
            const $fragment = $(document.createDocumentFragment());

            // Render the games
            $.each(data.games, function(index, game) {
                const startTime = new Date(game.start).getTime();

                // Determine what to display in the <small class="time"> tag
                let gameTimeDisplay = '';

                // Create an initial display based on game status
                if (startTime > new Date().getTime()) {
                    // Game is pending, display the start time in "HH:MM" format
                    gameTimeDisplay = new Date(game.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                } else if (new Date().getTime() >= startTime + 90 * 60 * 1000) {
                    // Game has ended, display "FT" (Full-Time)
                    gameTimeDisplay = 'FT';
                } else {
                    // Game is live, initially display 0:00, will be updated in tick function
                    gameTimeDisplay = '0:00';
                }

                // Generate the game HTML and use <small class="time"> for the time display
                const gameInfo = `
                    <div class="row bg-white small-round small-padding game-card" data-game-id="${game.id}">
                        <small class="time small-padding" id="timer-${game.id}" data-start-time="${game.start}">${gameTimeDisplay}</small>
                        <section class="column max">
                            <section class="row">
                                <span class="row max">
                                    <img src="/images/${game.homeTeamBadge}" alt="${game.homeTeamName}" class="tiny-logo mid-round">
                                    <h5 class="mid bold">${game.homeTeamName}</h5>
                                </span>
                                <h5 class="mid bold">${game.home_goal ?? 0}</h5>
                            </section>
                            <section class="row between">
                                <span class="row max">
                                    <img src="/images/${game.awayTeamBadge}" alt="${game.awayTeamName}" class="tiny-logo mid-round">
                                    <h5 class="mid bold">${game.awayTeamName}</h5>
                                </span>
                                <h5 class="mid bold move-right">${game.away_goal ?? 0}</h5>
                            </section>
                        </section>
                    </div>
                `;

                // Append game info to the fragment
                $fragment.append(gameInfo);
            });

            // Append the fragment to the container
            $gamesContainer.append($fragment);

            // Add click event listeners to game cards after they are rendered
            // addGameCardClickListener('.game-card', '/dashboard');

            // Start adding visible class for animation
            let delay = 0; // Initial delay for animation
            $('.game-card').each(function(index) {
                const $this = $(this);
                setTimeout(() => {
                    $this.addClass('visible'); // Add visible class after a delay
                }, delay);
                delay += 100; // Increment delay for each game card
            });

            // Start the timer updates after games are rendered
            startTimers();
        })
        .fail(function() {
            $gamesContainer.html('<p>Error fetching games. Please try again later.</p>');
        });
}

/**
 * Function to update the timer of live games.
 * This function will be called at regular intervals to update the timer for all games.
 */
function updateTimers() {
    $('.time').each(function() {
        const $timeElement = $(this);
        const startTime = new Date($timeElement.data('start-time')).getTime();
        const currentTime = new Date().getTime();
        const elapsed = currentTime - startTime;
        $timeElement.addClass('bold red ');


        if (elapsed > 0 && elapsed < 90 * 60 * 1000) {
            // Game is live, calculate elapsed time
            const minutes = Math.floor((elapsed / 1000) / 60);
            const seconds = Math.floor((elapsed / 1000) % 60);
            // $timeElement.text(`${minutes}:${seconds < 10 ? '0' : ''}${seconds}`);

            $timeElement.text(`${minutes}'`);

        } else if (elapsed >= 90 * 60 * 1000) {
            // Game has ended, show "FT"
            $timeElement.removeClass('red').addClass('black');
            $timeElement.text('FT');
        } else {
            // Game has not started yet, keep the scheduled start time (already displayed)
        }
    });
}

/**
 * Starts the timers for all games and updates every second.
 */
function startTimers() {
    // Update timers every second
    setInterval(updateTimers, 1000);
}

/**
 * Add click event listeners to game cards using event delegation.
 * The listener is added to the parent element, and it listens for clicks on
 * elements with the specified class.
 * 
 * If the base URL contains the word "dashboard", the generated URL will be in the format:
 * /dashboard/games/{gameId}/game.
 * Otherwise, it will be in the format: /games/{gameId}.
 * 
 * @param {string} parentSelector - The parent element that will delegate the click event.
 * @param {string} className - The class of the elements to attach the click listener.
 * @param {string} baseUrl - The base URL to use when constructing the full URL.
 */
export function addGameCardClickListener(parentSelector, className, baseUrl) {
    // Use event delegation: attach the event listener to the parent element
    $(parentSelector).on('click', className, function() {
        const gameId = $(this).data('game-id'); // Get the game ID from the clicked card

        // Determine the URL based on whether "dashboard" is in the base URL
        let fullUrl;
        if (baseUrl.includes('dashboard')) {
            fullUrl = `${baseUrl}/games/${gameId}/game`;
        } else {
            fullUrl = `${baseUrl}/${gameId}`;
        }

        // Redirect to the constructed URL
        window.location.href = fullUrl;
    });
}




// ==============================================================

/**
 * Fetches and renders the lineups for a given game, displaying home and away teams' lineups.
 * Players are sorted by position (GK first, followed by DF, MF, and FW).
 * The player details are rendered in rows with their number, name, and position.
 *
 * @param {number} gameId - The ID of the game to fetch lineups for.
 */
export function fetchAndRenderLineups(gameId) {
    window.gameId = gameId
    $.get(`/v1/api/games/${gameId}/lineups`, function(data) {
        // Check if the response contains the game lineup data
        if (!data || !data.lineup) {
            $('#msg').html('<p>No lineups available for this game.</p>');
            return;
        }

        // Clear previous content in the lineups container
        $('#msg').empty();

        // Update scores and display timer
        const $scoresContainer = $('#gamescores');
        let options = '<option value="">Select a Team</option>';
        [
            {
                id:data.lineup.teamOne.teamId,
                name: data.lineup.teamOne.teamName 
            },
            {
                id:data.lineup.teamTwo.teamId,
                name: data.lineup.teamTwo.teamName 
            }
        ].forEach(team => {
            options += `<option value="${team.id}">${team.name}</option>`;
        });
        $('.team-select').append(options);
        // console.log(data);
        
        $scoresContainer.append(`
                <h4 class="bold" id="${data.home}">${data.home_goal}</h4>
                &middot;
                <small class="time red bold" data-start-time="${data.start}">${new Date(data.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}"</small>
                &middot;
                <h4 class="bold"  id="${data.away}">${data.away_goal}</h4>
                `);

        // Render lineups for both teams
        renderTeamLineup(data.lineup.teamOne, 'hometeam', 'homelineups');
        renderTeamLineup(data.lineup.teamTwo, 'awayteam', 'awaylineups');
    }).fail(function() {
        $('#msg').html('<p>Error fetching the lineups. Please try again later.</p>');
    });
}

/**
 * Renders a team lineup with sorted players and team details.
 * @param {Object} team - The team data (badge, teamName, players).
 * @param {string} teamContainerId - The ID of the container to render the team details.
 * @param {string} lineupContainerId - The ID of the container to render the player lineups.
 */
function renderTeamLineup(team, teamContainerId, lineupContainerId) {
    const teamContainer = $(`#${teamContainerId}`);
    const lineupContainer = $(`#${lineupContainerId}`);

    // Clear previous content in the team and lineup containers
    teamContainer.empty();
    lineupContainer.empty();


    // Render team details
    teamContainer.append(`
        <img src="/images/${team.badge}" alt="" class="sm-logo small-round">
        <h4 class="bold cap">${team.teamName}</h4>
    `);

    // Sort players by position and render
    sortPlayersByPosition(team.players).forEach(player => {
        lineupContainer.append(`
            <span class="row">
                <small class="num">${player.number}</small>
                <small class="cap">${player.playerName}</small>
                <small class="uppercase move-right">${player.position}</small>
            </span>
        `);
    });
}

/**
 * Sorts players by position in the order GK, DF, MF, FW.
 * @param {Array} players - List of players to sort.
 * @returns {Array} - Sorted players by position.
 */
function sortPlayersByPosition(players) {
    const positionOrder = { GK: 1, DF: 2, MF: 3, FW: 4 };
    return players.sort((a, b) => positionOrder[a.position] - positionOrder[b.position]);
}

/**
 * Updates the game period timer based on the data-start attribute.
 */
export function updateGamePeriodTimer() {
    // Select the timer element inside #gamescores
    const $timeElement = $('#gamescores').find('.time');

    if ($timeElement.length === 0) {
        return; // Exit if no timer element found
    }

    const startTime = new Date($timeElement.data('start-time')).getTime();
    const currentTime = new Date().getTime();
    const elapsed = currentTime - startTime;
    // console.log($timeElement);


    if (elapsed > 0 && elapsed < 90 * 60 * 1000) {
        $('#gamescores').find('.time').addClass('');

        // Game is live, calculate elapsed time
        const minutes = Math.floor((elapsed / 1000) / 60);
        const seconds = Math.floor((elapsed / 1000) % 60);
        // $timeElement.text(`${minutes}:${seconds < 10 ? '0' : ''}${seconds}`);
        $timeElement.text(`${minutes}'`);

    } else if (elapsed >= 90 * 60 * 1000) {
        // Game has ended, show "FT"
        // $timeElement.removeClass('red').addClass('black')
        $('#gamescores').find('.time').removeClass('red').addClass('black')

        $timeElement.text('FT');
    }
}

// ===========================================

/**
 * Fetches and renders the summary for the specified game.
 * 
 * This function fetches game activities, game details, and scorers, then appends 
 * the summary into elements with IDs `homesummary` and `awaysummary`. It handles 
 * cases where activities and scorers are empty, and sorts them by minutes.
 * 
 * @param {number} gameId - The ID of the game to fetch data for.
 */
export function fetchAndRenderSummary(gameId) {
    const $homeSummary = $('#homesummary'); // Cache home summary DOM reference
    const $awaySummary = $('#awaysummary'); // Cache away summary DOM reference

    $.get(`/v1/api/games/${gameId}/activities`)
        .done(function (data) {
            // Clear existing content in both summaries
            $homeSummary.empty();
            $awaySummary.empty();

            const homeTeamId = data.game.home_team.id;
            const awayTeamId = data.game.away_team.id;

            // Combine home and away team activities and scorers
            const homeActivities = [
                ...data.activities.filter(activity => activity.team_id == homeTeamId && (activity.type == 'yellow' || activity.type == 'red')),
                ...data.scorers.filter(scorer => scorer.club_id == homeTeamId)
            ];

            const awayActivities = [
                ...data.activities.filter(activity => activity.team_id == awayTeamId && (activity.type == 'yellow' || activity.type == 'red')),
                ...data.scorers.filter(scorer => scorer.club_id == awayTeamId)
            ];

            // Sort combined activities by minutes
            const sortActivities = (activity) => parseInt(activity.minutes || activity.minute);
            homeActivities.sort((a, b) => sortActivities(a) - sortActivities(b));
            awayActivities.sort((a, b) => sortActivities(a) - sortActivities(b));

            // Render home team activities and scorers
            if (homeActivities.length == 0) {
                // $homeSummary.append('<p>No activities for the home team yet.</p>');
            } else {
                homeActivities.forEach(activity => {
                    if (activity.goal) {
                        $homeSummary.append(renderScorer(activity));
                    } else {
                        // Only append activities if they are yellow or red cards
                        if (activity.type == 'yellow' || activity.type == 'red') {
                            $homeSummary.append(renderActivity(activity));
                        }
                    }
                });
            }

            // Render away team activities and scorers
            if (awayActivities.length == 0) {
                // $awaySummary.append('<p>No activities for the away team yet.</p>');
            } else {
                awayActivities.forEach(activity => {
                    if (activity.goal) {
                        $awaySummary.append(renderScorer(activity));
                    } else {
                        // Only append activities if they are yellow or red cards
                        if (activity.type == 'yellow' || activity.type == 'red') {
                            $awaySummary.append(renderActivity(activity));
                        }
                    }
                });
            }

        })
        .fail(function (error) {
            console.error('Error fetching game activities:', error);
            const errorHtml = '<p>Error loading game activities.</p>';
            $homeSummary.append(errorHtml);
            $awaySummary.append(errorHtml);
        });
}

  
  /**
   * Renders an activity (goal or card) as HTML and appends it.
   * 
   * This function creates an HTML section for the activity type (goal or card) 
   * with the appropriate icon and class (yellow, red, or goal) depending on the 
   * activity type and color.
   * 
   * @param {Object} activity - The activity object containing details about the activity.
   * @param {string} activity.type - The type of the activity (e.g., 'goal', 'yellow', 'red').
   * @param {string} activity.player - The player's name involved in the activity.
   * @param {number} activity.minute - The minute of the game when the activity occurred.
   * @returns {string} - The HTML string representing the activity.
   */
  export function renderActivity(activity) {
    let activityHtml = '';
  
    // Check activity type and render accordingly
    if (activity.type === 'goal') {
      activityHtml = `
        <section class="typegoal">
          <i class="fa fa-soccer-ball tiny"></i>
          <small class="tiny cap">${activity.minute}'</small>
          <small class="tiny cap">${activity.player}</small>
        </section>`;
    } else if (activity.type == 'yellow' || activity.type === 'red') {
      // Render yellow or red card
      const cardClass = activity.type == 'yellow' ? 'yellow' : 'red';
      activityHtml = `
        <section class="typecard">
          <i class="fa fa-square ${cardClass} tiny" aria-hidden="true"></i>
          <small class="tiny cap">${activity.minutes}'</small>
          </section>`;
    }
  
    return activityHtml;
  }
  
  /**
   * Renders a scorer as HTML and appends it.
   * 
   * This function creates an HTML section to display details about the scorer, 
   * including the player's name and the minute they scored.
   * 
   * @param {Object} scorer - The scorer object containing details about the scoring event.
   * @param {string} scorer.name - The name of the player who scored.
   * @param {number} scorer.minutes - The minute at which the player scored.
   * @returns {string} - The HTML string representing the scorer.
   */
  function renderScorer(scorer) {
    return `
      <section class="typegoal">
        <i class="fa fa-soccer-ball tiny"></i>
        <small class="tiny cap">${scorer.minutes}'</small>
        <small class="tiny cap">${scorer.fullname}</small>
      </section>`;
  }
  