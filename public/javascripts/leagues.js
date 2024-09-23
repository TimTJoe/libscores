import { formatDate, removeWordFromEnd, getPageUrl, getPage } from "/javascripts/utils.js";


function fetchLeagueData(apiUrl, page) {
    $.ajax({
      url: apiUrl,
      method: 'GET',
      success: function(data) {
        let { league, games } = data.result;
        
        // Get the current date and time
        const currentDate = new Date();
  
        // Convert 'games' object into an array and filter based on the page parameter
        const filteredGames = Object.values(games).filter(item => {
          const gameDate = new Date(item.time.start.replace(' ', 'T'));  // Convert to ISO 8601 format
  
          switch (page) {
            case 'live':
              return gameDate <= currentDate && item.status !== 3;  // Live games: in progress
            case 'future':
              return gameDate > currentDate;  // Future games
            case 'past':
              return gameDate < currentDate;  // Past games
            default:
              return [];  // Return an empty array if no valid page parameter is provided
          }
        }).sort((a, b) => new Date(b.time.start.replace(' ', 'T')) - new Date(a.time.start.replace(' ', 'T')));  // Sort by time in descending order

        console.log(filteredGames)
  
        // Insert filtered games into the specified container
        if(filteredGames.length > 1){
            filteredGames.forEach(item => {
              $(` 
                <section class="box row padding padding-right">
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
              ).appendTo(`#container`);  // Insert into the specified container
            });
        } else {
            $(`<h1 class="hugh center">No upcoming game found</h1>`).appendTo("#container")
        }
      },
      error: function(err) {
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
    if(getPage() == "first_division"){
      let page = getPageUrl()
      if(page == "results") {
          fetchLeagueData('https://www.scorebar.com/api/league//tournament/1534/liberia-first-division', page)
      }
      if(page == "fixtures") {
          fetchLeagueData('https://www.scorebar.com/api/league//tournament/1534/liberia-first-division', "future")
      }
    }
  });

