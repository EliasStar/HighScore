window.addEventListener('load', () => {
    // DropUp
    let dropup = document.getElementById('dropup');

    document.getElementById('dropup-button').addEventListener("click", () => {
        dropup.style.display = window.getComputedStyle(dropup).getPropertyValue("display") === 'none' ? 'block' : 'none';
    });

    // Theme
    let theme = localStorage.getItem('theme');
    if (theme === 'light' || theme === 'dark') {
        document.documentElement.setAttribute('data-theme', theme);
    }

    document.getElementById('theme-button').addEventListener("click", () => {
        if (document.documentElement.getAttribute('data-theme') === 'light') {
            document.documentElement.setAttribute('data-theme', 'dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.setAttribute('data-theme', 'light');
            localStorage.setItem('theme', 'light');
        }
    });

    // Links
    document.getElementById('path-error').addEventListener('click', () => getContainer('/'));

    document.getElementById('logo').addEventListener('click', () => getContainer('/'));

    document.getElementById('help-button').addEventListener('click', () => getContainer('/public/help'));

    document.getElementById('about-button').addEventListener('click', () => getContainer('/public/about'));
});