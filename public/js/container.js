window.addEventListener('load', initContainer);

function initContainer(prevLocation) {
    document.querySelectorAll('[data-location=back]').forEach(elem => {
        elem.setAttribute("data-location", prevLocation);
    });

    document.querySelectorAll('.get-button').forEach(elem => {
        elem.addEventListener("click", onGETButtonPressed);
    });

    document.querySelectorAll('.post-button').forEach(elem => {
        elem.addEventListener("click", onPOSTButtonPressed);
    });

    document.querySelectorAll('.delete-button').forEach(elem => {
        elem.addEventListener("click", onDELETEButtonPressed);
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

    let data = {};
    let abort = false;

    for (const input of form.querySelectorAll('input')) {
        if (input.required && input.value === "") {
            input.classList.add("input-wrong");
            input.addEventListener("click", () => input.classList.remove("input-wrong"));
            abort = true;
        }

        data[input.name] = input.value;
    }

    for (const select of form.querySelectorAll('select')) {
        if (select.value === "") {
            select.classList.add("input-wrong");
            select.addEventListener("click", () => select.classList.remove("input-wrong"));
            abort = true;
        }

        data[select.name] = select.value;
    }

    if (abort) return;

    postData(elem.getAttribute('data-location'), form.getAttribute('data-csrf-token'), data);
}

function onDELETEButtonPressed(evt) {
    let elem = evt.target ? evt.target : e.srcElement;
    elem = elem.nodeType == 3 ? elem.parentNode : elem;

    deleteData(elem.getAttribute('data-location'), elem.getAttribute('data-csrf-token'));
}