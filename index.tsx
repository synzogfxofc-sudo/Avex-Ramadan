import React, { Component, ReactNode, ErrorInfo } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: 20, 
          color: 'white', 
          background: '#09090b', 
          height: '100vh', 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center', 
          textAlign: 'center',
          fontFamily: 'sans-serif'
        }}>
          <h2 style={{fontSize: '1.5rem', marginBottom: '1rem', color: '#ef4444'}}>Something went wrong</h2>
          <div style={{background: '#18181b', padding: '1rem', borderRadius: '0.5rem', overflow: 'auto', maxWidth: '800px', textAlign: 'left', marginBottom: '1.5rem'}}>
            <code style={{color: '#f87171'}}>{this.state.error?.message}</code>
          </div>
          <button 
            onClick={() => window.location.reload()} 
            style={{
              padding: '0.75rem 1.5rem', 
              background: '#84cc16', 
              color: 'black', 
              border: 'none', 
              borderRadius: '0.5rem', 
              cursor: 'pointer', 
              fontWeight: 'bold'
            }}
          >
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

const root = createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);