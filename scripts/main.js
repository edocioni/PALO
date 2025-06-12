document.addEventListener('DOMContentLoaded', () => {
  // Set CSS variable --vh to the actual viewport height in pixels for Safari viewport height fix
  function setVhVariable() {
    let vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
  }
  setVhVariable();
  window.addEventListener('resize', setVhVariable);

  const imageWrapper = document.getElementById('imageWrapper');
  const imageFade = document.getElementById('imageFade');
  const paloContainer = document.getElementById('paloContainer');
  const topLeftMenu = document.getElementById('topLeftMenu');

  if (!imageWrapper || !imageFade || !paloContainer || !topLeftMenu) {
    console.error('Elementi HTML richiesti (imageWrapper, imageFade, paloContainer o topLeftMenu) non trovati.');
    return;
  }

  const isPhoneMode = () => {
    return window.innerWidth <= 768 || ('ontouchstart' in window);
  };

  let fadeTimeout = null;
  let desktopFadeOutTimeout = null; // Rinominato per chiarezza
  let phoneScrollDebounceTimeout = null; // Rinominato per chiarezza
  let lastScrollTop = 0;
  let desktopMouseOutTimeout = null; // Per document mouseout

  let currentModeIsPhone = undefined;
  const desktopImageSrc = "images/image0.jpeg"; // Immagine predefinita dall'HTML
  const phoneImageSrc = "images/image0 (2).jpeg";

  const spotifyButton = document.querySelector('.spotify-button');
  const socialIcons = document.querySelector('.social-icons');

  if (spotifyButton) {
    spotifyButton.style.pointerEvents = 'none'; // Inizialmente non cliccabile
  }

  if (socialIcons) {
    socialIcons.classList.add('fade-out'); // Inizialmente nascosto
  }

  // Funzione per aggiornare l'immagine di sfondo in base alla modalità
  function updateBackgroundImage() {
    const currentImageSrc = imageFade.getAttribute('src');
    if (isPhoneMode()) {
      if (currentImageSrc !== phoneImageSrc) {
        imageFade.src = phoneImageSrc;
      }
    } else {
      if (currentImageSrc !== desktopImageSrc) {
        imageFade.src = desktopImageSrc;
      }
    }
  }

  function clearAllTimeouts() {
    if (fadeTimeout) clearTimeout(fadeTimeout);
    if (desktopFadeOutTimeout) clearTimeout(desktopFadeOutTimeout);
    if (phoneScrollDebounceTimeout) clearTimeout(phoneScrollDebounceTimeout);
    if (desktopMouseOutTimeout) clearTimeout(desktopMouseOutTimeout);
    fadeTimeout = null;
    desktopFadeOutTimeout = null;
    if (phoneScrollDebounceTimeout) phoneScrollDebounceTimeout = null; // Controlla se esiste prima di nullare
    desktopMouseOutTimeout = null;
  }

  function resetAndStyleElementsForMode(isPhone) {
    clearAllTimeouts();

    // Rimuovi tutte le classi di stato e transizione specifiche delle modalità
    imageFade.classList.remove('state-fade-left', 'state-fade-bottom', 'state-normal', 'phone-static-layout');
    topLeftMenu.classList.remove('visible', 'hidden', 'phone-static-layout');
    paloContainer.classList.remove('visible', 'hidden', 'phone-static-layout');
    if (socialIcons) {
      socialIcons.classList.remove('fade-in', 'fade-out', 'phone-static-layout');
    }
    // La classe 'phone-image-fit-contain' è gestita da updateBackgroundImage

    if (isPhone) {
      imageFade.classList.add('phone-static-layout');
      topLeftMenu.classList.add('phone-static-layout');
      paloContainer.classList.add('phone-static-layout');
      if (socialIcons) socialIcons.classList.add('phone-static-layout');
      if (spotifyButton) spotifyButton.style.pointerEvents = 'auto';

      // Assicura che l'immagine non abbia maschere attive in modalità telefono
      imageFade.style.maskImage = 'none';
      imageFade.style.webkitMaskImage = 'none';

    } else { // Desktop
      imageFade.classList.add('state-normal'); // Stato iniziale desktop
      topLeftMenu.classList.add('hidden');     // Stato iniziale desktop
      // paloContainer è inizialmente nascosto (nessuna classe 'visible' di default)
      if (socialIcons) socialIcons.classList.add('fade-out'); // Stato iniziale desktop
      if (spotifyButton) spotifyButton.style.pointerEvents = 'none';

      // Ripristina le maschere per desktop (il CSS le gestirà tramite le classi di stato)
      imageFade.style.maskImage = '';
      imageFade.style.webkitMaskImage = '';
    }
    lastScrollTop = 0;
  }

  // Event Handlers
  const handlePhoneScroll = () => {
    if (!currentModeIsPhone) return; // Non eseguire se non siamo in modalità telefono
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

    if (phoneScrollDebounceTimeout) {
      clearTimeout(phoneScrollDebounceTimeout);
    }

    phoneScrollDebounceTimeout = setTimeout(() => {
      if (scrollTop > lastScrollTop && scrollTop > 0) { // Consider scrollTop > 0 to avoid firing at the very top
        imageFade.classList.remove('state-normal', 'state-fade-left');
        if (!imageFade.classList.contains('state-fade-bottom')) {
          imageFade.classList.add('state-fade-bottom');
        }
        paloContainer.classList.add('visible');
        topLeftMenu.classList.add('visible');
        topLeftMenu.classList.remove('hidden');
        if (spotifyButton) {
          spotifyButton.style.pointerEvents = 'auto';
          spotifyButton.style.zIndex = '20';
        }
        if (socialIcons) {
          socialIcons.classList.remove('fade-out');
          socialIcons.classList.add('fade-in');
        }
      } else if (scrollTop < lastScrollTop || scrollTop === 0) {
        imageFade.classList.remove('state-fade-bottom');
        imageFade.classList.add('state-normal');
        paloContainer.classList.remove('visible');
        topLeftMenu.classList.remove('visible');
        topLeftMenu.classList.add('hidden');
        if (spotifyButton) {
          // spotifyButton.style.pointerEvents = 'auto'; // Manteneva il pulsante cliccabile
          spotifyButton.style.pointerEvents = 'none'; // Ora non cliccabile se nascosto
          // zIndex non necessario se pointerEvents è 'none'
        }
        if (socialIcons) {
          socialIcons.classList.remove('fade-in');
          socialIcons.classList.add('fade-out');
        }
      }
      lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
    }, 50); // Debounce ridotto per reattività scroll
  };

  const handleDesktopMouseMove = (event) => {
    const x = event.clientX;
    const halfWindowWidth = window.innerWidth / 2;

    if (fadeTimeout) {
      clearTimeout(fadeTimeout);
      fadeTimeout = null;
    }

    if (x < halfWindowWidth) {
      if (desktopFadeOutTimeout) {
        clearTimeout(desktopFadeOutTimeout);
        desktopFadeOutTimeout = null;
      }
      if (!imageFade.classList.contains('state-fade-left')) {
        imageFade.classList.remove('state-normal');
        imageFade.classList.add('state-fade-left');
      }
      fadeTimeout = setTimeout(() => {
        if (imageFade.classList.contains('state-fade-left')) {
          paloContainer.classList.add('visible');
          topLeftMenu.classList.add('visible');
          topLeftMenu.classList.remove('hidden');
          if (spotifyButton) {
            spotifyButton.style.pointerEvents = 'auto';
            spotifyButton.style.zIndex = '20';
          }
          if (socialIcons) {
            socialIcons.classList.remove('fade-out');
            socialIcons.classList.add('fade-in');
          }
        }
      }, 100);
    } else {
      if (desktopFadeOutTimeout) { // Clear if one is already running
          clearTimeout(desktopFadeOutTimeout);
      }
      desktopFadeOutTimeout = setTimeout(() => {
        if (!imageFade.classList.contains('state-normal')) {
          imageFade.classList.remove('state-fade-left');
          imageFade.classList.add('state-normal');
        }
        paloContainer.classList.remove('visible');
        topLeftMenu.classList.remove('visible');
        topLeftMenu.classList.add('hidden');
        if (spotifyButton) {
          spotifyButton.style.pointerEvents = 'none'; // Corretto: non cliccabile se nascosto
        }
        if (socialIcons) {
          socialIcons.classList.remove('fade-in');
          socialIcons.classList.add('fade-out');
        }
      }, 500);
    }
  };

  const handleDesktopMouseLeave = () => {
    clearTimeout(fadeTimeout); // Clear any pending fade-in
    clearTimeout(desktopFadeOutTimeout); // Clear any pending fade-out
    imageFade.classList.remove('state-fade-left');
    imageFade.classList.add('state-normal');
    paloContainer.classList.remove('visible');
    topLeftMenu.classList.remove('visible');
    topLeftMenu.classList.add('hidden');
    if (spotifyButton) {
      spotifyButton.style.pointerEvents = 'none'; // Corretto
    }
    if (socialIcons) {
      socialIcons.classList.remove('fade-in');
      socialIcons.classList.add('fade-out');
    }
  };

  const handleDocumentMouseOut = (event) => {
    if (!event.relatedTarget && !event.toElement) { // Mouse ha lasciato la finestra
      if (desktopMouseOutTimeout) {
        clearTimeout(desktopMouseOutTimeout);
      }
      desktopMouseOutTimeout = setTimeout(() => {
        handleDesktopMouseLeave(); // Riutilizza la logica di mouseleave
        console.log('TopLeftMenu and social icons hidden due to document mouseout');
      }, 500);
    }
  };

  function applyMode() {
    const newModeIsPhone = isPhoneMode();

    if (newModeIsPhone === currentModeIsPhone && typeof currentModeIsPhone !== 'undefined') {
      updateBackgroundImage(); // Aggiorna comunque l'immagine se necessario (es. solo resize senza cambio modalità)
      return;
    }

    resetAndStyleElementsForMode(newModeIsPhone);

    // Remove old listeners
    if (currentModeIsPhone === true) {
      // window.removeEventListener('scroll', handlePhoneScroll); // Rimosso perché il layout telefono è statico
    } else if (currentModeIsPhone === false) {
      imageWrapper.removeEventListener('mousemove', handleDesktopMouseMove);
      imageWrapper.removeEventListener('mouseleave', handleDesktopMouseLeave);
      document.removeEventListener('mouseout', handleDocumentMouseOut);
    }

    // Add new listeners
    if (newModeIsPhone) {
      // Nessun listener di scroll per il layout statico del telefono
      // Se handlePhoneScroll fosse ancora necessario per qualche effetto, andrebbe aggiunto qui.
    } else {
      imageWrapper.addEventListener('mousemove', handleDesktopMouseMove);
      imageWrapper.addEventListener('mouseleave', handleDesktopMouseLeave);
      document.addEventListener('mouseout', handleDocumentMouseOut);
    }

    currentModeIsPhone = newModeIsPhone;
    updateBackgroundImage(); // Ensure correct image and fit class
  }

  // Initial setup
  applyMode();

  let resizeDebounceTimeout = null;
  window.addEventListener('resize', () => {
    if (resizeDebounceTimeout) clearTimeout(resizeDebounceTimeout);
    resizeDebounceTimeout = setTimeout(() => {
      applyMode();
    }, 250); // Debounce resize event
  });
});
