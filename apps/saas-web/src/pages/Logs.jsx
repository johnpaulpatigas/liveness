import {
  Activity,
  AlertCircle,
  Clock,
  Code2,
  Cpu,
  Filter,
  Fingerprint,
  Key,
  Search,
  ShieldAlert,
  ShieldCheck,
  User,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { api } from "../services/api";

export default function Logs() {
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedLog, setSelectedLog] = useState(null);
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);

  const filterOptions = [
    { id: "ALL", label: "All Statuses", color: "bg-slate-400" },
    { id: "SUCCESS", label: "Passed Verification", color: "bg-emerald-500" },
    { id: "ENROLLED", label: "Enrolled Identities", color: "bg-purple-500" },
    { id: "FAILURE", label: "Failed / Blocked", color: "bg-rose-500" },
  ];

  const selectedOption =
    filterOptions.find((o) => o.id === statusFilter) || filterOptions[0];

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const data = await api.logs.list();
      setLogs(data);
    } catch (error) {
      console.error("Failed to fetch logs", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter((log) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      (log.userName || "").toLowerCase().includes(term) ||
      (log.apiKeyName || "").toLowerCase().includes(term) ||
      (log.apiKeyMasked || "").toLowerCase().includes(term);
    const matchesStatus = statusFilter === "ALL" || log.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalCount = logs.length;
  const successCount = logs.filter(
    (l) => l.status === "SUCCESS" || l.status === "ENROLLED",
  ).length;
  const passRate = totalCount
    ? ((successCount / totalCount) * 100).toFixed(1)
    : 0;
  const avgScore = totalCount
    ? (
        (logs.reduce((acc, l) => acc + (l.score || 0), 0) / totalCount) *
        100
      ).toFixed(1)
    : 0;

  return (
    <div className="animate-in fade-in space-y-6 duration-500">
      {/* Header Banner */}
      <div className="flex flex-col gap-4 border-b border-slate-200/80 pb-6 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
            Verification Logs
          </h1>
          <p className="mt-1 text-sm font-medium text-slate-600">
            Inspection log of verification attempts, similarity scores, and
            failure reasons.
          </p>
        </div>

        {/* Filter Controls */}
        <div className="flex w-full flex-col items-center gap-3 sm:flex-row md:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search subject..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white py-2 pr-4 pl-10 text-xs font-bold text-slate-900 shadow-2xs transition-all placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 focus:outline-none"
            />
          </div>

          {/* Custom Modern Status Dropdown */}
          <div className="relative w-full sm:w-52">
            <button
              type="button"
              onClick={() => setStatusDropdownOpen(!statusDropdownOpen)}
              className="flex w-full cursor-pointer items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-extrabold text-slate-700 shadow-2xs transition-all hover:border-slate-300 hover:bg-slate-50 focus:outline-none"
            >
              <div className="flex items-center gap-2 truncate">
                <span
                  className={`h-2 w-2 rounded-full ${selectedOption.color} shrink-0`}
                />
                <span className="truncate">{selectedOption.label}</span>
              </div>
              <Filter className="h-3.5 w-3.5 shrink-0 text-slate-400" />
            </button>

            {statusDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-20"
                  onClick={() => setStatusDropdownOpen(false)}
                />
                <div className="animate-in zoom-in-95 absolute right-0 z-30 mt-1.5 w-full rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl duration-150">
                  {filterOptions.map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => {
                        setStatusFilter(opt.id);
                        setStatusDropdownOpen(false);
                      }}
                      className={`flex w-full cursor-pointer items-center justify-between rounded-lg px-3 py-2 text-xs font-bold transition-all ${
                        statusFilter === opt.id
                          ? "bg-blue-50 font-extrabold text-blue-700"
                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className={`h-2 w-2 rounded-full ${opt.color}`} />
                        <span>{opt.label}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Metric Summary Cards */}
      {loading ? (
        <SkeletonTheme baseColor="#e2e8f0" highlightColor="#f8fafc">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center gap-4 rounded-xl border border-slate-200/80 bg-white p-4 shadow-2xs"
              >
                <Skeleton circle height={44} width={44} />
                <div className="w-full space-y-1">
                  <Skeleton height={10} width="60%" />
                  <Skeleton height={24} width="40%" />
                </div>
              </div>
            ))}
          </div>
        </SkeletonTheme>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="flex items-center gap-4 rounded-xl border border-slate-200/80 bg-white p-4 shadow-2xs">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-blue-100 bg-blue-50 text-blue-600">
              <Activity className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] font-extrabold tracking-wider text-slate-400 uppercase">
                Total Logged Sessions
              </p>
              <p className="text-xl font-black text-slate-900">{totalCount}</p>
            </div>
          </div>

          <div className="flex items-center gap-4 rounded-xl border border-slate-200/80 bg-white p-4 shadow-2xs">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-emerald-100 bg-emerald-50 text-emerald-600">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] font-extrabold tracking-wider text-slate-400 uppercase">
                Verification Pass Rate
              </p>
              <p className="text-xl font-black text-slate-900">{passRate}%</p>
            </div>
          </div>

          <div className="flex items-center gap-4 rounded-xl border border-slate-200/80 bg-white p-4 shadow-2xs">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-purple-100 bg-purple-50 text-purple-600">
              <Cpu className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] font-extrabold tracking-wider text-slate-400 uppercase">
                Avg Liveness Confidence
              </p>
              <p className="text-xl font-black text-slate-900">{avgScore}%</p>
            </div>
          </div>
        </div>
      )}

      {/* Logs Table */}
      {loading ? (
        <SkeletonTheme baseColor="#e2e8f0" highlightColor="#f8fafc">
          <div className="overflow-hidden rounded-xl border border-slate-200/80 bg-white p-4 shadow-xs">
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between border-b border-slate-100 py-2 last:border-0"
                >
                  <Skeleton height={20} width={80} borderRadius={6} />
                  <div className="flex w-1/4 items-center gap-2.5">
                    <Skeleton circle height={28} width={28} />
                    <Skeleton height={14} width="70%" />
                  </div>
                  <Skeleton height={14} width={80} />
                  <Skeleton height={14} width={120} />
                  <Skeleton height={14} width={60} />
                </div>
              ))}
            </div>
          </div>
        </SkeletonTheme>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[650px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50 text-[10px] font-bold tracking-wider text-slate-500 uppercase">
                  <th className="px-6 py-3.5">Result</th>
                  <th className="px-6 py-3.5">Subject</th>
                  <th className="px-6 py-3.5">API Key</th>
                  <th className="px-6 py-3.5">Score / Confidence</th>
                  <th className="px-6 py-3.5 text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLogs.map((log) => (
                  <tr
                    key={log.id}
                    onClick={() => setSelectedLog(log)}
                    className="group cursor-pointer transition-colors hover:bg-slate-50/80"
                  >
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-0.5 text-[10px] font-extrabold tracking-wider uppercase ${
                          log.status === "SUCCESS"
                            ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                            : log.status === "ENROLLED"
                              ? "border-purple-200 bg-purple-50 text-purple-700"
                              : "border-rose-200 bg-rose-50 text-rose-700"
                        }`}
                      >
                        {log.status === "SUCCESS" ? (
                          <ShieldCheck className="h-3 w-3" />
                        ) : log.status === "ENROLLED" ? (
                          <Fingerprint className="h-3 w-3" />
                        ) : (
                          <ShieldAlert className="h-3 w-3" />
                        )}
                        {log.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-900 transition-colors group-hover:text-blue-600">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-slate-200/60 bg-slate-50 text-slate-500">
                          <User className="h-3.5 w-3.5" />
                        </div>
                        <span className="truncate text-xs sm:text-sm">
                          {log.userName}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {log.apiKeyName ? (
                        <div className="flex items-center gap-1.5">
                          <Key className="h-3 w-3 shrink-0 text-slate-400" />
                          <span className="text-xs font-semibold text-slate-800">
                            {log.apiKeyName}
                          </span>
                          {log.apiKeyMasked && (
                            <span className="font-mono text-[10px] text-slate-400">
                              ({log.apiKeyMasked.slice(-8)})
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-1.5 w-20 overflow-hidden rounded-full bg-slate-100 sm:w-28">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${
                              log.status === "SUCCESS" ||
                              log.status === "ENROLLED"
                                ? "bg-emerald-500"
                                : "bg-rose-500"
                            }`}
                            style={{ width: `${(log.score || 0) * 100}%` }}
                          />
                        </div>
                        <span className="font-mono text-xs font-bold text-slate-600">
                          {((log.score || 0) * 100).toFixed(2)}%
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="inline-flex items-center gap-1 font-mono text-xs font-medium text-slate-500">
                        <Clock className="h-3 w-3 text-slate-400" />
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </span>
                    </td>
                  </tr>
                ))}
                {filteredLogs.length === 0 && (
                  <tr>
                    <td colSpan="5" className="px-6 py-14 text-center">
                      <div className="flex flex-col items-center">
                        <AlertCircle className="mb-3 h-8 w-8 text-slate-300" />
                        <p className="text-xs font-extrabold tracking-widest text-slate-500 uppercase">
                          No audit telemetry logs found
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Telemetry Detail Inspector Modal (React Portal) */}
      {selectedLog &&
        createPortal(
          <div className="animate-in fade-in fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm duration-200">
            <div
              className="fixed inset-0 cursor-pointer"
              onClick={() => setSelectedLog(null)}
            />
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="log-detail-modal-title"
              className="animate-in zoom-in-95 relative z-10 flex max-h-[90vh] w-full max-w-xl flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-6 shadow-2xl duration-200"
            >
              {/* Header */}
              <div className="mb-4 flex shrink-0 items-start justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-900 text-white shadow-2xs">
                    <Activity className="h-5 w-5" />
                  </div>
                  <div>
                    <h2
                      id="log-detail-modal-title"
                      className="text-base font-extrabold text-slate-900"
                    >
                      Telemetry Session Detail
                    </h2>
                    <p className="font-mono text-xs font-medium text-slate-500">
                      ID: {selectedLog.id}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedLog(null)}
                  className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg bg-slate-100 text-slate-500 transition-colors hover:bg-slate-200 hover:text-slate-700"
                  aria-label="Close modal"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Scrollable Content */}
              <div className="space-y-4 overflow-y-auto pr-1 text-xs">
                {/* Status & Subject Header Card */}
                <div className="grid grid-cols-1 gap-3 rounded-xl border border-slate-100 bg-slate-50 p-4 sm:grid-cols-3">
                  <div>
                    <span className="mb-1 block text-[10px] font-extrabold tracking-wider text-slate-400 uppercase">
                      Subject Name
                    </span>
                    <span className="text-sm font-bold text-slate-900">
                      {selectedLog.userName}
                    </span>
                  </div>
                  <div>
                    <span className="mb-1 block text-[10px] font-extrabold tracking-wider text-slate-400 uppercase">
                      Session Status
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[10px] font-extrabold tracking-wider uppercase ${
                        selectedLog.status === "SUCCESS"
                          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                          : selectedLog.status === "ENROLLED"
                            ? "border-purple-200 bg-purple-50 text-purple-700"
                            : "border-rose-200 bg-rose-50 text-rose-700"
                      }`}
                    >
                      {selectedLog.status}
                    </span>
                  </div>
                  <div>
                    <span className="mb-1 block text-[10px] font-extrabold tracking-wider text-slate-400 uppercase">
                      Origin API Key
                    </span>
                    <span className="text-xs font-semibold text-slate-800">
                      {selectedLog.apiKeyName ? (
                        <span className="inline-flex items-center gap-1">
                          <Key className="h-3 w-3 shrink-0 text-slate-400" />
                          <span>
                            {selectedLog.apiKeyName}{" "}
                            <span className="font-mono text-[10px] text-slate-400">
                              ({selectedLog.apiKeyMasked || ""})
                            </span>
                          </span>
                        </span>
                      ) : (
                        "—"
                      )}
                    </span>
                  </div>
                </div>

                {/* Score & Telemetry Breakdown */}
                <div className="space-y-3 rounded-xl border border-slate-200/80 bg-white p-4">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-700">
                      Liveness Match Score
                    </span>
                    <span className="font-mono font-extrabold text-slate-900">
                      {((selectedLog.score || 0) * 100).toFixed(4)}%
                    </span>
                  </div>

                  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                      className={`h-full rounded-full transition-all ${
                        selectedLog.status === "SUCCESS" ||
                        selectedLog.status === "ENROLLED"
                          ? "bg-emerald-500"
                          : "bg-rose-500"
                      }`}
                      style={{ width: `${(selectedLog.score || 0) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Raw JSON Payload */}
                <div>
                  <div className="mb-1.5 flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-[10px] font-extrabold tracking-wider text-slate-400 uppercase">
                      <Code2 className="h-3.5 w-3.5" />
                      Raw Telemetry Payload JSON
                    </span>
                  </div>
                  <pre className="overflow-x-auto rounded-xl border border-slate-200/80 bg-slate-900 p-4 font-mono text-[11px] text-slate-300">
                    {JSON.stringify(selectedLog, null, 2)}
                  </pre>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="mt-4 flex shrink-0 items-center justify-end border-t border-slate-100 pt-4">
                <button
                  onClick={() => setSelectedLog(null)}
                  className="cursor-pointer rounded-xl border border-slate-200 bg-white px-5 py-2 text-xs font-bold text-slate-700 transition-all hover:border-slate-300 hover:bg-slate-50"
                >
                  Close Inspector
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}
