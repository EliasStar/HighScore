window.addEventListener('load', () => {
    let dropup = document.getElementById('dropup');
    document.getElementById('dropup-button').addEventListener("click", () => {
        dropup.style.display = window.getComputedStyle(dropup).getPropertyValue("display") === 'none' ? 'block' : 'none';
    });

    document.getElementById('theme-button').addEventListener("click", onThemeButtonPressed);

    let theme = localStorage.getItem('theme');
    if (theme === 'light' || theme === 'dark') {
        document.documentElement.setAttribute('theme', theme);
    }

    let addButton = document.getElementById('add-button')
    if (addButton) {
        addButton.addEventListener('click', () => {
            getContainer('/private/new/sport');
        });
    }

    document.getElementById('about-button').addEventListener('click', () => {
        getContainer('/public/about');
    });

    document.getElementById('help-button').addEventListener('click', () => {
        getContainer('/public/help');
    });
});

function onThemeButtonPressed() {
    if (document.documentElement.getAttribute('theme') == 'light') {
        document.documentElement.setAttribute('theme', 'dark');
        localStorage.setItem('theme', 'dark');
    } else {
        document.documentElement.setAttribute('theme', 'light');
        localStorage.setItem('theme', 'light');
    }
}