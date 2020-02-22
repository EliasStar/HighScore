window.addEventListener('load', initTheme);

function initTheme() {
    document.getElementById('theme-button').addEventListener("click", onThemeButtonPressed);

    let theme = localStorage.getItem('theme');
    if (theme === 'light' || theme === 'dark') {
        document.documentElement.setAttribute('theme', theme);
    }
}

function onThemeButtonPressed() {
    if (document.documentElement.getAttribute('theme') == 'light') {
        document.documentElement.setAttribute('theme', 'dark');
        localStorage.setItem('theme', 'dark');
    }
    else {
        document.documentElement.setAttribute('theme', 'light');
        localStorage.setItem('theme', 'light');
    }
}