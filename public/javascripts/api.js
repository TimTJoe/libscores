function fetchJSONData() {
    // fetch("https://www.thesportsdb.com/api/v1/json/3/searchteams.php?t=Arsenal")
    fetch("https://www.scorebar.com/api/league//tournament/1339/andorra-premier-division")
        .then((res) => {
            if (!res.ok) {
                throw new Error
                    (`HTTP error! Status: ${res.status}`);
            }
            return res.json();
        })
        .then((data) => 
              console.log(data.result.games))
        .catch((error) => 
               console.error("Unable to fetch data:", error));
}
var data = fetchJSONData();
console.log(data)