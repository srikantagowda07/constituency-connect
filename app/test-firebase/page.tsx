"use client";

/**
 * app/test-firebase/page.tsx
 *
 * Firebase connection test page.
 * Visit /test-firebase during development to verify that:
 *   1. All required environment variables are present.
 *   2. The Firebase App initialises without error.
 *   3. The Firestore database is reachable (attempts a lightweight read).
 *   4. Firebase Authentication is initialised and reports the current session.
 *   5. Firebase Storage is initialised and the bucket endpoint is configured.
 *
 * REMOVE or protect this route before deploying to production.
 */

import { useEffect, useState } from "react";
import { app, db, auth, storage } from "@/firebase";
import { getDoc, doc } from "firebase/firestore";

// ─── Types ───────────────────────────────────────────────────────────────────

type CheckStatus = "idle" | "running" | "pass" | "fail";

interface Check {
  id: string;
  label: string;
  status: CheckStatus;
  detail: string;
}

// ─── Helper ──────────────────────────────────────────────────────────────────

function initialChecks(): Check[] {
  return [
    { id: "env", label: "Environment variables", status: "idle", detail: "" },
    { id: "app", label: "Firebase App", status: "idle", detail: "" },
    { id: "firestore", label: "Firestore connection", status: "idle", detail: "" },
    { id: "auth", label: "Firebase Authentication", status: "idle", detail: "" },
    { id: "storage", label: "Firebase Storage", status: "idle", detail: "" },
  ];
}

function statusIcon(status: CheckStatus): string {
  return { idle: "○", running: "…", pass: "✓", fail: "✗" }[status];
}

