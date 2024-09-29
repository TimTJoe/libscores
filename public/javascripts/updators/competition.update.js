import { makeEditable } from "./editable.update.js";

$(document).ready(function () {
    makeEditable('#editteam', '.info', '#message', '/dashboard/competitions'); // Update route to competitions
});