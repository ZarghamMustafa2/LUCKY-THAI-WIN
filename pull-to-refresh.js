document.addEventListener('DOMContentLoaded', () => {
    let pStartY = 0;
    let pCurrentY = 0;
    const pContainer = document.querySelector('main') || document.body;
    
    // Create a visual indicator
    const indicator = document.createElement('div');
    indicator.innerHTML = '<i class="fa-solid fa-rotate text-primary text-2xl animate-spin"></i>';
    indicator.style.position = 'absolute';
    indicator.style.top = '-50px';
    indicator.style.left = '50%';
    indicator.style.transform = 'translateX(-50%)';
    indicator.style.transition = 'opacity 0.2s';
    indicator.style.opacity = '0';
    indicator.style.zIndex = '100';
    if (document.querySelector('main')) {
        document.querySelector('main').parentElement.style.position = 'relative';
        document.querySelector('main').parentElement.appendChild(indicator);
    } else {
        document.body.appendChild(indicator);
    }

    pContainer.addEventListener('touchstart', e => {
        if (pContainer.scrollTop === 0) {
            pStartY = e.touches[0].clientY;
        }
    }, { passive: true });
    
    pContainer.addEventListener('touchmove', e => {
        if (pStartY > 0 && pContainer.scrollTop === 0) {
            pCurrentY = e.touches[0].clientY;
            const diff = pCurrentY - pStartY;
            if (diff > 0 && diff < 150) {
                pContainer.style.transform = `translateY(${diff}px)`;
                pContainer.style.transition = 'none';
                indicator.style.opacity = (diff / 100).toString();
                indicator.style.top = `${diff - 50}px`;
            }
        }
    }, { passive: true });
    
    pContainer.addEventListener('touchend', e => {
        if (pStartY > 0 && pCurrentY > 0) {
            const diff = pCurrentY - pStartY;
            if (diff > 80) {
                pContainer.style.transition = 'transform 0.3s ease-out';
                pContainer.style.transform = `translateY(60px)`;
                indicator.style.top = `20px`;
                indicator.querySelector('i').classList.add('animate-spin');
                setTimeout(() => window.location.reload(), 400);
            } else {
                pContainer.style.transition = 'transform 0.3s ease-out';
                pContainer.style.transform = `translateY(0px)`;
                indicator.style.opacity = '0';
                indicator.style.top = '-50px';
            }
        }
        pStartY = 0;
        pCurrentY = 0;
    });
});
