import { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';

export function ScrollToTop() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const handleScroll = () => setShow(window.scrollY > 300);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!show) return null;

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className="fixed right-4 bottom-24 z-40 h-11 w-11 rounded-full gradient-accent text-accent-foreground shadow-lg glow-accent flex items-center justify-center animate-pop-in hover:brightness-110 transition-all"
    >
      <ArrowUp className="h-5 w-5" />
    </button>
  );
}
