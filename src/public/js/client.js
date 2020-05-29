let main;
let currentContainer;
let loadingContainer;
let errorContainer;

let params = "";
let busy = false;
let containerLocation = "";

window.addEventListener("load", () => {
    main = document.querySelector("main");
    currentContainer = document.getElementById("current-container");
    loadingContainer = document.getElementById("loading-container");
    errorContainer = document.getElementById("error-container");

    containerLocation = currentContainer.getAttribute("data-location");
});

function setParams(parameter) {
    params = Object.keys(parameter).map(key => key + "=" + parameter[key]).join("&");
}

function refreshContainer() {
    if (containerLocation !== "") {
        getContainer(containerLocation);
    }
}

function getContainer(path) {
    callFetch(path, {
        method: "GET",
        mode: "same-origin",
        redirect: "follow",
        referrer: "no-referrer"
    }, errorContainer);
}

function postData(path, csrfToken, data) {
    data["csrfToken"] = csrfToken;
    bodyString = JSON.stringify(data);

    callFetch(path, {
        method: "POST",
        mode: "same-origin",
        redirect: "follow",
        referrer: "no-referrer",
        headers: {
            "Content-Type": "application/json",
            "Content-Length": (new TextEncoder().encode(bodyString)).length
        },
        body: bodyString
    }, currentContainer);
}

function deleteData(path, csrfToken) {
    bodyString = JSON.stringify({ csrfToken: csrfToken });

    callFetch(path, {
        method: "DELETE",
        mode: "same-origin",
        redirect: "follow",
        referrer: "no-referrer",
        headers: {
            "Content-Type": "application/json",
            "Content-Length": (new TextEncoder().encode(bodyString)).length
        },
        body: bodyString
    }, currentContainer);
}

async function callFetch(path, init, errorContainerElem) {
    if (busy) {
        return;
    }

    busy = true;

    currentContainer.style.display = "none";
    errorContainerElem.style.display = "none";
    loadingContainer.style.display = "block";

    errorMessageElem = errorContainerElem.querySelector(".error-message");

    errorTitleElem = errorMessageElem.querySelector(".error-title");
    errorDescriptionElem = errorMessageElem.querySelector(".error-description");

    try {
        response = await fetch(path + "?" + params, init);

        if (!response.ok) {
            let err = new Error(response.status + " " + response.statusText);
            err.trace = await response.text();
            throw err;
        } else {
            let container = new DOMParser().parseFromString(await response.text(), "text/html").getElementById("current-container");

            currentContainer.remove();
            loadingContainer.style.display = "none";

            currentContainer = main.appendChild(container);

            initContainer(containerLocation);
            containerLocation = currentContainer.getAttribute("data-location");
        }
    } catch (err) {
        if (typeof err.trace === "undefined" || err.trace === "") {
            errorTitleElem.textContent = err.name;
            errorDescriptionElem.textContent = err.message;
        } else {
            errorTitleElem.textContent = err.message;
            errorDescriptionElem.textContent = err.trace;
        }

        errorMessageElem.style.display = "block";

        loadingContainer.style.display = "none";
        errorContainerElem.style.display = "block";
    }

    busy = false;
}