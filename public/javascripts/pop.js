document.addEventListener('click', (event) => {
const openPopup = document.getElementById("openPopup");
const closePopup = document.getElementById("closePopup");
const popup = document.getElementById("popup");
const overlay = document.getElementById("overlay");
const openContribute = document.getElementById("contribute");
const closeBtn = document.getElementById("closeBtn");
const contributeBtn = document.getElementById("contributeButton")
const overaActive = document.getElementById("overactive");


openPopup.onclick = function(){
    popup.style.display = "block";
    overlay.style.display = "block";
};
closePopup.onclick = function(){
    popup.style.display = "none";
    overlay.style.display = "none";
};

openContribute.onclick = function(){
    contributeBtn.style.display = "block";
    overaActive.style.display = "block"
};
closeBtn.onclick = function(){
    contributeBtn.style.display = "none";
    overaActive.style.display = "none";
};  

});

const searchTeam = async (teamName) => {
    try {
        const response = await fetch('/data/teams.json');
        console.log('Response status:', response.status); // Debugging line
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log('Data fetched successfully:', data); // Debugging line
        const allTeams = [...data.LFA_First_Division, ...data.LFA_Second_Division, ...data.LFA_Women_League, ...data.County_Meet];
        const filteredTeams = allTeams.filter(team => team.name.toLowerCase().includes(teamName.toLowerCase()));
        console.log('Filtered teams:', filteredTeams); // Debugging line
        return filteredTeams;
    } catch (error) {
        console.error('Error:', error);
    }
};

const performSearch = () => {
    const teamName = document.getElementById('search-bar').value;
    console.log('Search term:', teamName); // Debugging line
    if (teamName.length > 0) {
        searchTeam(teamName).then(teams => {
            const resultsUl = document.getElementById('search-results');
            resultsUl.innerHTML = ''; // Clear previous results

            if (teams && teams.length > 0) {
                teams.forEach(team => {
                    const li = document.createElement('li');
                    li.classList.add('dropdown-item');
                    
                    const img = document.createElement('img');
                    img.src = team.logo;
                    img.alt = `${team.name} logo`;
                    img.classList.add('team-logo');

                    const div = document.createElement('div');
                    div.classList.add('team-info');

                    const teamName = document.createElement('h4');
                    teamName.textContent = team.name;
                    teamName.classList.add('team-name');

                    const leagueName = document.createElement('p');
                    leagueName.textContent = team.league;
                    leagueName.classList.add('league-name');

                    div.appendChild(teamName);
                    div.appendChild(leagueName);
                    li.appendChild(img);
                    li.appendChild(div);
                    resultsUl.appendChild(li);
                });
            } else {
                const li = document.createElement('li');
                li.textContent = 'No teams found or check the spelling';
                resultsUl.appendChild(li);
            }
        }).catch(error => {
            console.error('Error in performSearch:', error);
        });
    } else {
        document.getElementById('search-results').innerHTML = ''; // Clear results if input is empty
    }
};

document.getElementById('mobile-menu').addEventListener('click', function() {
    const navMenu = document.querySelector('.nav-menu');
    navMenu.classList.toggle('active');
});
