import { formatDate, removeWordFromEnd } from "/javascripts/utils.js";

// Mapping of div IDs to their respective API URLs
const leagueApiMap = {
    'l1': 'https://www.scorebar.com/api/league//tournament/1534/liberia-first-division',
    'l2': 'https://www.scorebar.com/api/league//tournament/2315/liberia-second-division',
    'l3': 'https://www.scorebar.com/api/league//tournament/1565/liberia-national-league-women',
  };
  // Define an array of league data
  const leaguesHeaders = [
    { id: "l1", name: "Orange First Division League", image: "/images/league_1.png", link: "/first_division" },
    { id: "l2", name: "Orange Second Division League", image: "/images/league_2.jpg", link: "/second_division" },
    { id: "l3", name: "National Women League", image: "/images/women_league.jpg", link: "/women_league" },
];
  // Function to fetch data for a specific league from the given URL
  function fetchLeagueData(apiUrl, divId) {
    $.ajax({

      url: apiUrl,
      method: 'GET',
      success: function (data) {
        let { league, games } = data.result;
        $(".loader").hide();

      // Convert 'games' object into an array and sort by time in descending order
      const sortedGames = Object.values(games).sort((a, b) => new Date(b.time.start) - new Date(a.time.start));

      sortedGames.forEach(item => {
      $(` 
          <section class="box row padding">
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
  
  // Set up an IntersectionObserver to watch each league's div
  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const divId = entry.target.id;
        const apiUrl = leagueApiMap[divId];  // Get the corresponding API URL
        if (apiUrl) {
          fetchLeagueData(apiUrl, divId);
          leaguesHeaders.forEach(league => {
            if($(`#${league.id}`).find("section.league-header").length == 0) {
              $(`<section class="header-section league-header">
                  <a href="${league.link}/results" class="bg-gray row margin-top small-round">
                      <img src="${league.image}" alt="" class="xs-logo margin-left round">
                      <h3 class="large bold">${league.name}</h3>
                      <i class="fa-solid fa-chevron-right move-right margin-right"></i>
                  </a>
                </section>`).prependTo(`#${league.id}`)
            }
          });
          observer.unobserve(entry.target);  // Stop observing after data is fetched
        }
      }
    });
  }, { threshold: 0.5 });  // Adjust threshold as needed
  
  // Observe each league div
  $('.league-container').each(function() {
    observer.observe(this);  // Observe the league's div
  });

  
  $(document).on({
    ajaxStart: function() {
        // Show the loader when AJAX starts
        $(".loader").show();
    },
    ajaxStop: function() {
      
    },
});

