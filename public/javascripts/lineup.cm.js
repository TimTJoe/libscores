import { getCounties, getAll } from "/javascripts/utils.js";

$(document).ready(function () {
    let counties = getCounties()
    console.log(counties)
    counties.map(county => {
        $(`<option value="${county.id}">${county.county}</option>`).prependTo("#team")
    });
        
});