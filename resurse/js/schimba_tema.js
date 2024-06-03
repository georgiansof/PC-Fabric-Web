const dark_button = document.getElementsByClassName('dark-button')[0];
const light_button = document.getElementsByClassName('light-button')[0];
const neon_button = document.getElementsByClassName('neon-button')[0];


const lightButtonFunc = () => {
    document.body.classList.remove('neon')
    document.body.classList.remove('dark');
    localStorage.setItem('theme' , "light");
}

const darkButtonFunc = () => {
    document.body.classList.remove('neon')
    document.body.classList.add('dark');
    localStorage.setItem('theme' , "dark");
    
}

const neonButtonFunc = () => {
    document.body.classList.remove('dark')
    document.body.classList.add('neon');
    localStorage.setItem('theme', "neon");
}

document.addEventListener('DOMContentLoaded', () => {
    // Change the ID to the radio button you want to be checked on page load
    const initialTheme = localStorage.getItem('theme');

    switch(initialTheme) {
        case 'dark':
            dark_button.checked = true;
            darkButtonFunc();
            break;
        case 'light':
            light_button.checked = true;
            lightButtonFunc();
            break;
        case 'neon':
            neon_button.checked = true;
            neonButtonFunc();
            break;
        default:
            light_button.checked = true;
            lightButtonFunc();
    }
});

light_button.addEventListener('click', lightButtonFunc);

dark_button.addEventListener('click', darkButtonFunc);

neon_button.addEventListener('click', neonButtonFunc);