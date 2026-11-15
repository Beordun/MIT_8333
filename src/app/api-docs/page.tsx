"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, BookOpen } from "lucide-react";

interface OpenApiDoc {
  info: { title: string; version: string; description: string };
  paths: Record<string, Record<string, { summary: string; tags?: string[] }>>;
}

export default function ApiDocsPage() {
  const [spec, setSpec] = useState<OpenApiDoc | null>(null);

  useEffect(() => {
    fetch("/api/openapi")
      .then((res) => res.json())
      .then((data) => setSpec(data))
      .catch(() => null);
  }, []);

  return (
    <main className="min-h-screen px-4 py-6" style={{ backgroundColor: "var(--background-color)" }}>
      <div className="mx-auto max-w-4xl space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <BookOpen className="h-6 w-6" style={{ color: "var(--primary-color)" }} />
            <h1 className="font-bold" style={{ color: "var(--primary-color)", fontSize: "var(--font-size-2xl)" }}>
              MivaFix REST API Reference
            </h1>
          </div>
          <Link
            href="/"
            className="inline-flex min-h-[44px] items-center gap-1.5 px-3 font-medium border"
            style={{
              backgroundColor: "var(--surface-container-lowest-color)",
              borderColor: "var(--outline-variant-color)",
              borderRadius: "var(--radius-md)",
              fontSize: "var(--font-size-sm)",
            }}
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
        </div>

        {!spec ? (
          <p style={{ color: "var(--on-surface-variant-color)", fontSize: "var(--font-size-sm)" }}>
            Loading OpenAPI 3.0 specification...
          </p>
        ) : (
          <div className="space-y-3">
            <p style={{ color: "var(--on-surface-variant-color)", fontSize: "var(--font-size-sm)" }}>
              {spec.info.description} (OpenAPI v{spec.info.version})
            </p>
            {Object.entries(spec.paths).map(([path, methods]) => (
              <div
                key={path}
                className="space-y-2 border"
                style={{
                  backgroundColor: "var(--surface-container-lowest-color)",
                  borderColor: "var(--outline-variant-color)",
                  borderRadius: "var(--radius-lg)",
                  padding: "var(--spacing-4)",
                  boxShadow: "var(--elevation-1)",
                }}
              >
                <p className="font-semibold" style={{ color: "var(--on-surface-color)", fontSize: "var(--font-size-base)" }}>
                  <code>{path}</code>
                </p>
                <div className="space-y-1.5">
                  {Object.entries(methods).map(([method, meta]) => (
                    <div key={method} className="flex flex-wrap items-center gap-2.5">
                      <span
                        className="font-bold uppercase"
                        style={{
                          backgroundColor: "var(--primary-container-color)",
                          color: "var(--on-primary-container-color)",
                          padding: "2px 8px",
                          borderRadius: "var(--radius-sm)",
                          fontSize: "var(--font-size-xs)",
                        }}
                      >
                        {method}
                      </span>
                      <span style={{ color: "var(--on-surface-variant-color)", fontSize: "var(--font-size-sm)" }}>
                        {meta.summary}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

