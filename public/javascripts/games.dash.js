import { populatePositions, displayDateTabs, populateSeasonsSelectors,addGameCardClickListener } from "./utils.js";

$(document).ready(function () {
    displayDateTabs();
addGameCardClickListener('.games-container', '.game-card', '/dashboard');
    populatePositions()
    populateSeasonsSelectors()
});