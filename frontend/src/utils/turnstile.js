export const loadTurnstile = () =>
  new Promise((resolve, reject) => {
    if (window.turnstile) {
      resolve(window.turnstile);
      return;
    }

    const existing = document.querySelector('script[data-turnstile]');
    if (existing) {
      existing.addEventListener('load', () => {
        if (window.turnstile) resolve(window.turnstile);
        else reject(new Error('Cloudflare verification could not initialize.'));
      });
      existing.addEventListener('error', () => {
        reject(new Error('Cloudflare verification could not load.'));
      });
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
    script.async = true;
    script.defer = true;
    script.dataset.turnstile = 'true';
    script.onload = () => {
      if (window.turnstile) resolve(window.turnstile);
      else reject(new Error('Cloudflare verification could not initialize.'));
    };
    script.onerror = () => reject(new Error('Cloudflare verification could not load.'));
    document.head.appendChild(script);
  });
