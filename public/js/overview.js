function initContainer() {
    currentContainer.querySelectorAll('.table .next-button').forEach(elem => {
        elem.addEventListener("click", onNextButtonPressed);
    });
}

function onNextButtonPressed(evt) {
    var elem = evt.target ? evt.target : e.srcElement;
    elem = elem.nodeType == 3 ? elem.parentNode : elem;

    //? URL or query params
    //* API Endpoint may change!
    getContainer('/student/sport', {
        sport: elem.id.substring(6)
    });
}