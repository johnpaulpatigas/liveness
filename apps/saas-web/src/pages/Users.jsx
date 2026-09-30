import {
  AlertTriangle,
  Calendar,
  CheckCircle2,
  Fingerprint,
  Key,
  Search,
  ShieldCheck,
  Trash2,
  User,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { api } from "../services/api";

export default function Users() {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [confirmInput, setConfirmInput] = useState("");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await api.users.list();
      setUsers(data);
    } catch (error) {
      console.error("Failed to fetch users", error);
    } finally {
      setLoading(false);
    }
  };

  const closeDeleteModal = () => {
    setDeleteTarget(null);
    setConfirmInput("");
  };

  const confirmDelete = async (e) => {
    e.preventDefault();
    if (!deleteTarget || confirmInput !== deleteTarget.name) return;
    try {
      await api.users.delete(deleteTarget.id);
      closeDeleteModal();
      fetchUsers();
    } catch (error) {
      console.error("Failed to delete user", error);
    }
  };

  const filteredUsers = users.filter((user) => {
    const term = searchTerm.toLowerCase();
    return (
      user.name.toLowerCase().includes(term) ||
      user.id.toString().toLowerCase().includes(term) ||
      (user.apiKeyName && user.apiKeyName.toLowerCase().includes(term)) ||
      (user.apiKeyMasked && user.apiKeyMasked.toLowerCase().includes(term))
    );
  });

  return (
    <div className="animate-in fade-in space-y-6 duration-500">
      {/* Header Banner */}
      <div className="flex flex-col gap-4 border-b border-slate-200/80 pb-6 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
            User Directory
          </h1>
          <p className="mt-1 text-sm font-medium text-slate-600">
            View and manage enrolled user profiles and biometric vectors.
          </p>
        </div>

        <div className="relative w-full md:w-72">
          <Search className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 shrink-0 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search identity or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white py-2 pr-4 pl-10 text-xs font-bold text-slate-900 shadow-2xs transition-all placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 focus:outline-none"
          />
        </div>
      </div>

      {/* Directory Table */}
      {loading ? (
        <SkeletonTheme baseColor="#e2e8f0" highlightColor="#f8fafc">
          <div className="overflow-hidden rounded-xl border border-slate-200/80 bg-white p-4 shadow-xs">
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between border-b border-slate-100 py-2 last:border-0"
                >
                  <div className="flex w-1/3 items-center gap-3">
                    <Skeleton circle height={36} width={36} />
                    <div className="w-full space-y-1">
                      <Skeleton height={14} width="70%" />
                      <Skeleton height={10} width="40%" />
                    </div>
                  </div>
                  <Skeleton height={16} width={120} />
                  <Skeleton height={16} width={100} />
                </div>
              ))}
            </div>
          </div>
        </SkeletonTheme>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50 text-[10px] font-bold tracking-wider text-slate-500 uppercase">
                  <th className="px-6 py-3.5">Enrolled Subject</th>
                  <th className="px-6 py-3.5">Identity ID</th>
                  <th className="px-6 py-3.5">Origin API Key</th>
                  <th className="px-6 py-3.5">Enrolled Date</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((user) => (
                  <tr
                    key={user.id}
                    className="group transition-colors hover:bg-slate-50/70"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-xs font-black text-white shadow-xs">
                          {user.name.charAt(0)}
                        </div>
                        <div className="ml-3.5">
                          <span className="block text-xs font-bold text-slate-900 transition-colors group-hover:text-blue-600 sm:text-sm">
                            {user.name}
                          </span>
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 uppercase">
                            <ShieldCheck className="h-3 w-3" />
                            Verified
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex w-fit items-center gap-2 rounded-md border border-slate-200/60 bg-slate-50 px-2.5 py-1 font-mono text-xs font-bold text-slate-600">
                        <Fingerprint className="h-3.5 w-3.5 text-slate-400" />
                        {user.id}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {user.apiKeyName ? (
                        <div className="flex items-center gap-1.5">
                          <Key className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                          <div>
                            <p className="text-xs font-semibold text-slate-800">
                              {user.apiKeyName}
                            </p>
                            {user.apiKeyMasked && (
                              <p className="font-mono text-[10px] text-slate-400">
                                {user.apiKeyMasked}
                              </p>
                            )}
                          </div>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
                        <Calendar className="h-3.5 w-3.5 text-slate-400" />
                        {new Date(user.enrolledAt).toLocaleDateString(
                          undefined,
                          {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          },
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => {
                          setDeleteTarget(user);
                          setConfirmInput("");
                        }}
                        className="cursor-pointer rounded-md p-1.5 text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600"
                        title="Delete identity"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan="5" className="px-6 py-14 text-center">
                      <div className="flex flex-col items-center">
                        <User className="mb-3 h-8 w-8 text-slate-300" />
                        <p className="text-xs font-extrabold tracking-widest text-slate-500 uppercase">
                          No enrolled identities found
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

      {/* Clean Modern Alert Delete Modal (React Portal) */}
      {deleteTarget &&
        createPortal(
          <div className="animate-in fade-in fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm duration-200">
            <div
              className="fixed inset-0 cursor-pointer"
              onClick={closeDeleteModal}
            />
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="delete-identity-modal-title"
              className="animate-in zoom-in-95 relative z-10 w-full max-w-md overflow-hidden rounded-2xl border border-rose-100 bg-white shadow-2xl duration-200"
            >
              {/* Prominent Red Accent Top Banner */}
              <div className="h-1.5 w-full bg-linear-to-r from-rose-500 via-red-500 to-rose-600" />

              <div className="p-6">
                {/* Modal Header */}
                <div className="mb-5 flex items-start justify-between">
                  <div className="flex items-center gap-3.5">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-rose-200/80 bg-rose-50 text-rose-600 shadow-xs">
                      <AlertTriangle className="h-6 w-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2
                          id="delete-identity-modal-title"
                          className="text-base font-black tracking-tight text-slate-900"
                        >
                          Delete Identity Profile
                        </h2>
                        <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[9px] font-black text-rose-700 uppercase">
                          Destructive
                        </span>
                      </div>
                      <p className="mt-0.5 text-xs font-semibold text-slate-500">
                        Typed verification required to proceed
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={closeDeleteModal}
                    className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-xl bg-slate-100 text-slate-400 transition-colors hover:bg-slate-200 hover:text-slate-700"
                    aria-label="Close modal"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <form onSubmit={confirmDelete} className="flex flex-col gap-4">
                  <div className="space-y-1.5 rounded-xl border border-rose-200/60 bg-rose-50/70 p-4 text-xs">
                    <p className="leading-relaxed font-bold text-slate-800">
                      You are about to delete enrolled biometric identity for{" "}
                      <span className="font-black text-slate-950 underline decoration-rose-400 decoration-2">
                        {deleteTarget.name}
                      </span>
                      .
                    </p>
                    <p className="font-mono text-[11px] text-slate-500">
                      Identity ID: {deleteTarget.id}
                    </p>
                    <div className="flex items-center gap-1.5 pt-1 text-[11px] font-extrabold text-rose-600">
                      <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                      This action cannot be undone or reverted.
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="delete-identity-input"
                      className="mb-2 block text-xs font-extrabold text-slate-700"
                    >
                      To confirm, type{" "}
                      <span className="rounded-md border border-slate-200 bg-slate-100 px-2 py-0.5 font-mono font-bold text-slate-900 select-all">
                        {deleteTarget.name}
                      </span>{" "}
                      below:
                    </label>
                    <div className="relative">
                      <input
                        id="delete-identity-input"
                        type="text"
                        value={confirmInput}
                        onChange={(e) => setConfirmInput(e.target.value)}
                        placeholder={`Type "${deleteTarget.name}" to verify`}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-xs font-bold text-slate-900 shadow-2xs transition-all placeholder:text-slate-400 focus:border-rose-500 focus:bg-white focus:ring-4 focus:ring-rose-500/10 focus:outline-none"
                        autoFocus
                      />
                      {confirmInput === deleteTarget.name && (
                        <CheckCircle2 className="animate-in zoom-in-50 absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-emerald-500 duration-150" />
                      )}
                    </div>
                  </div>

                  <div className="mt-2 flex items-center justify-end gap-2.5 border-t border-slate-100 pt-4">
                    <button
                      type="button"
                      onClick={closeDeleteModal}
                      className="cursor-pointer rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-extrabold text-slate-600 transition-all hover:border-slate-300 hover:bg-slate-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={confirmInput !== deleteTarget.name}
                      className={`rounded-xl px-5 py-2.5 text-xs font-semibold text-white shadow-xs transition-colors ${
                        confirmInput === deleteTarget.name
                          ? "cursor-pointer bg-rose-600 hover:bg-rose-700"
                          : "cursor-not-allowed bg-slate-300 opacity-60 shadow-none"
                      }`}
                    >
                      Confirm Permanent Delete
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}
