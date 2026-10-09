import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { useReducedMotion } from './useReducedMotion';
import './Grainient.css';

const Grainient = lazy(() => import('./Grainient'));

export default function PortfolioBackground({ paused }: { paused: boolean }) {
  const element = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const reduced = useReducedMotion();

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && entry.intersectionRatio > 0) {
        setVisible(true);
        observer.disconnect();
      }
    }, { threshold: 0.001 });
    if (element.current) observer.observe(element.current);
    return () => observer.disconnect();
  }, []);

  const fallback = <div className="grainient-container" />;
  return <div ref={element} className="portfolio-background" aria-hidden="true">
    {visible && !reduced ? <Suspense fallback={fallback}><Grainient paused={paused} /></Suspense> : fallback}
  </div>;
}
