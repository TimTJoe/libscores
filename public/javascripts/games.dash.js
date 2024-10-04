import { populatePositions, displayDateTabs, populateSeasonsSelectors } from "./utils.js";

$(document).ready(function () {
    displayDateTabs();
    populatePositions()
    populateSeasonsSelectors()
});