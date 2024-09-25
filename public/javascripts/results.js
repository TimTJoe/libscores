import { formatDate, removeWordFromEnd, getPageUrl, getPage } from "/javascripts/utils.js";
const leagueApiMap = {
    'l1': 'https://www.scorebar.com/api/league//tournament/1534/liberia-first-division',
    'l2': 'https://www.scorebar.com/api/league//tournament/2315/liberia-second-division',
    'wl': 'https://www.scorebar.com/api/league//tournament/1565/liberia-national-league-women',
    'cm': "/admin/cm/matches/all"
  };

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
            case 'fixtures':
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
function fetchCMGames(page) {
  $.get("/admin/cm/matches/all",
    function (data, textStatus, jqXHR) {

        if(textStatus == "success") {
            $(".loader").hide();
            let games = data.matches
            let currentDate = new Date();

            const sortedGames = Object.values(games).filter(item => {
                    const gameDate = new Date(item.match_date.replace(' ', 'T'))

                    switch (page) {
                      case 'results':
                        return gameDate < currentDate
                        case 'fixtures':
                          return gameDate >= currentDate;  // Future games
                      case 'past':
                        return gameDate < currentDate;  // Past games
                      default:
                        return [];  // Return an empty array if no valid page parameter is provided
                    }
                  }).sort((a, b) => new Date(b.match_date) - new Date(a.match_date));

           if (sortedGames.length > 1) {
                sortedGames.forEach(match => {
                    $(
                    `<section class="box row padding matches">
                    <h3 class="${'black'} margin-right column center-align small">
                        <span>${match.start_time}</span>
                        <span>${formatDate(match.match_date)}</span>
                    </h3>
                    <section class="column max cap">
                        <span class="row">
                            <img src="/images/shield.webp" alt="" class="sm-logo">
                            <h3 class="bold max">${match.home_team}</h3>
                            <h3 class="${ new Date(match.match_date) < new Date() ?   'black' : 'red'}">${ new Date(match.match_date) < new Date() ?   match.score_1 : ''}</h3>
                        </span>
                        <span class="row">
                            <img src="/images/shield.webp" alt="" class="sm-logo">
                            <h3 class="bold max">${match.away_team}</h3>
                            <h3 class="${ new Date(match.match_date) < new Date() ?   'black' : 'red'}">${ new Date(match.match_date) < new Date() ?   match.score_2 : ''}</h3>
                        </span>
                    </section>`
                ).appendTo("#container")})
           } else {
            $(`<h1 class="hugh center">No upcoming game found</h1>`).appendTo("#container")
           }

        }  else {
            console.error("An error occurred fetching martches")
        }
    },
    "json"
);
  }
  

  $(document).ready(function () {
    let page = getPageUrl();

    switch (getPage()) {
      case "first_division":
        switch (page) {
          case "results":
            fetchLeagueData(leagueApiMap.l1, page);
            break;
          case "fixtures":
            fetchLeagueData(leagueApiMap.l1, "fixtures");
            break;
        }
        break;
    
      case "second_division":
        switch (page) {
          case "results":
            fetchLeagueData(leagueApiMap.l2, page);
            break;
          case "fixtures":
            fetchLeagueData(leagueApiMap.l2, "fixtures");
            break;
        }
        break;
    
      case "women_league":
        switch (page) {
          case "results":
            fetchLeagueData(leagueApiMap.wl, page);
            break;
          case "fixtures":
            fetchLeagueData(leagueApiMap.wl, "fixtures");
            break;
        }
        break;

        case "county_meet":
          switch (page) {
            case "results":
              fetchCMGames(page)
              break;
              case "fixtures":
                fetchCMGames(page)
              break;
           
          }
    }
    
  });

  $(document).on({
    ajaxStart: function () {
      $("#loader").show();
    },
    ajaxStop: function () {
      $("#loader").hide();
    }
  })
