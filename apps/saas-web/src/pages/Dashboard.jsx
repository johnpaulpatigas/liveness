import {
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  Clock,
  ExternalLink,
  FileText,
  Fingerprint,
  Key,
  Server,
  ShieldAlert,
  ShieldCheck,
  User,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { Link } from "react-router-dom";
import { api } from "../services/api";

function formatRelativeTime(isoString) {
  if (!isoString) return "—";
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return "—";
    const now = new Date();
    const diffMs = now - date;
    const diffSecs = Math.floor(diffMs / 1000);
    if (diffSecs < 60) return "Just now";
    const diffMins = Math.floor(diffSecs / 60);
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    });
  } catch {
    return "—";
  }
}

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState(7);
  const [hoveredDay, setHoveredDay] = useState(null);

  const [stats, setStats] = useState({
    totalUsers: 0,
    totalChecks: 0,
    passRate: 0,
    avgConfidence: 0,
    outcomes: {
      passed: 0,
      failed: 0,
      enrolled: 0,
    },
    timeline: [],
  });

  const [recentLogs, setRecentLogs] = useState([]);
  const [apiKeysCount, setApiKeysCount] = useState(null);

  const [systemStatus, setSystemStatus] = useState({
    api: "Checking...",
    database: "Checking...",
  });

  useEffect(() => {
    let isMounted = true;

    const loadDashboardData = async () => {
      try {
        const [statsData, healthData, logsData, keysData] = await Promise.all([
          api.stats.getOverview(timeRange).catch(() => ({
            totalUsers: 0,
            totalChecks: 0,
            passRate: 0,
            avgConfidence: 0,
            outcomes: { passed: 0, failed: 0, enrolled: 0 },
            timeline: [],
          })),
          api.system
            .getHealth()
            .catch(() => ({ status: "error", database: "disconnected" })),
          api.logs.list().catch(() => []),
          api.apiKeys.list().catch(() => []),
        ]);

        if (!isMounted) return;

        setStats({
          totalUsers: statsData.totalUsers || 0,
          totalChecks: statsData.totalChecks || 0,
          passRate: statsData.passRate || 0,
          avgConfidence: statsData.avgConfidence || 0,
          outcomes: statsData.outcomes || { passed: 0, failed: 0, enrolled: 0 },
          timeline: statsData.timeline || [],
        });

        setSystemStatus({
          api: healthData.status === "ok" ? "Operational" : "Offline",
          database:
            healthData.database === "connected" ? "Connected" : "Disconnected",
        });

        setRecentLogs(Array.isArray(logsData) ? logsData.slice(0, 6) : []);
        setApiKeysCount(Array.isArray(keysData) ? keysData.length : 0);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadDashboardData();

    const interval = setInterval(loadDashboardData, 5000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [timeRange]);

  const cards = [
    {
      label: "Registered Users",
      value: (stats.totalUsers || 0).toLocaleString(),
      description: "Enrolled biometric profiles",
    },
    {
      label: "Verification Volume",
      value: (stats.totalChecks || 0).toLocaleString(),
      description: "All-time verification checks",
    },
    {
      label: "Validation Pass Rate",
      value: `${(stats.passRate || 0).toFixed(1)}%`,
      description: "Passed vs total runs",
    },
    {
      label: "Avg Match Confidence",
      value:
        stats.avgConfidence > 0
          ? `${(stats.avgConfidence || 0).toFixed(1)}%`
          : "—",
      description: "Mean cosine similarity score",
    },
  ];

  const shortcuts = [
    {
      title: "API Keys",
      description:
        apiKeysCount === null
          ? "Manage credentials"
          : `${apiKeysCount} active key${apiKeysCount === 1 ? "" : "s"}`,
      to: "/api-keys",
      icon: Key,
    },
    {
      title: "Identities",
      description: `${stats.totalUsers || 0} registered profile${stats.totalUsers === 1 ? "" : "s"}`,
      to: "/users",
      icon: Users,
    },
    {
      title: "Verification Logs",
      description: "Inspect full audit trail",
      to: "/logs",
      icon: FileText,
    },
    {
      title: "SDK Documentation",
      description: "Integration guide & API routes",
      to: "/docs",
      icon: ExternalLink,
    },
  ];

  // Calculations for Activity Timeline
  const maxDaily = Math.max(
    ...(stats.timeline || []).map((t) => t.total || 0),
    1,
  );
  const totalInTimeline = (stats.timeline || []).reduce(
    (acc, d) => acc + (d.total || 0),
    0,
  );
  const passedInTimeline = (stats.timeline || []).reduce(
    (acc, d) => acc + (d.passed || 0),
    0,
  );
  const failedInTimeline = (stats.timeline || []).reduce(
    (acc, d) => acc + (d.failed || 0),
    0,
  );
  const enrolledInTimeline = (stats.timeline || []).reduce(
    (acc, d) => acc + (d.enrolled || 0),
    0,
  );

  // Calculations for Verification Performance & Breakdown
  const passedCount = stats.outcomes?.passed || 0;
  const failedCount = stats.outcomes?.failed || 0;
  const totalVerifications = passedCount + failedCount;

  const verificationPassRate =
    totalVerifications > 0
      ? ((passedCount / totalVerifications) * 100).toFixed(1)
      : "0.0";
  const verificationFailRate =
    totalVerifications > 0
      ? ((failedCount / totalVerifications) * 100).toFixed(1)
      : "0.0";

  return (
    <div className="animate-in fade-in space-y-6 duration-500">
      {/* Header Banner */}
      <div className="flex flex-col gap-4 border-b border-slate-200/80 pb-6 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
            Console Overview
          </h1>
          <p className="mt-1 max-w-2xl text-sm font-medium text-slate-600">
            Biometric verification metrics, activity timelines, and platform
            health.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Time range selector */}
          <div
            role="group"
            aria-label="Time range selector"
            className="flex items-center rounded-lg border border-slate-200 bg-slate-100/70 p-0.5 text-xs font-semibold text-slate-600"
          >
            {[7, 14, 30].map((days) => (
              <button
                key={days}
                type="button"
                aria-pressed={timeRange === days}
                onClick={() => setTimeRange(days)}
                className={`cursor-pointer rounded-md px-2.5 py-1 transition-all ${
                  timeRange === days
                    ? "bg-white font-bold text-slate-900 shadow-2xs"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                {days}D
              </button>
            ))}
          </div>

          <Link
            to="/api-keys"
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-bold text-slate-700 shadow-2xs transition-all hover:border-slate-300 hover:bg-slate-50"
          >
            <Key className="h-3.5 w-3.5 text-slate-400" />
            <span>API Keys</span>
          </Link>
          <Link
            to="/docs"
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-bold text-slate-700 shadow-2xs transition-all hover:border-slate-300 hover:bg-slate-50"
          >
            <span>Docs</span>
            <ArrowUpRight className="h-3.5 w-3.5 text-slate-400" />
          </Link>
        </div>
      </div>

      {/* Onboarding callout if 0 keys exist */}
      {!loading && apiKeysCount === 0 && (
        <div className="flex flex-col justify-between gap-3 rounded-xl border border-blue-200 bg-blue-50/60 p-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-xs font-bold text-blue-900">
              Next Step: Create an API Key
            </p>
            <p className="mt-0.5 text-xs text-blue-700">
              Generate your first API key to authenticate liveness checks from
              your web or mobile app.
            </p>
          </div>
          <Link
            to="/api-keys"
            className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-bold text-white shadow-xs transition-colors hover:bg-blue-700"
          >
            <span>Create API Key</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      )}

      {/* Primary KPI Metrics Grid (4 columns) */}
      {loading ? (
        <SkeletonTheme baseColor="#e2e8f0" highlightColor="#f8fafc">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-xs"
              >
                <Skeleton height={14} width={100} />
                <div className="mt-3 space-y-1">
                  <Skeleton height={28} width={70} />
                  <Skeleton height={12} width="75%" />
                </div>
              </div>
            ))}
          </div>
        </SkeletonTheme>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map((card) => (
            <div
              key={card.label}
              className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-xs transition-colors hover:border-slate-300"
            >
              <p className="text-xs font-semibold text-slate-500">
                {card.label}
              </p>
              <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                {card.value}
              </p>
              <p className="mt-1 text-xs text-slate-500">{card.description}</p>
            </div>
          ))}
        </div>
      )}

      {/* Row 2: Verification Activity Chart & Outcome Distribution Breakdown */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left 2 Cols: Verification Activity Histogram */}
        <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-xs lg:col-span-2">
          <div className="flex flex-col gap-3 border-b border-slate-100 pb-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="flex items-center gap-2 text-sm font-bold text-slate-900">
                <BarChart3 className="h-4 w-4 text-blue-600" />
                Verification Activity
              </h2>
              <p className="mt-0.5 text-xs text-slate-500">
                Daily challenge runs across the last {timeRange} days (
                {totalInTimeline} total: {passedInTimeline} passed,{" "}
                {failedInTimeline} failed, {enrolledInTimeline} enrolled)
              </p>
            </div>

            {/* Legend */}
            <div className="flex items-center gap-3 text-xs font-medium text-slate-600">
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                <span>Passed</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-rose-500" />
                <span>Failed</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-purple-500" />
                <span>Enrolled</span>
              </div>
            </div>
          </div>

          {/* Interactive Inspection Bar (Strict fixed height to prevent layout shift) */}
          <div className="flex h-9 items-center justify-between border-b border-slate-100 px-1 text-xs">
            {hoveredDay ? (
              <div className="flex items-center gap-3 overflow-hidden whitespace-nowrap">
                <span className="font-bold text-slate-900">
                  {hoveredDay.label}
                </span>
                <span className="text-slate-500">
                  Total:{" "}
                  <strong className="text-slate-800">{hoveredDay.total}</strong>
                </span>
                <span className="text-emerald-700">
                  Passed: <strong>{hoveredDay.passed}</strong>
                </span>
                {hoveredDay.failed > 0 && (
                  <span className="text-rose-700">
                    Failed: <strong>{hoveredDay.failed}</strong>
                  </span>
                )}
                {hoveredDay.enrolled > 0 && (
                  <span className="text-purple-700">
                    Enrolled: <strong>{hoveredDay.enrolled}</strong>
                  </span>
                )}
              </div>
            ) : (
              <span className="flex items-center gap-1.5 text-xs whitespace-nowrap text-slate-400">
                <Clock className="h-3.5 w-3.5 shrink-0" />
                <span>Hover over a bar to inspect specific day counts</span>
              </span>
            )}
          </div>

          {/* Chart Histogram */}
          {loading ? (
            <div className="flex h-44 items-end gap-1.5 pt-4">
              {Array.from({ length: timeRange }).map((_, i) => (
                <div
                  key={i}
                  className="h-full flex-1 animate-pulse rounded-t bg-slate-100"
                />
              ))}
            </div>
          ) : stats.timeline.length === 0 ? (
            <div className="flex h-44 flex-col items-center justify-center text-center">
              <p className="text-xs font-semibold text-slate-700">
                No activity recorded in this period
              </p>
              <p className="mt-1 text-xs text-slate-400">
                Verification checks submitted by your applications will graph
                here.
              </p>
            </div>
          ) : (
            <div className="pt-4" onMouseLeave={() => setHoveredDay(null)}>
              <div className="flex h-44 items-end">
                {stats.timeline.map((day, idx) => {
                  const isHovered = hoveredDay?.date === day.date;
                  const totalHeightPct =
                    day.total > 0
                      ? Math.max((day.total / maxDaily) * 100, 8)
                      : 0;

                  return (
                    <div
                      key={day.date || idx}
                      onMouseEnter={() => setHoveredDay(day)}
                      className={`flex h-full flex-1 cursor-pointer flex-col justify-end rounded-t px-0.5 transition-colors sm:px-1 ${
                        isHovered ? "bg-slate-100/80" : "hover:bg-slate-50"
                      }`}
                    >
                      {day.total > 0 ? (
                        <div
                          style={{ height: `${totalHeightPct}%` }}
                          className="flex w-full flex-col justify-end overflow-hidden rounded-t"
                        >
                          {/* Stacked segments: Enrolled on top, Failed in middle, Passed on bottom */}
                          {day.enrolled > 0 && (
                            <div
                              style={{
                                height: `${(day.enrolled / day.total) * 100}%`,
                              }}
                              className="w-full bg-purple-500"
                            />
                          )}
                          {day.failed > 0 && (
                            <div
                              style={{
                                height: `${(day.failed / day.total) * 100}%`,
                              }}
                              className="w-full bg-rose-500"
                            />
                          )}
                          {day.passed > 0 && (
                            <div
                              style={{
                                height: `${(day.passed / day.total) * 100}%`,
                              }}
                              className="w-full bg-emerald-500"
                            />
                          )}
                        </div>
                      ) : (
                        <div className="h-1 w-full rounded-xs bg-slate-200/70" />
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Day Labels Underneath */}
              <div className="mt-2 flex items-center justify-between border-t border-slate-100 pt-2 text-[10px] font-medium text-slate-400">
                {stats.timeline.map((day, idx) => {
                  // In 30D view, only show every 5th label to prevent clutter
                  const shouldShow =
                    timeRange === 7 ||
                    (timeRange === 14 && idx % 2 === 0) ||
                    (timeRange === 30 && idx % 5 === 0) ||
                    idx === stats.timeline.length - 1;

                  return (
                    <span
                      key={day.date || idx}
                      className={`text-center ${
                        shouldShow ? "opacity-100" : "opacity-0"
                      }`}
                      style={{ width: `${100 / stats.timeline.length}%` }}
                    >
                      {day.label}
                    </span>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right 1 Col: Verification Performance */}
        <div className="flex flex-col justify-between rounded-xl border border-slate-200/80 bg-white p-5 shadow-xs">
          <div>
            <div className="mb-4 border-b border-slate-100 pb-3.5">
              <h2 className="flex items-center gap-2 text-sm font-bold text-slate-900">
                <ShieldCheck className="h-4 w-4 text-blue-600" />
                Verification Performance
              </h2>
              <p className="mt-0.5 text-xs text-slate-500">
                Pass vs. reject accuracy on active challenges
              </p>
            </div>

            {/* Verification Pass / Reject Ratio Meter */}
            <div className="space-y-2">
              <div className="flex items-baseline justify-between text-xs">
                <span className="font-bold text-emerald-700">
                  {verificationPassRate}% Passed
                </span>
                <span className="font-semibold text-rose-700">
                  {verificationFailRate}% Rejected
                </span>
              </div>

              <div className="flex h-3 w-full overflow-hidden rounded-full bg-slate-100">
                {totalVerifications > 0 ? (
                  <>
                    <div
                      style={{ width: `${verificationPassRate}%` }}
                      className="bg-emerald-500 transition-all duration-300"
                    />
                    <div
                      style={{ width: `${verificationFailRate}%` }}
                      className="bg-rose-500 transition-all duration-300"
                    />
                  </>
                ) : (
                  <div className="w-full bg-slate-200/70" />
                )}
              </div>

              <p className="text-[11px] text-slate-400">
                {totalVerifications.toLocaleString()} total verification{" "}
                {totalVerifications === 1 ? "attempt" : "attempts"} evaluated
              </p>
            </div>

            {/* Detailed Row Items */}
            <div className="mt-5 space-y-3">
              <div className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50/60 p-3">
                <div className="flex items-center gap-2.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                  <div>
                    <p className="text-xs font-semibold text-slate-900">
                      Passed Checks
                    </p>
                    <p className="text-[10px] text-slate-500">
                      Matched identity & satisfied gesture
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-mono text-xs font-bold text-slate-900">
                    {passedCount.toLocaleString()}
                  </p>
                  <p className="text-[10px] font-semibold text-emerald-700">
                    {verificationPassRate}%
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50/60 p-3">
                <div className="flex items-center gap-2.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-rose-500" />
                  <div>
                    <p className="text-xs font-semibold text-slate-900">
                      Rejected Checks
                    </p>
                    <p className="text-[10px] text-slate-500">
                      Failed gesture or similarity mismatch
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-mono text-xs font-bold text-slate-900">
                    {failedCount.toLocaleString()}
                  </p>
                  <p className="text-[10px] font-semibold text-rose-700">
                    {verificationFailRate}%
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50/60 p-3">
                <div className="flex items-center gap-2.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-purple-500" />
                  <div>
                    <p className="text-xs font-semibold text-slate-900">
                      Enrolled Identities
                    </p>
                    <p className="text-[10px] text-slate-500">
                      Stored 128D facial descriptors
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-mono text-xs font-bold text-slate-900">
                    {(stats.totalUsers || 0).toLocaleString()}
                  </p>
                  <p className="text-[10px] font-semibold text-purple-700">
                    Registered
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Row 3: Recent Verifications Feed (Left) & Console Shortcuts + Status (Right) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left 2 Cols: Recent Verifications Feed */}
        <div className="space-y-6 lg:col-span-2">
          <div className="overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <div>
                <h2 className="text-sm font-bold text-slate-900">
                  Recent Verifications
                </h2>
                <p className="text-xs text-slate-500">
                  Live feed of incoming verification and enrollment requests
                </p>
              </div>
              <Link
                to="/logs"
                className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 transition-colors hover:text-blue-700"
              >
                <span>View all logs</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {loading ? (
              <SkeletonTheme baseColor="#e2e8f0" highlightColor="#f8fafc">
                <div className="space-y-3 p-5">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between border-b border-slate-100 pb-3 last:border-0"
                    >
                      <Skeleton height={20} width={80} borderRadius={6} />
                      <Skeleton height={14} width={120} />
                      <Skeleton height={14} width={60} />
                      <Skeleton height={14} width={70} />
                    </div>
                  ))}
                </div>
              </SkeletonTheme>
            ) : recentLogs.length === 0 ? (
              <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
                <p className="text-xs font-bold text-slate-700">
                  No verifications recorded yet
                </p>
                <p className="mt-1 max-w-sm text-xs text-slate-500">
                  When your web or mobile app runs liveness checks with your API
                  key, records will appear here in real time.
                </p>
                <div className="mt-4 flex items-center gap-3">
                  <Link
                    to="/docs"
                    className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700"
                  >
                    <span>Read SDK Setup Guide</span>
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/60 text-[10px] font-bold tracking-wider text-slate-500 uppercase">
                      <th className="px-5 py-3">Result</th>
                      <th className="px-5 py-3">Subject</th>
                      <th className="px-5 py-3">API Key</th>
                      <th className="px-5 py-3">Confidence</th>
                      <th className="px-5 py-3 text-right">Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {recentLogs.map((log) => (
                      <tr
                        key={log.id}
                        className="transition-colors hover:bg-slate-50/60"
                      >
                        <td className="px-5 py-3.5">
                          <span
                            className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase ${
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
                            {log.status === "SUCCESS"
                              ? "Passed"
                              : log.status === "ENROLLED"
                                ? "Enrolled"
                                : "Failed"}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2">
                            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-slate-200/60 bg-slate-50 text-slate-500">
                              <User className="h-3 w-3" />
                            </div>
                            <span className="truncate text-xs font-semibold text-slate-800">
                              {log.userName || "Anonymous"}
                            </span>
                          </div>
                        </td>
                        <td className="px-5 py-3.5">
                          {log.apiKeyName ? (
                            <span className="inline-flex items-center gap-1 text-xs text-slate-700">
                              <Key className="h-3 w-3 shrink-0 text-slate-400" />
                              <span className="max-w-[100px] truncate font-medium sm:max-w-[130px]">
                                {log.apiKeyName}
                              </span>
                            </span>
                          ) : (
                            <span className="text-xs text-slate-400">—</span>
                          )}
                        </td>
                        <td className="px-5 py-3.5 font-mono text-xs text-slate-600">
                          {log.score != null
                            ? `${(log.score * 100).toFixed(1)}%`
                            : "—"}
                        </td>
                        <td className="px-5 py-3.5 text-right font-mono text-xs text-slate-500">
                          {formatRelativeTime(log.timestamp)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Right 1 Col: Quick Actions & System Status */}
        <div className="space-y-6 lg:col-span-1">
          {/* Console Shortcuts */}
          <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-xs">
            <h2 className="mb-3.5 text-sm font-bold text-slate-900">
              Console Shortcuts
            </h2>
            <div className="divide-y divide-slate-100">
              {shortcuts.map((action) => (
                <Link
                  key={action.title}
                  to={action.to}
                  className="group flex items-center justify-between py-2.5 transition-colors first:pt-0 last:pb-0 hover:text-blue-600"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200/70 bg-slate-50 text-slate-500 transition-colors group-hover:border-blue-200 group-hover:bg-blue-50 group-hover:text-blue-600">
                      <action.icon className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-800 transition-colors group-hover:text-blue-600">
                        {action.title}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        {action.description}
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="h-3.5 w-3.5 text-slate-300 transition-transform group-hover:translate-x-0.5 group-hover:text-blue-600" />
                </Link>
              ))}
            </div>
          </div>

          {/* System Status */}
          <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-xs">
            <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="flex items-center gap-2 text-sm font-bold text-slate-900">
                <Server className="h-4 w-4 text-blue-600" />
                System Status
              </h2>
              <span className="font-mono text-[11px] font-semibold text-slate-500">
                {import.meta.env.MODE.toUpperCase()}
              </span>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50/70 p-3">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`h-2 w-2 rounded-full ${
                      systemStatus.api === "Operational"
                        ? "bg-emerald-500"
                        : "bg-rose-500"
                    }`}
                  />
                  <div>
                    <p className="text-xs font-semibold text-slate-900">
                      API Server
                    </p>
                    <p className="text-[10px] text-slate-500">
                      Node.js / Express
                    </p>
                  </div>
                </div>
                <span
                  className={`rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase ${
                    systemStatus.api === "Operational"
                      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                      : "border-rose-200 bg-rose-50 text-rose-700"
                  }`}
                >
                  {systemStatus.api}
                </span>
              </div>

              <div className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50/70 p-3">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`h-2 w-2 rounded-full ${
                      systemStatus.database === "Connected"
                        ? "bg-emerald-500"
                        : "bg-rose-500"
                    }`}
                  />
                  <div>
                    <p className="text-xs font-semibold text-slate-900">
                      Database
                    </p>
                    <p className="text-[10px] text-slate-500">PostgreSQL</p>
                  </div>
                </div>
                <span
                  className={`rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase ${
                    systemStatus.database === "Connected"
                      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                      : "border-rose-200 bg-rose-50 text-rose-700"
                  }`}
                >
                  {systemStatus.database}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
