import { useState } from "react";

export function ApiSettings({ config, onSave }) {
  const [isOpen, setIsOpen] = useState(false);
  const [enabled, setEnabled] = useState(config.enabled ?? !!config.apiKey);
  const [apiKey, setApiKey] = useState(config.apiKey || "");
  const [apiUrl, setApiUrl] = useState(
    config.apiUrl || "https://api.liveness.cloud/api/liveness",
  );

  const handleSave = () => {
    onSave({
      enabled,
      apiKey: apiKey.trim(),
      apiUrl: apiUrl.trim(),
    });
    setIsOpen(false);
  };

  return (
    <div className="relative flex items-center">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex cursor-pointer items-center gap-1.5 text-xs font-medium text-slate-500 transition-colors hover:text-blue-600"
        type="button"
      >
        <svg
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
          ></path>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          ></path>
        </svg>
        <span>API Settings</span>
      </button>

      {isOpen && (
        <div className="animate-in fade-in slide-in-from-top-2 absolute top-8 right-0 z-50 w-72 rounded-xl border border-slate-200 bg-white p-4 shadow-xl ring-1 ring-black/5 duration-200">
          <h4 className="mb-3 text-sm font-bold text-slate-800">
            Backend Connection
          </h4>

          <div className="space-y-4">
            <label className="flex cursor-pointer items-center justify-between rounded-lg border border-slate-200 bg-slate-50 p-2.5">
              <div>
                <p className="text-xs font-semibold text-slate-800">
                  Cloud SaaS API
                </p>
                <p className="text-[10px] text-slate-500">
                  {enabled
                    ? "Syncs with PostgreSQL"
                    : "Disabled (Offline Mode)"}
                </p>
              </div>
              <input
                type="checkbox"
                checked={enabled}
                onChange={(e) => setEnabled(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
            </label>

            {enabled && (
              <>
                <div>
                  <label className="mb-1 block text-xs font-semibold tracking-wider text-slate-500 uppercase">
                    API Base URL
                  </label>
                  <input
                    type="text"
                    value={apiUrl ?? ""}
                    onChange={(e) => setApiUrl(e.target.value)}
                    placeholder="https://api.liveness.cloud/api/liveness"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 font-mono text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold tracking-wider text-slate-500 uppercase">
                    API Key
                  </label>
                  <input
                    type="password"
                    value={apiKey ?? ""}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="Enter your API Key"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 font-mono text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </>
            )}

            {!enabled && (
              <p className="rounded-lg bg-slate-50 p-2.5 text-[11px] leading-relaxed text-slate-500">
                All face descriptors and identities will be stored locally in
                your browser. No network calls are made.
              </p>
            )}

            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleSave}
                className="flex-1 cursor-pointer rounded-lg bg-blue-600 py-2 text-xs font-bold text-white shadow-xs transition-colors hover:bg-blue-700"
              >
                Save
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="flex-1 cursor-pointer rounded-lg bg-slate-100 py-2 text-xs font-bold text-slate-600 transition-colors hover:bg-slate-200"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
