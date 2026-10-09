import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import './JellyNav.css';

const items = [
  { id: 'about', label: '关于我' },
  { id: 'experience', label: '工作经历' },
  { id: 'works', label: '视频作品' },
  { id: 'contact', label: '联系我' }
];
const spring = (stiffness: number, mass: number, bounce: number) => ({
  type: 'spring' as const, stiffness, mass, damping: 2 * Math.sqrt(stiffness * mass) * (1 - bounce)
});

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
  return <div ref={group} className="jelly-nav">{items.map((item, i) => {
    const on = i === active;
    const distance = Math.abs(i - active);
    const stiffness = 580 * (1 - 0.12 * Math.min(distance, 3));
    const delay = distance * 0.022;
    const scale = on ? 1.12 : 0.975;
    return <motion.a key={item.id} href={`#${item.id}`} className="jelly-nav__chip" data-on={on} aria-current={on ? 'location' : undefined}
      initial={false} animate={{ x: Math.sign(i - active) * push, scaleX: scale, scaleY: scale }}
      transition={reduced ? { duration: 0 } : {
        x: { ...spring(stiffness, 0.9, 0.25), delay },
        scaleX: { ...spring(stiffness * 1.24, 0.8, 0.55), delay },
        scaleY: { ...spring(stiffness * 0.86, 0.95, 0.25), delay: delay + 0.05 }
      }} onClick={event => { if (!event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey) setActive(i); }}>
      <span className="jelly-nav__skin">{item.label}</span>
    </motion.a>;
  })}</div>;
}
