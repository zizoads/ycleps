
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import "https://esm.sh/react@18.3.1";
import "https://esm.sh/react-dom@18.3.1/client";
import "https://esm.sh/uuid@9.0.1";
import "https://esm.sh/marked@12.0.2";
import "https://esm.sh/@google/genai@0.1.0";


const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
      <App />
  </React.StrictMode>
);
