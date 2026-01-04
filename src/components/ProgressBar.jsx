// src/components/ProgressBar.jsx
const Arrow = ({ direction }) => (
  <div
    className={`flex items-center justify-center w-8 h-8 rounded-full bg-white/20 text-white`}
  >
    {direction === "left" ? (
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M15 19l-7-7 7-7"
        ></path>
      </svg>
    ) : (
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M9 5l7 7-7 7"
        ></path>
      </svg>
    )}
  </div>
);

export function ProgressBar({ progress, direction }) {
  const clampedProgress = Math.max(0, Math.min(progress, 1));

  return (
    <div className="flex items-center gap-4 w-full bg-black/40 backdrop-blur-md rounded-xl p-3 shadow-lg border border-white/10">
      <div
        className={`${direction === "right" ? "opacity-30" : "opacity-100 animate-pulse text-blue-400"}`}
      >
        <Arrow direction="left" />
      </div>

      <div className="flex-grow h-3 bg-white/20 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-100 ease-out"
          style={{ width: `${clampedProgress * 100}%` }}
        />
      </div>

      <div
        className={`${direction === "left" ? "opacity-30" : "opacity-100 animate-pulse text-blue-400"}`}
      >
        <Arrow direction="right" />
      </div>
    </div>
  );
}
