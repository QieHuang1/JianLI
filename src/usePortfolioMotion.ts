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

    media.add('(prefers-reduced-motion: no-preference)', context => {
      if (!window.location.hash && window.scrollY < 80) {
        root.classList.add('is-opening');
        gsap.set('.opening-curtain', { display: 'block', transformOrigin: 'center top' });
        gsap.timeline({ defaults: { ease: 'power3.out' }, onComplete: () => root.classList.remove('is-opening') })
          .from('.hero-frame', { clipPath: 'inset(8% 16% 8% 16% round 30px)', duration: 2.1, ease: 'power3.inOut', clearProps: 'clipPath' }, 0)
          .to('.opening-curtain', { scaleY: 0, duration: 1.4, ease: 'power2.inOut', onComplete: () => { gsap.set('.opening-curtain', { display: 'none' }); } }, 0.12)
          .from('.hero-video', { scale: 1.22, duration: 3.15, ease: 'power2.out', clearProps: 'transform' }, 0.15)
          .from('.hero-nav', { clipPath: 'inset(0 50% 0 50% round 999px)', y: -20, duration: 1.35, clearProps: 'clipPath,transform' }, 0.45)
          .from('.hero-middle .eyebrow', { clipPath: 'inset(0 100% 0 0)', duration: 1.35, clearProps: 'clipPath' }, 0.9)
          .from('.hero-title-line', { yPercent: 120, scaleX: 0.72, scaleY: 1.16, skewY: 6, transformOrigin: 'left bottom', duration: 1.85, stagger: 0.18, clearProps: 'transform' }, 1)
          .from('.intro-line', { yPercent: 115, duration: 1.4, stagger: 0.12, clearProps: 'transform' }, 1.55)
          .from('.hero-intro .pill-button', { clipPath: 'inset(0 100% 0 0 round 100px)', y: 24, duration: 1.3, clearProps: 'clipPath,transform' }, 2)
          .from('.hero-bottom', { clipPath: 'inset(0 0 100% 0)', y: 24, duration: 1.15, clearProps: 'clipPath,transform' }, 2.15);
      }

      const introductions = new Map<HTMLElement, gsap.core.Timeline>();
      gsap.utils.toArray<HTMLElement>('.motion-module').forEach(module => {
        const title = module.querySelector('.display-title');
        const timeline = gsap.timeline({
          defaults: { duration: 1.6, ease: 'power3.out' },
          scrollTrigger: { trigger: title, start: 'clamp(top 85%)', once: true }
        });
        introductions.set(module, timeline);
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
        timeline.from(lead || [], { y: 80, clipPath: 'inset(0 0 100% 0 round 16px)', stagger: 0.16, clearProps: 'transform,clipPath' }, 0.62);
        if (module.id === 'about') timeline.from('.profile-line img', { clipPath: 'inset(100% 0 0 0)', scale: 1.16, duration: 1.7, clearProps: 'transform,clipPath' }, 1.08);
      });

      gsap.from('.stats-grid > div', {
        y: 80, clipPath: 'inset(0 0 100% 0)', duration: 1.5, stagger: 0.16, ease: 'power3.out', clearProps: 'transform,clipPath',
        scrollTrigger: { trigger: '.stats-grid', start: 'clamp(top 90%)', once: true }
      });

      const cards = gsap.utils.toArray<HTMLElement>('.works-grid > div');
      gsap.set('.work-card', { y: 110, rotation: 1.5, clipPath: 'inset(0 0 100% 0 round 14px)' });
      gsap.set('.poster', { clipPath: 'inset(100% 0 0 0 round 14px)' });
      gsap.set('.poster img', { scale: 1.2 });
      const revealCards = context.add('revealCards', (batch: HTMLElement[]) => {
          const buttons = batch.map(card => card.querySelector('.work-card'));
          const posters = batch.map(card => card.querySelector('.poster'));
          const images = batch.map(card => card.querySelector('.poster img'));
          const intro = introductions.get(document.getElementById('works')!);
          gsap.timeline({ delay: intro?.isActive() ? 0.45 : 0, defaults: { ease: 'power3.out' } })
            .to(buttons, { y: 0, rotation: 0, clipPath: 'inset(0 0 0% 0 round 14px)', duration: 1.65, stagger: 0.14, clearProps: 'transform,clipPath' }, 0)
            .to(posters, { clipPath: 'inset(0% 0 0 0 round 14px)', duration: 1.7, stagger: 0.14, clearProps: 'clipPath' }, 0.12)
            .to(images, { scale: 1.12, duration: 2.1, stagger: 0.14 }, 0.12);
      });
      ScrollTrigger.batch(cards, {
        start: 'clamp(top 92%)', once: true, interval: 0.12, onEnter: batch => revealCards(batch)
      });

      // Keyboard navigation should never wait for a masked card to finish revealing.
      const onFocus = context.add('revealFocusedCard', (event: FocusEvent) => {
        const card = (event.target as HTMLElement).closest('.work-card');
        if (card) {
          gsap.getTweensOf([card, ...card.querySelectorAll('.poster, .poster img')]).forEach(tween => tween.progress(1));
          gsap.set(card, { y: 0, rotation: 0, clipPath: 'none' });
          gsap.set(card.querySelector('.poster'), { clipPath: 'none' });
        }
      }) as (event: FocusEvent) => void;
      root.addEventListener('focusin', onFocus);
      return () => { root.classList.remove('is-opening'); root.removeEventListener('focusin', onFocus); };
    });

    media.add('(min-width: 1001px) and (pointer: fine) and (prefers-reduced-motion: no-preference)', () => {
      gsap.utils.toArray<HTMLElement>('.poster img').forEach(image => {
        gsap.fromTo(image, { yPercent: -4 }, {
          yPercent: 4, ease: 'none',
          scrollTrigger: { trigger: image.closest('.works-grid > div'), start: 'top bottom', end: 'bottom top', scrub: 1.1, invalidateOnRefresh: true }
        });
      });
    });

    document.fonts.ready.then(() => { if (mounted) ScrollTrigger.refresh(); });
    return () => { mounted = false; media.revert(); };
  }, []);
}