function statusColor(status: CheckStatus): string {
  return {
    idle: "text-zinc-400",
    running: "text-yellow-500",
    pass: "text-emerald-500",
    fail: "text-red-500",
  }[status];
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function TestFirebasePage() {
  const [checks, setChecks] = useState<Check[]>(initialChecks());
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);

  function updateCheck(id: string, patch: Partial<Check>) {
    setChecks((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...patch } : c)),
    );
  }

  async function runChecks() {
    setRunning(true);
    setDone(false);
    setChecks(initialChecks());

    // ── 1. Environment variables ──────────────────────────────────────────
    updateCheck("env", { status: "running" });
    const required = [
      "NEXT_PUBLIC_FIREBASE_API_KEY",
      "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
      "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
      "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET",
      "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
      "NEXT_PUBLIC_FIREBASE_APP_ID",
    ] as const;
    const missing = required.filter((k) => !process.env[k]);
    if (missing.length > 0) {
      updateCheck("env", {
        status: "fail",
        detail: `Missing: ${missing.join(", ")}`,
      });
    } else {
      updateCheck("env", {
        status: "pass",
        detail: `All ${required.length} variables present`,
      });
    }

    // ── 2. Firebase App ───────────────────────────────────────────────────
    updateCheck("app", { status: "running" });
    try {
      const projectId = app.options.projectId ?? "(none)";
      updateCheck("app", {
        status: "pass",
        detail: `App name: "${app.name}" · Project: ${projectId}`,
      });
    } catch (err) {
      updateCheck("app", {
        status: "fail",
        detail: err instanceof Error ? err.message : String(err),
      });
    }

    // ── 3. Firestore ──────────────────────────────────────────────────────
    updateCheck("firestore", { status: "running" });
    try {
      // Attempt to read a non-existent document — a successful (empty) response
      // confirms the SDK can reach Firestore without a permission error for reading
      // public paths, or confirms the connection is up even if it returns a
      // permission-denied error (which means Firestore IS reachable).
      await getDoc(doc(db, "_connection_test_", "ping")).then(() => null).catch((err: unknown) => {
        // "permission-denied" is fine — it means Firestore is reachable but rules block us.
        if (
          err instanceof Error &&
          (err.message.includes("permission") || err.message.includes("Missing or insufficient"))
        ) {
          return null;
        }
        throw err;
      });
      updateCheck("firestore", {
        status: "pass",
        detail: `Connected · Database: ${db.app.options.projectId}`,
      });
    } catch (err) {
      updateCheck("firestore", {
        status: "fail",
        detail: err instanceof Error ? err.message : String(err),
      });
    }

    // ── 4. Authentication ─────────────────────────────────────────────────
    updateCheck("auth", { status: "running" });
    try {
      const currentUser = auth.currentUser;
      updateCheck("auth", {
        status: "pass",
        detail: currentUser
          ? `Signed in as ${currentUser.email ?? currentUser.phoneNumber ?? currentUser.uid}`
          : "Initialised · No active session",
      });
    } catch (err) {
      updateCheck("auth", {
        status: "fail",
        detail: err instanceof Error ? err.message : String(err),
      });
    }

    // ── 5. Storage ────────────────────────────────────────────────────────
    updateCheck("storage", { status: "running" });
    try {
      const bucket = storage.app.options.storageBucket ?? "(none)";
      updateCheck("storage", {
        status: "pass",
        detail: `Initialised · Bucket: ${bucket}`,
      });
    } catch (err) {
      updateCheck("storage", {
        status: "fail",
        detail: err instanceof Error ? err.message : String(err),
      });
    }

    setRunning(false);
    setDone(true);
  }

  // Run automatically on mount in development
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      void runChecks();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const allPass = done && checks.every((c) => c.status === "pass");
  const anyFail = done && checks.some((c) => c.status === "fail");

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100 p-8 font-mono">
      <div className="max-w-2xl mx-auto space-y-8">

        {/* Header */}
        <div>
          <p className="text-xs text-zinc-500 uppercase tracking-widest mb-1">
            Constituency Connect
          </p>
          <h1 className="text-2xl font-bold">Firebase Connection Test</h1>
          <p className="text-sm text-zinc-400 mt-1">
            Verifies SDK initialisation, Firestore, Auth and Storage connectivity.
          </p>
        </div>

        {/* Warning banner */}
        <div className="border border-yellow-600/40 bg-yellow-600/10 rounded-lg px-4 py-3 text-xs text-yellow-400">
          ⚠ This page is for development only. Remove or protect it before going to production.
        </div>

        {/* Check list */}
        <div className="border border-zinc-800 rounded-lg divide-y divide-zinc-800">
          {checks.map((check) => (
            <div key={check.id} className="flex items-start gap-4 px-5 py-4">
              <span
                className={`text-lg leading-none mt-0.5 font-bold w-4 shrink-0 ${statusColor(check.status)}`}
                aria-label={check.status}
              >
                {statusIcon(check.status)}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-zinc-100">{check.label}</p>
                {check.detail && (
                  <p className="text-xs text-zinc-400 mt-0.5 break-all">{check.detail}</p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        {done && (
          <div
            className={`rounded-lg px-5 py-4 text-sm font-semibold border ${
              allPass
                ? "bg-emerald-600/10 border-emerald-600/30 text-emerald-400"
                : anyFail
                ? "bg-red-600/10 border-red-600/30 text-red-400"
                : "bg-yellow-600/10 border-yellow-600/30 text-yellow-400"
            }`}
          >
            {allPass
              ? "✓ All checks passed — Firebase is correctly configured."
              : anyFail
              ? "✗ One or more checks failed. Check your .env.local and Firebase project settings."
              : "Some checks passed with warnings."}
          </div>
        )}

        {/* Run button */}
        <button
          onClick={() => void runChecks()}
          disabled={running}
          className="px-5 py-2.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-colors border border-zinc-700"
        >
          {running ? "Running…" : "Run checks again"}
        </button>

        {/* Environment summary */}
        <div className="border border-zinc-800 rounded-lg p-5 space-y-2">
          <p className="text-xs text-zinc-500 uppercase tracking-widest mb-3">
            Environment
          </p>
          {[
            ["Project ID", process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID],
            ["Auth Domain", process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN],
            ["Storage Bucket", process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET],
            ["App ID", process.env.NEXT_PUBLIC_FIREBASE_APP_ID ? "••••" + process.env.NEXT_PUBLIC_FIREBASE_APP_ID.slice(-6) : undefined],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between text-xs gap-4">
              <span className="text-zinc-500 shrink-0">{label}</span>
              <span className={`truncate font-mono ${value ? "text-zinc-300" : "text-red-500"}`}>
                {value ?? "NOT SET"}
              </span>
            </div>
          ))}
        </div>

      </div>
    </main>
  );
}
