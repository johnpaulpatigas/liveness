// src/App.jsx
import { LivenessChecker } from "./components/LivenessChecker";

function App() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-blue-100 selection:text-blue-900 flex flex-col">
      <nav className="sticky top-0 z-50 backdrop-blur-md bg-white/70 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-sm">
                L
              </div>
              <span className="font-bold text-xl tracking-tight text-slate-800">
                Liveness <span className="text-blue-600">SDK</span>
              </span>
            </div>
            <div className="hidden md:flex gap-6 text-sm font-medium text-slate-600">
              <a
                href="https://github.com/johnpaulpatigas/liveness/blob/main/README.md"
                target="_blank"
                rel="noreferrer"
                className="hover:text-blue-600 transition-colors"
              >
                Documentation
              </a>
              <a
                href="https://github.com/johnpaulpatigas/liveness"
                target="_blank"
                rel="noreferrer"
                className="hover:text-blue-600 transition-colors"
              >
                GitHub
              </a>
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-grow flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-block px-3 py-1 mb-4 text-xs font-semibold tracking-wider text-blue-600 uppercase bg-blue-100 rounded-full">
            Information Technology Capstone 2026
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight mb-4">
            Liveness SDK
          </h1>
          <p className="text-lg sm:text-xl text-slate-600 leading-relaxed">
            A framework-agnostic SDK for active liveness detection and face
            matching using{" "}
            <span className="font-semibold text-slate-800">MediaPipe</span> and{" "}
            <span className="font-semibold text-slate-800">TensorFlow.js</span>.
          </p>
        </div>

        <div className="w-full max-w-4xl bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden ring-1 ring-slate-900/5">
          <div className="p-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 opacity-80"></div>
          <div className="p-6 sm:p-10">
            <LivenessChecker />
          </div>
        </div>
      </main>

      <footer className="bg-white border-t border-slate-200 mt-auto">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-slate-500 text-sm">
            &copy; 2026 John Paul Patigas. All rights reserved.
          </p>
          <div className="flex gap-4 text-sm text-slate-500">
            <span>v1.0.0 (Beta)</span>
            <span className="hidden sm:inline">&bull;</span>
            <span className="hidden sm:inline">Powered by WebGL</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
