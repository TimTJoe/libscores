import { calculateAge } from "/javascripts/utils.js";


$(document).ready(function () {
    $.get("/admin/cm/players/all",
        function (data, textStatus, jqXHR) {
            console.log(data)
            data.players.forEach(player => {
                $(`
                     <section class="row bg-white small-padding small-round align-top">
                        <img src="/images/${player.photo}" alt="" srcset="" class="mid-img">
                        <img src="/images/${player.flag}" alt="" srcset="" class="sm-img">
                        <span class="column no-gap">
                            <h3 class="bold no-line">${player.first_name} ${player.middle_name} ${player.last_name}</h3>
                            <small class="mid muted bold">${calculateAge(player.DOB)}</small>
                            <small class="small muted cap">${player.county}</small>
                        </span>
                    </section>
                    `).prependTo("#playerList");
            });
        },
        "json"
    );

});

$("#addPlayer").on("submit", function (evt) {
})