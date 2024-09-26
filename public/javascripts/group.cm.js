import { formatDate, removeWordFromEnd } from "/javascripts/utils.js";


$(document).ready(function () {
    $.get("/admin/cm/groups/all",
        function (data, textStatus, jqXHR) {
            let groups = data.groups
            let groupA = Object.values(groups).filter(group => group.groups == "a")
            let groupB = Object.values(groups).filter(group => group.groups == "b")
            let groupC = Object.values(groups).filter(group => group.groups == "b")
            let groupD = Object.values(groups).filter(group => group.groups == "c")
            $.each(groupA, function (index, team) { 
                    $(` 
                        <tr class="tr">
                          <td class="td">${index + 1}</td>
                          <td class="first wide td row">
                              <img src="/images/${team.flag}" class="tiny-logo">
                              <span class="cap">${removeWordFromEnd(team.county, "county")}</span>
                          </td>
                          <td class="td">0</td>
                          <td class="td">0</td>
                          <td class="td">0</td>
                          <td class="td">0</td>
                          <td class="td">0:0</td>
                          <td class="td">0</td>
                      </tr>
                      `
                    ).appendTo(`#tabody`);  // Adjust target as necessary
              });
            $.each(groupB, function (index, team) { 
                    $(` 
                        <tr class="tr">
                          <td class="td">${index + 1}</td>
                          <td class="first wide td row">
                              <img src="/images/${team.flag}" class="tiny-logo">
                              <span class="cap">${removeWordFromEnd(team.county, "county")}</span>
                          </td>
                          <td class="td">0</td>
                          <td class="td">0</td>
                          <td class="td">0</td>
                          <td class="td">0</td>
                          <td class="td">0:0</td>
                          <td class="td">0</td>
                      </tr>
                      `
                    ).appendTo(`#tbbody`);  // Adjust target as necessary
              });
            $.each(groupC, function (index, team) { 
                    $(` 
                        <tr class="tr">
                          <td class="td">${index + 1}</td>
                          <td class="first wide td row">
                              <img src="/images/${team.flag}" class="tiny-logo">
                              <span class="cap">${removeWordFromEnd(team.county, "county")}</span>
                          </td>
                          <td class="td">0</td>
                          <td class="td">0</td>
                          <td class="td">0</td>
                          <td class="td">0</td>
                          <td class="td">0:0</td>
                          <td class="td">0</td>
                      </tr>
                      `
                    ).appendTo(`#tcbody`);  // Adjust target as necessary
              });
            $.each(groupD, function (index, team) { 
                    $(` 
                        <tr class="tr">
                          <td class="td">${index + 1}</td>
                          <td class="first wide td row">
                              <img src="/images/${team.flag}" class="tiny-logo">
                              <span class="cap">${removeWordFromEnd(team.county, "county")}</span>
                          </td>
                          <td class="td">0</td>
                          <td class="td">0</td>
                          <td class="td">0</td>
                          <td class="td">0</td>
                          <td class="td">0:0</td>
                          <td class="td">0</td>
                      </tr>
                      `
                    ).appendTo(`#tdbody`);  // Adjust target as necessary
              });

        },
        "json"
    );

    $("#saveGroup").on("click", function (evt) {
        let edition = $('#groupEdition').val()
        let county = $('#counties').val()
        let group = $('#group').val()
    
        let newData = {edition,county,group}
        $.ajax({
            type: "POST",
            url: "/admin/cm/groups",
            data: newData,
            dataType: "json",
            success: function (response) {
               location.reload()
            },
            error: function (err) {
                console.error(err)
            }
        });
    })
});