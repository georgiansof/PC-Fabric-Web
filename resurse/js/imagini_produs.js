let imagini = document.getElementsByClassName('imagine_produs');

let next = document.getElementById('next-img');
let prev = document.getElementById('prev-img');

next.addEventListener('click', () => {
    for(let imagine of imagini) {
        imagine.style.zIndex = (parseInt(imagine.style.zIndex) + 1) % imagini.length;
    }
});

prev.addEventListener('click', () => {
    for(let imagine of imagini) {
        imagine.style.zIndex = (imagine.style.zIndex - 1 + imagini.length) % imagini.length;
    }
})