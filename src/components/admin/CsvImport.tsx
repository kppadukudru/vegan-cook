import { useMemo, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import Papa from "papaparse";
import { adminImportRecipes } from "@/lib/admin.functions";
import {
  CSV_COLUMNS,
  CSV_OPTIONAL,
  CSV_REQUIRED,
  MAX_IMPORT_ROWS,
  normalizeCsvRow,
  templateCsv,
  type ImportRowResult,
  type ParsedRow,
} from "@/lib/csv-import";

const inputClass =
  "w-full border border-steel bg-paper px-3 py-2.5 text-sm focus:border-ink outline-none";

export function CsvImport({ onImported }: { onImported: () => Promise<void> | void }) {
  const importRecipes = useServerFn(adminImportRecipes);
  const fileRef = useRef<HTMLInputElement>(null);

  const [text, setText] = useState("");
  const [rows, setRows] = useState<ParsedRow[] | null>(null);
  const [publish, setPublish] = useState(false);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [problem, setProblem] = useState("");
  const [results, setResults] = useState<ImportRowResult[] | null>(null);

  const valid = useMemo(() => (rows ?? []).filter((r) => r.value), [rows]);
  const invalid = useMemo(() => (rows ?? []).filter((r) => !r.value), [rows]);

  const parse = (csv: string) => {
    setNotice("");
    setProblem("");
    setResults(null);
    const trimmed = csv.trim();
    if (!trimmed) {
      setRows(null);
      setProblem("There is nothing to read yet. Choose a file or paste some CSV.");
      return;
    }
    const out = Papa.parse<Record<string, string>>(trimmed, {
      header: true,
      skipEmptyLines: "greedy",
      transformHeader: (h) => h.trim().toLowerCase().replace(/\s+/g, "_"),
    });
    const headers = (out.meta.fields ?? []).filter(Boolean);
    const missing = CSV_REQUIRED.filter((c) => !headers.includes(c));
    if (missing.length > 0) {
      setRows(null);
      setProblem(`Missing required column${missing.length === 1 ? "" : "s"}: ${missing.join(", ")}.`);
      return;
    }
    const parsedRows = out.data
      .slice(0, MAX_IMPORT_ROWS)
      .map((raw, i) => normalizeCsvRow(raw, i + 2));
    setRows(parsedRows);
    if (out.data.length > MAX_IMPORT_ROWS) {
      setNotice(`Only the first ${MAX_IMPORT_ROWS} rows were read. Split larger files.`);
    }
  };

  const onFile = async (file: File) => {
    const content = await file.text();
    setText(content);
    parse(content);
  };

  const downloadTemplate = () => {
    const blob = new Blob([templateCsv()], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "vegan-cook-recipe-template.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const runImport = async () => {
    if (valid.length === 0) return;
    setBusy(true);
    setNotice("");
    setProblem("");
    try {
      const out = await importRecipes({
        data: { rows: valid.map((r) => r.value!), publish },
      });
      setResults(out.results);
      if (out.ok) {
        setNotice(out.message);
        setRows(null);
        setText("");
        if (fileRef.current) fileRef.current.value = "";
        await onImported();
      } else {
        setProblem(out.message);
      }
    } catch (error) {
      setProblem(error instanceof Error ? error.message : "The import failed.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="space-y-8">
      <div className="space-y-3">
        <h2 className="font-serif text-2xl tracking-tight">Import a spreadsheet</h2>
        <p className="text-sm text-mute leading-relaxed max-w-[68ch]">
          Rows are checked against the same rules as the editor, non-vegan ingredients are blocked,
          and everything lands as a draft unless you say otherwise. Up to {MAX_IMPORT_ROWS} rows per
          file.
        </p>
        <p className="text-xs text-mute leading-relaxed max-w-[68ch]">
          <span className="uppercase tracking-[0.15em] text-[10px]">Required</span>{" "}
          {CSV_REQUIRED.join(", ")}
          <br />
          <span className="uppercase tracking-[0.15em] text-[10px]">Optional</span>{" "}
          {CSV_OPTIONAL.join(", ")}
        </p>
        <button
          onClick={downloadTemplate}
          className="border border-ink px-4 py-2.5 text-[10px] uppercase tracking-[0.15em] hover:bg-ink hover:text-paper transition-colors"
        >
          Download template
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="block space-y-2">
          <span className="text-[10px] uppercase tracking-[0.15em] text-mute">CSV file</span>
          <input
            ref={fileRef}
            type="file"
            accept=".csv,text/csv"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void onFile(file);
            }}
            className={inputClass}
          />
        </label>
        <label className="block space-y-2">
          <span className="text-[10px] uppercase tracking-[0.15em] text-mute">
            Or paste CSV text
          </span>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={4}
            className={`${inputClass} font-mono text-xs`}
            placeholder={CSV_COLUMNS.slice(0, 7).join(",")}
          />
        </label>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <button
          onClick={() => parse(text)}
          className="border border-ink px-4 py-2.5 text-[10px] uppercase tracking-[0.15em] hover:bg-ink hover:text-paper transition-colors"
        >
          Check rows
        </button>
        <label className="flex items-center gap-2 text-xs text-mute">
          <input
            type="checkbox"
            checked={publish}
            onChange={(e) => setPublish(e.target.checked)}
          />
          Publish immediately instead of importing as drafts
        </label>
      </div>

      {notice && <p className="border border-leaf/40 bg-secondary px-4 py-3 text-sm">{notice}</p>}
      {problem && (
        <p className="border border-destructive/40 px-4 py-3 text-sm text-destructive">{problem}</p>
      )}

      {rows && (
        <div className="space-y-4">
          <p className="text-[10px] uppercase tracking-[0.15em] text-mute">
            {valid.length} ready / {invalid.length} with problems
          </p>
          <ul className="border border-steel divide-y divide-steel">
            {rows.map((r) => (
              <li key={r.line} className="p-4 space-y-1">
                <p className="text-sm">
                  <span className="text-mute">Row {r.line}</span>: {r.title}
                  {r.value && (
                    <span className="text-[10px] uppercase tracking-[0.15em] text-leaf ml-2">
                      ready / {r.value.id}
                    </span>
                  )}
                </p>
                {r.problems.length > 0 && (
                  <ul className="text-xs text-destructive space-y-0.5">
                    {r.problems.map((p, i) => (
                      <li key={i}>{p}</li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
          <button
            disabled={busy || valid.length === 0}
            onClick={() => void runImport()}
            className="bg-ink text-paper px-5 py-3 text-[10px] uppercase tracking-[0.15em] hover:bg-leaf transition-colors disabled:opacity-50"
          >
            {busy ? "Importing…" : `Import ${valid.length} recipe${valid.length === 1 ? "" : "s"}`}
          </button>
        </div>
      )}

      {results && results.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-[10px] uppercase tracking-[0.15em] text-mute">Import result</h3>
          <ul className="border border-steel divide-y divide-steel">
            {results.map((r, i) => (
              <li key={`${r.id}-${i}`} className="p-3 text-sm flex flex-wrap gap-2 justify-between">
                <span>{r.title}</span>
                <span
                  className={`text-[10px] uppercase tracking-[0.15em] ${
                    r.outcome === "skipped" ? "text-destructive" : "text-leaf"
                  }`}
                >
                  {r.outcome}
                  {r.message ? `: ${r.message}` : ""}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
