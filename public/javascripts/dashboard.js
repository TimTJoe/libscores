import { populateSeasonsSelect, fetchTeamSuggestions, populatePhasesSelect, populateSeasonsSelectors } from "./utils.js";

$(document).ready(function () {
    populateSeasonsSelectors()
    $("#back").on('click', async () => {
        window.history.back()
     })
});