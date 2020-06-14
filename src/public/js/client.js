let main = document.querySelector("main");
let currentContainer = document.getElementById("current-container");
let loadingContainer = document.getElementById("loading-container");
let errorContainer = document.getElementById("error-container");

const container = { location: currentContainer.getAttribute("data-location"), current: true };

let currentScript = null;

let params = "";
let busy = false;

initContainer(container.location);

function setParams(parameter) {
    params = "?" + Object.keys(parameter).map(key => key + "=" + parameter[key]).join("&");
}

function refreshContainer() {
    if (container.current) {
        getContainer(container.location);
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
        response = await fetch(path + params, init);

        if (!response.ok) {
            const err = new Error(response.status + " " + response.statusText);
            err.trace = await response.text();
            throw err;
        } else {
            const newContainer = new DOMParser().parseFromString(await response.text(), "text/html").getElementById("current-container");

            if (currentScript != null) {
                currentScript.remove();
                currentScript = null;
            }

            currentContainer.remove();
            loadingContainer.style.display = "none";

            currentContainer = main.appendChild(newContainer);
            initContainer(container.location);

            if (newContainer.hasAttribute("data-script")) {
                const script = document.createElement('script');
                script.src = newContainer.getAttribute("data-script");
                script.defer = true;
                currentScript = document.head.appendChild(script);
            }

            if (currentContainer.hasAttribute("data-location")) {
                container.location = currentContainer.getAttribute("data-location");
                container.current = true;
            } else {
                container.current = false;
            }
        }
    } catch (err) {
        if (err.trace == null || err.trace === "") {
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