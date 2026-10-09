import { useLayoutEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function usePortfolioMotion() {
  useLayoutEffect(() => {
    const root = document.getElementById('root');
    if (!root) return;
    const media = gsap.matchMedia(root);
    let mounted = true;
    let scrollPosition = window.scrollY;
    const rememberScroll = () => { scrollPosition = window.scrollY; };
    const restoreScroll = () => { window.scrollTo({ top: scrollPosition, behavior: 'instant' }); ScrollTrigger.update(); };
    ScrollTrigger.addEventListener('revert', rememberScroll);
    ScrollTrigger.addEventListener('matchMedia', restoreScroll);

    media.add('(prefers-reduced-motion: no-preference)', context => {
      if (!window.location.hash && window.scrollY < 80) {
        root.classList.add('is-opening');
        gsap.set('.opening-curtain', { display: 'block', transformOrigin: 'center top' });
        gsap.timeline({ defaults: { ease: 'power3.out' }, onComplete: () => root.classList.remove('is-opening') })
          .from('.hero-frame', { scale: 0.94, y: 28, duration: 2.1, ease: 'power3.inOut', clearProps: 'transform' }, 0)
          .to('.opening-curtain', { scaleY: 0, duration: 1.4, ease: 'power2.inOut', onComplete: () => { gsap.set('.opening-curtain', { display: 'none' }); } }, 0.12)
          .from('.hero-video', { scale: 1.22, duration: 3.15, ease: 'power2.out', clearProps: 'transform' }, 0.15)
          .from('.hero-nav', { clipPath: 'inset(0 50% 0 50% round 999px)', y: -20, duration: 1.35, clearProps: 'clipPath,transform' }, 0.45)
          .from('.hero-middle .eyebrow', { clipPath: 'inset(0 100% 0 0)', duration: 1.35, clearProps: 'clipPath' }, 0.9)
          .from('.hero-title-line', { yPercent: 120, scaleX: 0.72, scaleY: 1.16, skewY: 6, transformOrigin: 'left bottom', duration: 1.85, stagger: 0.18, clearProps: 'transform' }, 1)
          .from('.intro-line', { yPercent: 115, duration: 1.4, stagger: 0.12, clearProps: 'transform' }, 1.55)
          .from('.hero-intro .pill-button', { clipPath: 'inset(0 100% 0 0 round 100px)', y: 24, duration: 1.3, clearProps: 'clipPath,transform' }, 2)
          .from('.hero-bottom', { clipPath: 'inset(0 0 100% 0)', y: 24, duration: 1.15, clearProps: 'clipPath,transform' }, 2.15);
      }

      gsap.utils.toArray<HTMLElement>('.motion-module').forEach(module => {
        const title = module.querySelector('.display-title');
        const timeline = gsap.timeline({
          defaults: { duration: 1.6, ease: 'power3.out' },
          scrollTrigger: { trigger: title, start: 'clamp(top 85%)', once: true }
        });
        timeline.from(title?.querySelectorAll('.title-text') || [], {
          yPercent: 125, xPercent: -12, scaleX: 0.7, skewY: 7,
          transformOrigin: 'left bottom', stagger: 0.16, clearProps: 'transform'
        }, 0).from(title?.querySelector('.title-rule') || [], {
          scaleX: 0, transformOrigin: 'left center', duration: 1.8, clearProps: 'transform'
        }, 0.2);

        const lead = module.id === 'about' ? module.querySelector('.about-card')
          : module.id === 'experience' ? module.querySelectorAll('.experience-heading, .experience-details')
          : module.id === 'works' ? module.querySelector('.works-heading')
          : module.querySelectorAll('.contact-main > div, .contact-main address > *');
        timeline.from(lead || [], { y: 60, stagger: 0.16, clearProps: 'transform' }, 0.62);
        if (module.id === 'about') timeline.from('.profile-line img', { clipPath: 'inset(100% 0 0 0)', scale: 1.16, duration: 1.7, clearProps: 'transform,clipPath' }, 1.08);
      });

      gsap.from('.stats-grid > div', {
        y: 64, duration: 1.5, stagger: 0.16, ease: 'power3.out', clearProps: 'transform',
        scrollTrigger: { trigger: '.stats-grid', start: 'clamp(top 90%)', once: true }
      });

      const cards = gsap.utils.toArray<HTMLElement>('.works-grid > div');
      gsap.set('.work-card', { yPercent: 100 });
      gsap.set('.poster img', { scale: 1.12 });
      const revealCards = context.add('revealCards', (batch: HTMLElement[]) => {
          const visible = batch.filter(card => card.getBoundingClientRect().bottom >= 0);
          const passed = batch.filter(card => !visible.includes(card));
          gsap.set(passed.map(card => card.querySelector('.work-card')), { yPercent: 0, clearProps: 'transform,willChange' });
          gsap.set(passed.map(card => card.querySelector('.poster img')), { scale: 1.06 });
          if (!visible.length) return;
          const buttons = visible.map(card => card.querySelector('.work-card'));
          const images = visible.map(card => card.querySelector('.poster img'));
          gsap.set(buttons, { willChange: 'transform' });
          gsap.timeline({ defaults: { ease: 'power3.out' } })
            .to(buttons, { yPercent: 0, duration: 1.15, stagger: 0.09, clearProps: 'transform,willChange' }, 0)
            .to(images, { scale: 1.06, duration: 1.5, stagger: 0.09 }, 0);
      });
      ScrollTrigger.batch(cards, {
        start: 'clamp(top 105%)', once: true, interval: 0.08, batchMax: 4, onEnter: batch => revealCards(batch)
      });

      // Keyboard navigation should never wait for a masked card to finish revealing.
      const onFocus = context.add('revealFocusedCard', (event: FocusEvent) => {
        const card = (event.target as HTMLElement).closest('.work-card');
        if (card) {
          gsap.getTweensOf([card, ...card.querySelectorAll('.poster, .poster img')]).filter(tween => !tween.scrollTrigger).forEach(tween => tween.progress(1));
          gsap.set(card, { yPercent: 0, clearProps: 'transform,willChange' });
        }
      }) as (event: FocusEvent) => void;
      root.addEventListener('focusin', onFocus);
      return () => { root.classList.remove('is-opening'); root.removeEventListener('focusin', onFocus); };
    });

    media.add('(min-width: 1001px) and (pointer: fine) and (prefers-reduced-motion: no-preference)', () => {
      gsap.fromTo('.poster img', { yPercent: -2 }, {
          yPercent: 2, ease: 'none',
          scrollTrigger: { trigger: '.works-grid', start: 'top bottom', end: 'bottom top', scrub: 1.1, invalidateOnRefresh: true }
      });
    });

    document.fonts.ready.then(() => { if (mounted) ScrollTrigger.refresh(); });
    const syncVisibility = () => gsap.globalTimeline.paused(document.hidden);
    document.addEventListener('visibilitychange', syncVisibility);
    syncVisibility();
    return () => {
      mounted = false;
      ScrollTrigger.removeEventListener('revert', rememberScroll);
      ScrollTrigger.removeEventListener('matchMedia', restoreScroll);
      media.revert();
      document.removeEventListener('visibilitychange', syncVisibility);
      gsap.globalTimeline.paused(false);
    };
  }, []);
}
