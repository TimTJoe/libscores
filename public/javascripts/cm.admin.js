import { formatDate, removeWordFromEnd } from "/javascripts/utils.js";


$(document).ready(function () {

    //get and display all editions
    $.get("/admin/cm/all",
        function (data, textStatus, jqXHR) {
            if(textStatus == "success") {
                console.log(data.editions)
                data.editions.forEach(edition => {
                   $( `
                      <section class="bg-white small-padding column small-round">
                        <span class="row large">
                            <h4>${edition.edition}</h4>
                            &middot;
                            <small>${edition.host}</small>
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
                })
            } else {
                console.error("An error occurred")
            }
        },
        "json"
    );

    $("#saveEdition").on("click", function saveEdition(evt) {
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
                          <small>Host: ${edition.host}</small>
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
            },
            error: function (err) {
                console.error(err)
            }
        });
    })
});

function renderEditions() {
    $("#editionList").load("/admin/cm/all", function (response, status, request) {
        this; // dom element
        console.log(response)
    });
}

function getEditions() {
    
    let editions = {}
    $.get("/admin/cm/all",
        function (data, textStatus, jqXHR) {
            if(textStatus == "success") {
                editions.data = data
                return editions
            } else {
                console.error("An error occurred")
            }
        },
        "json"
    );
    return editions
}
