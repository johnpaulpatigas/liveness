import React from "react";

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Unhandled Application Error:", error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = "/";
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-[#fafbfc] px-4 font-sans text-slate-900">
          <div className="w-full max-w-md rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm text-center sm:p-8">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600">
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h1 className="font-display text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
              Something went wrong
            </h1>
            <p className="mt-2 text-xs text-slate-600 sm:text-sm">
              An unexpected application error occurred. You can reload the page or return to the home screen.
            </p>
            {this.state.error?.message && (
              <pre className="mt-3 rounded-lg bg-slate-50 p-2.5 text-left font-mono text-[11px] leading-relaxed text-slate-500 whitespace-pre-wrap break-words">
                {this.state.error.message}
              </pre>
            )}
            <div className="mt-6 flex flex-col gap-2.5 sm:flex-row">
              <button
                type="button"
                onClick={this.handleReload}
                className="flex-1 cursor-pointer rounded-lg bg-[#2f5bf5] px-4 py-2.5 text-xs font-semibold text-white shadow-xs transition hover:bg-[#204be8]"
              >
                Reload Page
              </button>
              <button
                type="button"
                onClick={this.handleReset}
                className="flex-1 cursor-pointer rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 shadow-2xs transition hover:bg-slate-50"
              >
                Back to Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
