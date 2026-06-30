import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/** Reset window scroll when navigating between routes. */
export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
