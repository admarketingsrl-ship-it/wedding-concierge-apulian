import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Protezione globale: garantisce che savedSessionMeta sia sempre accessibile
if (typeof window !== 'undefined') {
  (window as any).savedSessionMeta = null;
}

createRoot(document.getElementById('root')!).render(<App />);
