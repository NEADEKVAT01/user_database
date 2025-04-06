import { Component } from 'react';
import "../styles/Error.css";
/**
 * Error boundary component to catch JavaScript errors in child components
 */
class ErrorBoundary extends Component {
  state = { hasError: false, error: null };

  // Update state when an error is caught
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  // Log error information
  componentDidCatch(error, errorInfo) {
    console.error('Error caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // Render fallback UI when error occurs
      return (
        <div className="error-boundary">
          <h2>Something went wrong</h2>
          <p>{this.state.error.message}</p>
          <button onClick={() => window.location.reload()}>Reload Page</button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;