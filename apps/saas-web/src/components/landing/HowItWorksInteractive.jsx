import { Check, ChevronRight, Copy } from "lucide-react";
import { useState } from "react";

const STEPS_DATA = [
  {
    id: 1,
    step: "Step 1",
    title: "Install Package",
    description: "Add @liveness/sdk to your project using npm or yarn.",
    fileName: "Terminal",
    code: `npm install @liveness/sdk`,
    statusMessage: "Package ready for initialization",
    tag: "Frontend SDK",
  },
  {
    id: 2,
    step: "Step 2",
    title: "Run Active Session",
    description:
      "Attach the SDK to your video element and listen for challenge events.",
    fileName: "LivenessCamera.jsx",
    code: `import { LivenessSDK } from '@liveness/sdk';

const sdk = new LivenessSDK({ basePath: '/assets/models' });
await sdk.load();

sdk.on('challenge', ({ instruction }) => updateUI(instruction));
sdk.on('success', (result) => verifyWithServer(result));

await sdk.start(videoElement, canvasElement);`,
    statusMessage: "Active tracking: 60 FPS face mesh ok",
    tag: "Client Runtime",
  },
  {
    id: 3,
    step: "Step 3",
    title: "Verify via Cloud API",
    description:
      "Send the descriptor payload to your backend to compare against enrolled users.",
    fileName: "api/verify.js",
    code: `// Express / Node.js Backend Handler
import { LivenessApiClient } from '@liveness/api-client';

const client = new LivenessApiClient({
  apiKey: process.env.LIVENESS_API_KEY,
});

app.post('/api/verify', async (req, res) => {
  const result = await client.liveness.verify(req.body);
  res.json(result);
});`,
    statusMessage: "HTTP 200 OK: Match confirmed (similarity: 0.98)",
    tag: "Backend Verification",
  },
];

