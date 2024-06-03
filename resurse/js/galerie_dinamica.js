let items = Array.from(document.getElementsByClassName('imagine_galerie_dinamica'));
let animationPaused = false; // Flag to track animation pause state

document.addEventListener("DOMContentLoaded", () => {
    for (let i = 0; i < items.length; ++i) {
        items[i].style.zIndex = i.toString();

        // Add event listeners for mouseenter and mouseleave to each item
    }
    document.getElementById('galerie_dinamica').addEventListener('mouseenter', pauseAnimation);
    document.getElementById('galerie_dinamica').addEventListener('mouseleave', resumeAnimation);
    animateItems();
});

function pauseAnimation() {
    animationPaused = true;
}

function resumeAnimation() {
    animationPaused = false;
}

function animateItems() {
    // Check if animation is paused
    if (animationPaused) {
        // If paused, wait for a short interval and then resume animation
        setTimeout(animateItems, 100);
        return;
    }

    let highestZIndexItem = items[0];
    let highestZIndex = parseInt(highestZIndexItem.style.zIndex || 0); 
    items.forEach(item => {
        const zIndex = parseInt(item.style.zIndex || 0); 
        if (zIndex > highestZIndex) {
            highestZIndexItem = item;
            highestZIndex = zIndex;
        }
    }); /// gaseste cel mai mare zIndex

    // aplica animatia de pozei din varful stivei
    highestZIndexItem.style.animation = 'glisare 3s forwards';

    // Cand se termina animatia, actualizare zIndex-uri si 
    // actualizare DOM abia dupa ce toate zIndex-urile au fost calculate,
    // pentru a evita glitch-urile vizuale
    setTimeout(() => {
        const fragment = document.createDocumentFragment();

        items.forEach(item => {
            const clone = item.cloneNode(true); /// deepcopy
            clone.style.animation = 'none';
            clone.style.opacity = 1;
            clone.style.transform = 'translateX(0)';

            const zIndex = parseInt(clone.style.zIndex || 0);
            clone.style.zIndex = (zIndex + 1) % items.length;

            fragment.appendChild(clone);
        });

        // inlocuire iteme cu starea urmatoare
        items.forEach(item => item.parentNode.replaceChild(fragment.firstChild, item));

        // actualizare array items pentru bucla
        items = Array.from(document.getElementsByClassName('imagine_galerie_dinamica'));

        // reluare animatie
        animateItems();
    }, 3000);
}
