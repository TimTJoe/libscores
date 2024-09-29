document.addEventListener('click', (event) => {
    const openPopup = document.getElementById("openPopup");
    const closePopup = document.getElementById("closePopup");
    const popup = document.getElementById("popup");
    const overlay = document.getElementById("overlay");
    const openContribute = document.getElementById("contribute");
    const closeBtn = document.getElementById("closeBtn");
    const contributeBtn = document.getElementById("contributeButton");
    const overaActive = document.getElementById("overactive");

    // Open the contribute modal
    openContribute.onclick = function() {
        contributeBtn.style.display = "block";
        overaActive.style.display = "block";
    };

    // Close the contribute modal
    closeBtn.onclick = function() {
        contributeBtn.style.display = "none";
        overaActive.style.display = "none";
    };
});

document.getElementById('mobile-menu').addEventListener('click', function() {
    const navMenu = document.querySelector('.nav-menu');
    navMenu.classList.toggle('active');
});
