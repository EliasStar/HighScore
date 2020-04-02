window.addEventListener('load', initContainer);

function initContainer() {
    document.querySelectorAll('.get-button').forEach(elem => {
        elem.addEventListener("click", onButtonPressed);
    });
}

function onButtonPressed(evt) {
    var elem = evt.target ? evt.target : e.srcElement;
    elem = elem.nodeType == 3 ? elem.parentNode : elem;

    getContainer('/private/' + elem.id.replace(/-/g, "/"));
}