// Menu toggle
const menuToggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('.nav');
const search = document.querySelector('.search');
const searchBtn = document.querySelector('.search__btn');
let isFirstSearchOpen = true;

menuToggle.addEventListener('click', () => {
    nav.classList.toggle('active');
});

// Búsqueda: animación solo la primera vez
searchBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    
    if (!search.classList.contains('active')) {
        search.classList.add('active');
        
        if (isFirstSearchOpen) {
            search.classList.add('first-open');
            // Remover clase después de la animación
            setTimeout(() => {
                search.classList.remove('first-open');
            }, 700);
            isFirstSearchOpen = false;
        }
        
        // Focus en input
        setTimeout(() => {
            search.querySelector('input').focus();
        }, 300);
    } else {
        search.classList.remove('active');
    }
});

// Cerrar búsqueda al hacer clic fuera
document.addEventListener('click', (e) => {
    if (!search.contains(e.target) && !searchBtn.contains(e.target)) {
        search.classList.remove('active');
    }
});
