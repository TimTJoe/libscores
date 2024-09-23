var URLv1="https://www.thesportsdb.com/api/v1/json/3/search_all_leagues.php?c=Liberia";
var tableUrl = "https://www.thesportsdb.com/api/v1/json/3/lookuptable.php?l=5244&s=2022-2023"


$(document).ready(function () {
        $.ajax({
          url: tableUrl,
          method: 'GET',
          success: function (data) {
            const standing = data.table
            $.each(data.table, function (index, team) { 
              // console.log(team)
               
              $(` 
                  <tr class="tr ${team.intRank == 1 ? 'lead' : team.intRank >= 13 ? 'dead' : ''}">
                    <td class="td">${team.intRank}</td>
                    <td class="first wide td row">
                        <img src="${team.strBadge}" class="tiny-logo">
                        <span>${team.strTeam}</span>
                    </td>
                    <td class="td">${team.intPlayed}</td>
                    <td class="td">${team.intWin}</td>
                    <td class="td">${team.intDraw}</td>
                    <td class="td">${team.intLoss}</td>
                    <td class="td">${team.intGoalsFor}:${team.intGoalsAgainst}</td>
                    <td class="td">${team.intPoints}</td>
                </tr>
                `
              ).appendTo(`#tbody`);  // Adjust target as necessary
            });
    
            },
            error: function (err) {
              console.error(`Error fetching data for table div: `, err);
            }
        });
});