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

