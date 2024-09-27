export function formatDate(date) {
    let _date = new Date(date);
    let formatedDate = new Intl.DateTimeFormat("us-EN", {
      month: "short",
      day: "2-digit",
      year: "numeric"
    }).format(_date);
  
    return formatedDate;
  }

  export function removeWordFromEnd(text, word) {
    if (text.endsWith(word)) {
      return text.slice(0, -word.length).trim();
    }
    return text;
  }

  export function getPageUrl() {
    let url = $(location).attr('href');
    return url.replace(/\/\s*$/, "").split('/').pop();
  }
  export function getPage() {
    let url = $(location).attr('href');

// Remove any trailing slash, then split the URL by '/'
let segments = url.replace(/\/\s*$/, "").split('/');

// Return the second-to-last segment (the page name)
return segments.length > 1 ? segments[segments.length - 2] : null;
  }
  

  export function showSnackbar(message) {
    var snackbar = $('#snackbar');
    snackbar.text(message); // Set the dynamic text
  
    snackbar.addClass('show');
  
    // After 3 seconds, remove the show class to hide the snackbar
    setTimeout(function() {
      snackbar.removeClass('show');
    }, 3000);
  }
  
  export function calculateAge(dateString) {
    const today = new Date();
    const birthDate = new Date(dateString);

    // Calculate the difference in years, months, and days
    let years = today.getFullYear() - birthDate.getFullYear();
    let months = today.getMonth() - birthDate.getMonth();
    let days = today.getDate() - birthDate.getDate();

    // Adjust if the current month/day is before the birth month/day
    if (days < 0) {
        months--;
        days += new Date(today.getFullYear(), today.getMonth(), 0).getDate();
    }

    if (months < 0) {
        years--;
        months += 12;
    }

    // Return the result based on the time passed
    if (years > 0) {
        return `${years} year${years > 1 ? 's' : ''} old`;
    } else if (months > 0) {
        return `${months} month${months > 1 ? 's' : ''} old`;
    } else {
        return `${days} day${days > 1 ? 's' : ''} old`;
    }
}

export function getEditions() {
  let res = {editions: null}
  $.get("/admin/cm/editions/all",
    function (data, textStatus, jqXHR) {
        if(textStatus == "success") {
            res.editions = data.editions
        } else {
            console.error("An error occurred")
        }
    },
    "json"
  );
return res
}
export function getCounties() {
  let result = {one: null}
  $.get("/admin/counties/all", function (data, textStatus, jqXHR) {
        if(textStatus == "success") {
          result.counties = data.counties
          result.all = data
        } else {
          console.error("An error occurred")
        }
      },
      "json"
    );
  return result
}
export function getMatches() {
  let res = {matches: null}
  $.get("/admin/cm/matches/all",
    function (data, textStatus, jqXHR) {
        if(textStatus == "success") {
           res.matches = data.matches
        }  else {
            console.error("An error occurred fetching martches")
        }
    },
    "json"
);
return res
}
export function getGroups() {
  let res = {groups: null}
  $.get("/admin/cm/groups/all",
    function (data, textStatus, jqXHR) {
      res.groups = data.matches
    },
    "json"
);
return res
}
export function getlineups() {
  let res = {lineups: null}
  $.get("/admin/cm/linenups/all",
    function (data, textStatus, jqXHR) {
      res.lineups = data.lineups
    },
    "json"
);
return res
}
export function getPlayers() {
  let res = {players: null}
  $.get("/admin/cm/players/all",
    function (data, textStatus, jqXHR) {
      res.players = data.players
    },
    "json"
);
return res
}
export function getAll(params) {
  let res = {params: null}
  $.get(`/admin/cm/${params}/all`,
    function (data, textStatus, jqXHR) {
      res[params] = data[params]
    },
    "json"
);
return res
}

