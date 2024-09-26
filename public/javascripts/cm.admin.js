import { formatDate, showSnackbar } from "/javascripts/utils.js";
    let year = new Date().getFullYear();
    let years = Array.from(new Array(5), (v, idx) => year - idx);


$(document).ready(function () {

    //get and display all editions
    $.get("/admin/cm/editions/all",
        function (data, textStatus, jqXHR) {
            if(textStatus == "success") {
                data.editions.forEach(edition => {
                   $( `
                      <section class="bg-white small-padding column small-round">
                        <span class="row large">
                            <h4>${edition.edition}</h4>
                            &middot;
                            <small class="cap">${edition.host}</small>
                        </span>
                        <span class="row muted small">
                            <small>Start: ${formatDate(edition.start)}</small>
                            &middot;
                            <small>End: ${formatDate(edition.end)}</small>
                            &middot;
                            <small>By: The Admin</small>
                        </span>
                    </section>
                    `).prependTo("#editionList");
                    $( `
                        <option value="${edition.id}">${edition.edition}</option>
                     `).prependTo("#matchEdition");
                    $( `
                        <option value="${edition.id}">${edition.edition}</option>
                     `).prependTo("#groupEdition");
                })

                
            } else {
                console.error("An error occurred")
            }
        },
        "json"
    );

    $.get("/admin/counties/all",
        function (data, textStatus, jqXHR) {
            if(textStatus == "success") {
                data.counties.forEach(county => {
                   $( `
                       <option value="${county.county}">${county.county}</option>
                    `).prependTo("#editionHost");

                   $( `
                       <option value="${county.county}">${county.county}</option>
                    `).prependTo("#matchHomeTeam");
                   $( `
                       <option value="${county.county}">${county.county}</option>
                    `).prependTo("#matchAwayTeam");
                   $( `
                       <option value="${county.id}">${county.county}</option>
                    `).prependTo("#counties");
                   
                })
            } else {
                console.error("An error occurred")
            }
        },
        "json"
    );

    $.get("/admin/cm/matches/all",
        function (data, textStatus, jqXHR) {
            if(textStatus == "success") {
                data.matches.forEach(match => {
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
                            <h3 class="red">${match.score_1}</h3>
                        </span>
                        <span class="row">
                            <img src="/images/shield.webp" alt="" class="sm-logo">
                            <h3 class="bold max">${match.away_team}</h3>
                            <h3 class="red">${match.score_2}</h3>
                        </span>
                    </section>`
                ).prependTo("#matchList")})
            }  else {
                console.error("An error occurred fetching martches")
            }
        },
        "json"
    );



     years.map((year,idx) =>  {
        $(`<option value="${year}">${year}</option>`).prependTo("#edition")
    })

    $("#saveEdition").on("click", function saveEdition(evt) {
        $("#saveEdition").disabled = true
        let edition = $("#edition").val()
        let start = $("#editionStart").val()
        let end = $("#editionEnd").val()
        let host = $("#editionHost").val()

        let newData = {edition,start,end,host}

        $.ajax({
            type: "POST",
            url: "/admin/cm",
            data: newData,
            dataType: "json",
            success: function (response) {
                let edition = response.data[0]
                $( `
                    <section class="bg-white small-padding column small-round">
                      <span class="row large">
                          <h4>${edition.edition}</h4>
                          &middot;
                          <small class="cap">${edition.host}</small>
                      </span>
                      <span class="row muted small">
                          <small>Start: ${formatDate(edition.start)}</small>
                          &middot;
                          <small>End: ${formatDate(edition.end)}</small>
                          &middot;
                          <small>By: The Admin</small>
                      </span>
                  </section>
                  `).prependTo("#editionList");
                showSnackbar("Match Added Successfully")

            },
            error: function (err) {
                console.error(err)
            }
        });
    })

    $("#saveMatch").on("click", function saveMatch(evt) {
        $("#saveEdition").disabled = true
        let edition_id = $("#matchEdition").val()
        let home_team = $("#matchHomeTeam").val()
        let away_team = $("#matchAwayTeam").val()
        let match_date = $("#matchDate").val()
        let start_time = $("#matchTime").val()
        let score_2 = $("#matchAwayTeamScore").val()
        let score_1 = $("#matchHomeTeamScore").val()

        let newData = {home_team, away_team, score_1, score_2, match_date, start_time, edition_id}
        $.ajax({
            type: "POST",
            url: "/admin/cm/matches",
            data: newData,
            dataType: "json",
            success: function (response) {
                let data = response.data[0]
                $(
                    `<section class="box row padding matches">
                    <h3 class="${'black'} margin-right column center-align small">
                        <span>${data.start_time}</span>
                        <span>${formatDate(data.match_date)}</span>
                    </h3>
                    <section class="column max cap">
                        <span class="row">
                            <img src="/images/shield.webp" alt="" class="sm-logo">
                            <h3 class="bold max">${data.home_team}</h3>
                            <h3 class="red">${data.score_1}</h3>
                        </span>
                        <span class="row">
                            <img src="/images/shield.webp" alt="" class="sm-logo">
                            <h3 class="bold max">${data.away_team}</h3>
                            <h3 class="red">${data.score_2}</h3>
                        </span>
                    </section>`
                ).prependTo("#matchList")
            },
            error: function (err) {
                console.error(err)
            }
        });
    })
});


