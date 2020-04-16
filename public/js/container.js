window.addEventListener('load', initContainer);

function initContainer() {
    document.querySelectorAll('.get-button').forEach(elem => {
        elem.addEventListener("click", onGETButtonPressed);
    });

    document.querySelectorAll('.post-button').forEach(elem => {
        elem.addEventListener("click", onPOSTButtonPressed);
    });
}

function onGETButtonPressed(evt) {
    let elem = evt.target ? evt.target : e.srcElement;
    elem = elem.nodeType == 3 ? elem.parentNode : elem;

    getContainer(elem.getAttribute('data-location'));
}

function onPOSTButtonPressed(evt) {
    let elem = evt.target ? evt.target : e.srcElement;
    elem = elem.nodeType == 3 ? elem.parentNode : elem;

    const form = document.getElementById(elem.getAttribute('data-formular'));

    let body = { csrfToken: form.getAttribute('data-csrf-token') };
    form.querySelectorAll('input').forEach(input => {
        body[input.name] = input.value;
    });

    postData(elem.getAttribute('data-location'), body);
}