import { populatePositions,displayDateTabs,  populateSeasonsSelect, populateSeasonsSelectors } from "./utils.js";

$(document).ready(function () {
    // Call the utility function to display the date tabs on page load
    displayDateTabs();
    
    populatePositions()
    populateSeasonsSelectors()
});