
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

const renderApp = () => {
  const container = document.getElementById('root');
  if (container) {
    const root = createRoot(container);
    
    // Resolve potential module namespace object issue from Babel Standalone
    let AppComponent: any = App;
    if (App && typeof App === 'object' && 'default' in App) {
      AppComponent = App.default;
    }
    
    // Final check to ensure we have a valid component
    if (!AppComponent || (typeof AppComponent !== 'function' && typeof AppComponent !== 'object')) {
      console.error("App component is invalid:", AppComponent);
      return;
    }

    root.render(
      <React.StrictMode>
        <AppComponent />
      </React.StrictMode>
    );
  } else {
    console.error("Fatal: Root element not found");
  }
};

// Use a cleaner event listener for app initialization
if (document.readyState === 'complete') {
  renderApp();
} else {
  window.addEventListener('load', renderApp);
}
