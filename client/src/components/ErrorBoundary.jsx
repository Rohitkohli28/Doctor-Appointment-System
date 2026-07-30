import React, { Component } from 'react';
import { ShieldAlert, RefreshCw, Home } from 'lucide-react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 py-12 px-4 sm:px-6 lg:px-8 text-center transition-colors duration-300">
          <div className="max-w-md w-full space-y-8 bg-white dark:bg-slate-800 p-10 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-700/50 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-red-50 dark:bg-red-950/20 rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/2"></div>
            
            <div className="relative z-10 space-y-6">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 mb-2">
                <ShieldAlert className="w-10 h-10 animate-bounce" />
              </div>
              
              <div className="space-y-2">
                <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Something went wrong</h1>
                <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                  We encountered an unexpected error on this page. Please try refreshing or returning to the home page.
                </p>
              </div>

              {this.state.error && (
                <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800 text-left max-h-[120px] overflow-auto">
                  <code className="text-xs font-mono text-red-500 dark:text-red-400 break-all leading-normal block">
                    {this.state.error.toString()}
                  </code>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  onClick={this.handleReload}
                  className="flex-1 flex items-center justify-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-lg shadow-primary-500/20 text-sm font-bold text-white bg-primary-600 hover:bg-primary-700 transition-all hover:-translate-y-0.5"
                >
                  <RefreshCw className="w-4 h-4" /> Reload Page
                </button>
                <button
                  onClick={this.handleGoHome}
                  className="flex-1 flex items-center justify-center gap-2 py-3 px-4 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all hover:-translate-y-0.5"
                >
                  <Home className="w-4 h-4" /> Go Home
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
