import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

const rootElement = document.getElementById('root');
if (!rootElement) {
  console.error("Root element not found");
} else {
  try {
    createRoot(rootElement).render(
      <StrictMode>
        <App />
      </StrictMode>,
    );
  } catch (error) {
    console.error("React render error:", error);
    rootElement.innerHTML = `<div style="padding: 20px; color: red;">Error: ${error instanceof Error ? error.message : "Failed to load app"}</div>`;
  }
}
