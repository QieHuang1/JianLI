import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { useReducedMotion } from './useReducedMotion';
import './JellyNav.css';

const items = [
  { id: 'about', label: '关于我' },
  { id: 'experience', label: '工作经历' },
  { id: 'works', label: '视频作品' },
  { id: 'contact', label: '联系我' }
];

// Adapted from the supplied JellyRadio: keep anchor navigation and its elastic motion.
export default function JellyNav() {
  const [active, setActive] = useState(0);
  const [widths, setWidths] = useState<number[]>([]);
  const group = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useLayoutEffect(() => {
    const element = group.current;
    if (!element) return;
    const measure = () => {
      const next = Array.from(element.children, child => (child as HTMLElement).offsetWidth);
      setWidths(previous => next.every((width, i) => width === previous[i]) ? previous : next);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const sections = items.map(item => document.getElementById(item.id));
    let frame = 0;
    const syncSection = () => {
      frame = 0;
      let index = 0;
      sections.forEach((section, i) => {
        if (section && section.getBoundingClientRect().top <= window.innerHeight * 0.25) index = i;
      });
      if (window.scrollY > 0 && document.documentElement.scrollHeight - window.innerHeight - window.scrollY <= 2) index = items.length - 1;
      setActive(index);
    };
    const scheduleSync = () => { if (!frame) frame = requestAnimationFrame(syncSection); };
    syncSection();
    window.addEventListener('scroll', scheduleSync, { passive: true });
    window.addEventListener('resize', scheduleSync);
    window.addEventListener('hashchange', scheduleSync);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', scheduleSync);
      window.removeEventListener('resize', scheduleSync);
      window.removeEventListener('hashchange', scheduleSync);
    };
  }, []);

  const push = (widths[active] || 0) * 0.12 / 2 + 3;
  useLayoutEffect(() => {
    if (!group.current) return;
    const tween = gsap.to(group.current.children, {
      x: (index: number) => Math.sign(index - active) * push,
      scaleX: (index: number) => index === active ? 1.12 : 0.975,
      scaleY: (index: number) => index === active ? 1.12 : 0.975,
      duration: reduced ? 0 : 0.45, ease: 'power3.out',
      delay: (index: number) => reduced ? 0 : Math.abs(index - active) * 0.022,
      overwrite: 'auto'
    });
    return () => { tween.kill(); };
  }, [active, push, reduced]);

  return <div ref={group} className="jelly-nav">{items.map((item, i) => {
    const on = i === active;
    return <a key={item.id} href={`#${item.id}`} className="jelly-nav__chip" data-on={on} aria-current={on ? 'location' : undefined}
      onClick={event => { if (!event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey) setActive(i); }}>
      <span className="jelly-nav__skin">{item.label}</span>
    </a>;
  })}</div>;
}
