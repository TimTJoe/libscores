import { formatDate, removeWordFromEnd } from "/javascripts/utils.js";


// Function to fetch data for a specific league from the given URL
  function fetchLeagueData(apiUrl, divId) {
    $.ajax({

      url: apiUrl,
      method: 'GET',
      success: function (data) {
        let { league, games } = data.result;

    // Convert 'games' object into an array and sort by time in descending order
    const sortedGames = Object.values(games).sort((a, b) => new Date(b.time.start) - new Date(a.time.start));

    sortedGames.forEach(item => {
    $(` 
        <section class="box row padding margin-top padding-right">
            <h3 class="${item.status == 3 ? 'black' : 'red'} margin-right column center-align small">
            <span>${item.status == 3 ? 'FT' : '90'}</span>
            <span>${formatDate(item.time.start)}</span>
            </h3>
            <section class="column max">
                <span class="row">
                    <img src="${item.teams.home.logo ? item.teams.home.logo : '/images/shield.webp' }" alt="" class="xs-logo">
                    <h3 class="bold max">${removeWordFromEnd(item.teams.home.name, "Women")}</h3>
                    <h3 class="${item.status == 3 ? 'black' : 'red'}">${item.score.summary.score1}</h3>
                </span>
                <span class="row">
                    <img src="${item.teams.away.logo ? item.teams.away.logo : '/images/shield.webp' }" alt="" class="xs-logo">
                    <h3 class="bold max">${removeWordFromEnd(item.teams.away.name, "Women")}</h3>
                    <h3 class="${item.status == 3 ? 'black' : 'red'}">${item.score.summary.score1}</h3>
                </span>
            </section>
        </section>`
    ).appendTo(`#${divId}`);  // Adjust target as necessary
    });
      },
      error: function (err) {
        console.error(`Error fetching data for div ${divId}: `, err);
      }
    });
  }



  $(document).on({
    ajaxStart: function () {
      $("#loader").show();
    },
    ajaxStop: function () {
      $("#loader").hide();
    }
  })

  $(document).ready(function () {
    fetchLeagueData('https://www.scorebar.com/api/league//tournament/1534/liberia-first-division', 'l1')
  });
