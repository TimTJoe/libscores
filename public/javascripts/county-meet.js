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
});