let main;
let currentContainer;
let loadingContainer;
let errorContainer;

let errorContainerTitle;
let errorContainerDescription;

window.addEventListener('load', () => {
    main = document.querySelector('main');
    currentContainer = document.getElementById('current-container');
    loadingContainer = document.getElementById('loading-container');
    errorContainer = document.getElementById('error-container');

    errorContainerTitle = errorContainer.querySelector('.error-title');
    errorContainerDescription = errorContainer.querySelector('.error-description');
});

function getContainer(path, params) {
    currentContainer.remove();
    errorContainer.style.display = 'none';
    loadingContainer.style.display = 'block';

    fetch(typeof params !== 'undefined' ? path + "?" + Object.keys(params).map(key => key + '=' + params[key]).join('&') : path, {
        mode: 'same-origin',
        redirect: 'error',
        referrer: 'no-referrer'
    }).then(async response => {
        if (!response.ok) {
            let err = new Error(response.status + " " + response.statusText);
            err.trace = await response.text();
            throw err;
        } else {
            let container = new DOMParser().parseFromString(await response.text(), "text/html").getElementById('current-container');
            loadingContainer.style.display = 'none';
            currentContainer = main.appendChild(container);
            initContainer();
        }
    }).catch(err => {
        errorContainerTitle.textContent = err.name;
        errorContainerDescription.textContent = err.message;

        if (typeof err.trace !== 'undefined' && err.trace !== '') {
            errorContainerDescription.textContent += "\n\n" + err.trace;
        }

        loadingContainer.style.display = 'none';
        errorContainer.style.display = 'block';
        return;
    });
}