export function HowItWorksInteractive() {
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [stepCopied, setStepCopied] = useState(false);

  const activeStepData = STEPS_DATA[activeStepIndex];

  const handleCopyCode = (text) => {
    navigator.clipboard.writeText(text);
    setStepCopied(true);
    setTimeout(() => setStepCopied(false), 2000);
  };

  return (
    <div className="w-full max-w-full overflow-hidden">
      {/* Mobile Step Selector Tabs (Visible on small screens < 1024px) */}
      <div
        role="tablist"
        aria-label="Workflow steps"
        className="mb-6 flex items-center justify-between gap-1.5 rounded-md border border-slate-800 bg-[#101216] p-1.5 lg:hidden"
      >
        {STEPS_DATA.map((step, idx) => (
          <button
            key={step.id}
            role="tab"
            aria-selected={idx === activeStepIndex}
            onClick={() => {
              setActiveStepIndex(idx);
              setStepCopied(false);
            }}
            className={`flex-1 cursor-pointer rounded-sm px-3 py-2 text-center font-mono text-xs font-semibold transition-colors ${
              idx === activeStepIndex
                ? "bg-[#2f5bf5] text-white shadow-xs"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Step {step.id}
          </button>
        ))}
      </div>

      <div className="grid items-stretch gap-6 text-left lg:grid-cols-12 lg:gap-8">
        {/* Left Column: Interactive Step Cards (Desktop / Tablet) */}
        <div
          role="tablist"
          aria-label="Interactive workflow step details"
          className="flex min-w-0 flex-col justify-between space-y-3 lg:col-span-5"
        >
          {STEPS_DATA.map((step, idx) => {
            const isActive = idx === activeStepIndex;
            return (
              <button
                key={step.id}
                role="tab"
                aria-selected={isActive}
                onClick={() => {
                  setActiveStepIndex(idx);
                  setStepCopied(false);
                }}
                className={`w-full cursor-pointer rounded-lg border p-5 text-left transition-[border-color,background-color,box-shadow] duration-150 sm:p-6 ${
                  isActive
                    ? "border-[#2f5bf5]/60 bg-[#21242d] shadow-sm"
                    : "border-slate-800/90 bg-[#14161c] hover:border-slate-700 hover:bg-[#191b22]"
                }`}
              >
                <div className="mb-2 flex flex-wrap items-center justify-between gap-1">
                  <span
                    className={`rounded-sm px-2 py-0.5 font-mono text-[10px] font-semibold tracking-wider uppercase sm:text-xs ${
                      isActive
                        ? "bg-[#2f5bf5] text-white"
                        : "bg-slate-800 text-slate-400"
                    }`}
                  >
                    {step.step}
                  </span>
                  <span className="font-mono text-[10px] font-semibold text-slate-400 sm:text-xs">
                    {step.tag}
                  </span>
                </div>
                <h3 className="font-display mb-1 flex items-center justify-between text-sm font-bold text-white sm:text-base">
                  <span>{step.title}</span>
                  <ChevronRight
                    className={`h-4 w-4 shrink-0 transition-transform duration-200 ${
                      isActive
                        ? "translate-x-1 text-[#6b8af9]"
                        : "text-slate-600"
                    }`}
                  />
                </h3>
                <p className="text-xs leading-relaxed text-slate-400">
                  {step.description}
                </p>
              </button>
            );
          })}
        </div>

        {/* Right Column: Code Window Mockup */}
        <div className="flex min-w-0 flex-col lg:col-span-7">
          <div className="flex h-full max-w-full flex-col overflow-hidden rounded-[10px] border border-slate-800 bg-[#101216] text-slate-100 shadow-xl">
            {/* Header Bar */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 bg-[#14161c] px-3.5 py-2.5 sm:px-4">
              <div className="flex shrink-0 items-center gap-2">
                <span className="font-mono text-xs font-medium text-slate-300">
                  {activeStepData.fileName}
                </span>
              </div>

              {/* Quick Step Switcher Tabs */}
              <div
                role="tablist"
                aria-label="Integration steps"
                className="flex items-center space-x-1 rounded-md border border-slate-800 bg-[#101216] p-1"
              >
                {STEPS_DATA.map((step, idx) => (
                  <button
                    key={step.id}
                    role="tab"
                    aria-selected={idx === activeStepIndex}
                    onClick={() => {
                      setActiveStepIndex(idx);
                      setStepCopied(false);
                    }}
                    className={`cursor-pointer rounded-sm px-2 py-0.5 font-mono text-[10px] font-medium transition-colors sm:px-2.5 sm:py-1 sm:text-[11px] ${
                      idx === activeStepIndex
                        ? "bg-[#2f5bf5] text-white"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    Step {step.id}
                  </button>
                ))}
              </div>

              {/* Copy Button */}
              <button
                onClick={() => handleCopyCode(activeStepData.code)}
                className="flex w-20 shrink-0 cursor-pointer items-center justify-center space-x-1.5 rounded-md border border-slate-700/80 bg-slate-800/90 py-1 text-xs font-medium text-slate-300 transition-[border-color,background-color,color] hover:border-slate-600 hover:bg-slate-700 hover:text-white"
                title="Copy code snippet"
                aria-label="Copy code snippet"
              >
                {stepCopied ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>

            {/* Code Viewport */}
            <div className="max-w-full min-w-0 flex-1 overflow-x-auto bg-[#101216] p-4 font-mono text-xs leading-relaxed text-slate-200 sm:p-5">
              <pre className="wrap-break-word whitespace-pre-wrap sm:whitespace-pre">
                <code>{activeStepData.code}</code>
              </pre>
            </div>

            {/* Output State */}
            <div className="flex items-center justify-between border-t border-slate-800/80 bg-[#14161c] px-4 py-2.5 text-xs font-medium text-slate-400">
              <span className="font-mono text-[11px] text-emerald-400">
                {activeStepData.statusMessage}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
