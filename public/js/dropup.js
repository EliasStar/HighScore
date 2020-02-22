let dropup;

window.addEventListener('load', initDropup);

function initDropup() {
    dropup = document.getElementById('dropup');
    document.getElementById('dropup-button').addEventListener("click", onDropupButtonPressed);
}

function onDropupButtonPressed() {
    dropup.style.display = window.getComputedStyle(dropup).getPropertyValue("display") === 'none' ? 'block' : 'none';
}