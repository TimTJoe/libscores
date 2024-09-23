document.addEventListener('DOMContentLoaded', (event) => {
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

})



