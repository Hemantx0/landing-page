/* Nearby Folk landing page interactions */

(function () {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  function revealSections() {
    const revealEls = document.querySelectorAll('[data-reveal]');
    if (!revealEls.length) return;

    if (prefersReducedMotion.matches || !('IntersectionObserver' in window)) {
      revealEls.forEach((el) => el.classList.add('is-visible'));
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const delay = Number(entry.target.dataset.delay || 0);
        window.setTimeout(() => entry.target.classList.add('is-visible'), delay);
        observer.unobserve(entry.target);
      });
    }, {
      rootMargin: '0px 0px -10% 0px',
      threshold: 0.12
    });

    revealEls.forEach((el) => observer.observe(el));
  }

  function initAmbientCanvas() {
    const canvas = document.getElementById('ambientCanvas');
    if (!canvas || prefersReducedMotion.matches) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    let width = 0;
    let height = 0;
    let dpr = 1;
    let raf = 0;
    let particles = [];
    const palette = [
      'rgba(255, 107, 0, ',
      'rgba(255, 138, 31, ',
      'rgba(65, 217, 190, ',
      'rgba(166, 133, 255, '
    ];

    function resize() {
      const rect = canvas.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 1.7);
      width = Math.max(1, rect.width);
      height = Math.max(1, rect.height);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const count = Math.min(90, Math.max(38, Math.floor((width * height) / 18500)));
      particles = Array.from({ length: count }, (_, index) => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.15,
        vy: (Math.random() - 0.5) * 0.15,
        size: 0.6 + Math.random() * 1.6,
        alpha: 0.14 + Math.random() * 0.36,
        color: palette[index % palette.length]
      }));
    }

    function draw() {
      ctx.clearRect(0, 0, width, height);
      const gradient = ctx.createLinearGradient(0, 0, width, height);
      gradient.addColorStop(0, 'rgba(255, 107, 0, 0.035)');
      gradient.addColorStop(0.48, 'rgba(255, 255, 255, 0.006)');
      gradient.addColorStop(1, 'rgba(65, 217, 190, 0.028)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      particles.forEach((particle, index) => {
        particle.x += particle.vx;
        particle.y += particle.vy;

        if (particle.x < -8) particle.x = width + 8;
        if (particle.x > width + 8) particle.x = -8;
        if (particle.y < -8) particle.y = height + 8;
        if (particle.y > height + 8) particle.y = -8;

        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = particle.color + particle.alpha + ')';
        ctx.fill();

        for (let next = index + 1; next < particles.length; next += 1) {
          const other = particles[next];
          const dx = particle.x - other.x;
          const dy = particle.y - other.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          if (distance < 112) {
            ctx.beginPath();
            ctx.moveTo(particle.x, particle.y);
            ctx.lineTo(other.x, other.y);
            ctx.strokeStyle = 'rgba(255, 107, 0, ' + (0.045 * (1 - distance / 112)) + ')';
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      });

      raf = window.requestAnimationFrame(draw);
    }

    function start() {
      if (!raf) raf = window.requestAnimationFrame(draw);
    }

    function stop() {
      if (!raf) return;
      window.cancelAnimationFrame(raf);
      raf = 0;
    }

    resize();
    start();
    window.addEventListener('resize', resize, { passive: true });
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) stop();
      else start();
    });
  }

  function initTilt() {
    const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    if (!canHover || prefersReducedMotion.matches) return;

    document.querySelectorAll('.tilt-card').forEach((card) => {
      card.addEventListener('mousemove', (event) => {
        const rect = card.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width - 0.5;
        const y = (event.clientY - rect.top) / rect.height - 0.5;
        const rotateX = (y * -8).toFixed(2);
        const rotateY = (x * 8).toFixed(2);
        card.style.transform = 'perspective(950px) rotateX(' + rotateX + 'deg) rotateY(' + rotateY + 'deg) translateY(-4px)';
      }, { passive: true });

      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
      });
    });
  }

  function initGhostToggle() {
    const toggle = document.getElementById('ghostToggle');
    const label = document.getElementById('ghostLabel');
    if (!toggle || !label) return;

    toggle.addEventListener('click', () => {
      const isOn = toggle.getAttribute('aria-pressed') === 'true';
      toggle.setAttribute('aria-pressed', String(!isOn));
      label.textContent = isOn ? 'Visible in discovery' : 'Hidden from nearby discovery';
    });
  }

  function initFaqAccordion() {
    const faq = document.querySelector('[data-faq]');
    if (!faq) return;

    const items = Array.from(faq.querySelectorAll('.faq-item'));

    function getParts(item) {
      return {
        trigger: item.querySelector('.faq-trigger'),
        panel: item.querySelector('.faq-panel')
      };
    }

    function setItemState(item, isOpen) {
      const { trigger, panel } = getParts(item);
      item.classList.toggle('is-open', isOpen);
      if (trigger) trigger.setAttribute('aria-expanded', String(isOpen));
      if (panel) {
        panel.setAttribute('aria-hidden', String(!isOpen));
        panel.style.height = isOpen ? 'auto' : '0px';
      }
    }

    function clearPanelTransition(panel) {
      if (!panel.faqTransitionEnd) return;
      panel.removeEventListener('transitionend', panel.faqTransitionEnd);
      panel.faqTransitionEnd = null;
    }

    function openItem(item) {
      const { trigger, panel } = getParts(item);
      if (!trigger || !panel || item.classList.contains('is-open')) return;

      if (prefersReducedMotion.matches) {
        setItemState(item, true);
        return;
      }

      clearPanelTransition(panel);
      item.classList.add('is-open');
      trigger.setAttribute('aria-expanded', 'true');
      panel.setAttribute('aria-hidden', 'false');
      panel.style.height = '0px';

      window.requestAnimationFrame(() => {
        panel.style.height = panel.scrollHeight + 'px';
      });

      const handleTransitionEnd = (event) => {
        if (event.propertyName !== 'height') return;
        if (item.classList.contains('is-open')) panel.style.height = 'auto';
        clearPanelTransition(panel);
      };
      panel.addEventListener('transitionend', handleTransitionEnd);
      panel.faqTransitionEnd = handleTransitionEnd;
    }

    function closeItem(item) {
      const { trigger, panel } = getParts(item);
      if (!trigger || !panel || !item.classList.contains('is-open')) return;

      if (prefersReducedMotion.matches) {
        setItemState(item, false);
        return;
      }

      clearPanelTransition(panel);
      panel.style.height = panel.scrollHeight + 'px';
      void panel.offsetHeight;
      item.classList.remove('is-open');
      trigger.setAttribute('aria-expanded', 'false');
      panel.setAttribute('aria-hidden', 'true');

      window.requestAnimationFrame(() => {
        panel.style.height = '0px';
      });
    }

    items.forEach((item) => {
      const { trigger, panel } = getParts(item);
      if (!trigger || !panel) return;

      setItemState(item, item.classList.contains('is-open'));

      trigger.addEventListener('click', () => {
        const shouldOpen = trigger.getAttribute('aria-expanded') !== 'true';

        items.forEach((current) => {
          if (current !== item) closeItem(current);
        });

        if (shouldOpen) openItem(item);
        else closeItem(item);
      });
    });
  }

  function initNavState() {
    const nav = document.querySelector('.site-nav');
    if (!nav) return;

    const update = () => {
      nav.classList.toggle('is-scrolled', window.scrollY > 24);
    };

    update();
    window.addEventListener('scroll', update, { passive: true });
  }

  function initStaggeredGroups() {
    const groups = document.querySelectorAll('.trust-row, .flow-list, .problem-cards, .phone-gallery, .safety-grid, .feature-grid, .meetup-steps, .faq-list');
    if (!groups.length) return;

    groups.forEach((group) => {
      group.classList.add('stagger-group');
      Array.from(group.children).forEach((child, index) => {
        child.classList.add('stagger-child');
        child.style.setProperty('--stagger-delay', Math.min(index * 90, 450) + 'ms');
      });
    });

    if (prefersReducedMotion.matches || !('IntersectionObserver' in window)) {
      groups.forEach((group) => group.classList.add('is-staggered-in'));
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-staggered-in');
        observer.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.12 });

    groups.forEach((group) => observer.observe(group));
  }

  function initScrollDepth() {
    const radar = document.querySelector('.radar-field');
    const hero = document.querySelector('.hero');
    if (!radar || !hero || prefersReducedMotion.matches) return;

    let ticking = false;
    const update = () => {
      const rect = hero.getBoundingClientRect();
      const progress = Math.max(-1, Math.min(1, -rect.top / Math.max(rect.height, 1)));
      radar.style.setProperty('--radar-parallax', (progress * 34).toFixed(1) + 'px');
      ticking = false;
    };

    const requestUpdate = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', requestUpdate, { passive: true });
  }

  function initComingSoonModal() {
    const modal = document.querySelector('[data-coming-soon-modal]');
    const dialog = modal ? modal.querySelector('.coming-soon-dialog') : null;
    const triggers = document.querySelectorAll('[data-coming-soon-trigger]');
    if (!modal || !dialog || !triggers.length) return;

    let activeTrigger = null;
    let closeTimer = 0;

    function openModal(event) {
      if (event) event.preventDefault();
      window.clearTimeout(closeTimer);
      activeTrigger = event ? event.currentTarget : null;
      modal.hidden = false;
      document.body.classList.add('modal-open');

      window.requestAnimationFrame(() => {
        modal.classList.add('is-open');
        dialog.focus({ preventScroll: true });
      });
    }

    function closeModal() {
      if (modal.hidden) return;
      modal.classList.remove('is-open');
      document.body.classList.remove('modal-open');

      closeTimer = window.setTimeout(() => {
        modal.hidden = true;
        if (activeTrigger) activeTrigger.focus({ preventScroll: true });
        activeTrigger = null;
      }, prefersReducedMotion.matches ? 0 : 180);
    }

    triggers.forEach((trigger) => {
      trigger.addEventListener('click', openModal);
    });

    modal.querySelectorAll('[data-coming-soon-close]').forEach((closer) => {
      closer.addEventListener('click', closeModal);
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && !modal.hidden) closeModal();
    });
  }

  function initTwistCarousel() {
    const track = document.getElementById('twist-card-track');
    const controls = Array.from(document.querySelectorAll('[data-twist-card]'));
    if (!track || !controls.length) return;

    const cards = Array.from(track.querySelectorAll('.twist-game'));
    let frame = 0;

    function updateActiveCard() {
      const trackLeft = track.getBoundingClientRect().left;
      let closestIndex = 0;
      let closestDistance = Infinity;

      cards.forEach((card, index) => {
        const distance = Math.abs(card.getBoundingClientRect().left - trackLeft - 12);
        if (distance < closestDistance) {
          closestDistance = distance;
          closestIndex = index;
        }
      });

      controls.forEach((control, index) => {
        const isActive = index === closestIndex;
        control.classList.toggle('is-active', isActive);
        control.setAttribute('aria-pressed', String(isActive));
      });
      frame = 0;
    }

    controls.forEach((control, index) => {
      control.addEventListener('click', () => {
        track.scrollTo({
          left: cards[index].offsetLeft - cards[0].offsetLeft,
          behavior: prefersReducedMotion.matches ? 'auto' : 'smooth'
        });
      });
    });

    track.addEventListener('scroll', () => {
      if (!frame) frame = window.requestAnimationFrame(updateActiveCard);
    }, { passive: true });
    window.addEventListener('resize', updateActiveCard, { passive: true });
  }

  revealSections();
  initStaggeredGroups();
  initAmbientCanvas();
  initTilt();
  initGhostToggle();
  initFaqAccordion();
  initNavState();
  initScrollDepth();
  initComingSoonModal();
  initTwistCarousel();
})();
