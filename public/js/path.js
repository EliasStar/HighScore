function initPath() {
    document.querySelectorAll('#path>.path-button').forEach(elem => {
        elem.addEventListener("click", onPathButtonPressed);
    });
}

function onPathButtonPressed(evt) {
    var elem = evt.target ? evt.target : e.srcElement;
    elem = elem.nodeType == 3 ? elem.parentNode : elem;

    //? URL or query params
    //* API Endpoint may change!
    getContainer('/student/' + elem.id.substring(5));
}