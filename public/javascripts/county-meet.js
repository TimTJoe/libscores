import { formatDate, removeWordFromEnd } from "/javascripts/utils.js";


$(document).ready(function () {
    $.get("/admin/cm/editions/all",
        function (data, textStatus, jqXHR) {
            if(textStatus == "success") {
                data.editions.forEach(edition => {
                    $( `
                        <option value="${edition.id}">${edition.edition}</option>
                     `).prependTo("#cmEditions");
                })
                
            } else {
                console.error("An error occurred")
            }
        },
        "json"
    );

    $("#cmEditions").on("select", function (evt) {
        let value = evt.target.value()
        alert(value)
    });

    $.get("/admin/cm/matches/all",
        function (data, textStatus, jqXHR) {

            if(textStatus == "success") {
                
                $(".loader").hide();
                let games = data.matches
                 // Convert 'games' object into an array and sort by time in descending order
                const sortedGames = Object.values(games).sort((a, b) => new Date(b.match_date) - new Date(a.match_date));

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
                            <h3 class="red">${ new Date(match.match_date) > new Date() ?   match.score_1 : ''}</h3>
                        </span>
                        <span class="row">
                            <img src="/images/shield.webp" alt="" class="sm-logo">
                            <h3 class="bold max">${match.away_team}</h3>
                            <h3 class="red">${ new Date(match.match_date) > new Date() ?   match.score_2 : ''}</h3>
                        </span>
                    </section>`
                ).appendTo("#container")})
            }  else {
                console.error("An error occurred fetching martches")
            }
        },
        "json"
    );


});