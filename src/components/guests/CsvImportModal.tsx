"use client";

import { useState, useRef, useCallback } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X, Upload, ChevronRight, CheckCircle } from "lucide-react";
import Papa from "papaparse";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
};

type ParsedRow = Record<string, string>;

type ColumnMap = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  groupName: string;
  side: string;
};

const FIELD_LABELS: Record<keyof ColumnMap, string> = {
  firstName: "First Name",
  lastName: "Last Name",
  email: "Email",
  phone: "Phone",
  groupName: "Group Name",
  side: "Side",
};

function guessMapping(headers: string[]): Partial<ColumnMap> {
  const map: Partial<ColumnMap> = {};
  const normalized = headers.map((h) => h.toLowerCase().replace(/[\s_-]/g, ""));

  const checks: [keyof ColumnMap, string[]][] = [
    ["firstName", ["firstname", "first", "fname", "givenname"]],
    ["lastName", ["lastname", "last", "lname", "surname", "familyname"]],
    ["email", ["email", "emailaddress", "e-mail"]],
    ["phone", ["phone", "phonenumber", "mobile", "cell", "telephone"]],
    ["groupName", ["group", "groupname", "family", "familyname", "household"]],
    ["side", ["side", "guestside", "familyside"]],
  ];

  for (const [field, patterns] of checks) {
    for (let i = 0; i < normalized.length; i++) {
      if (patterns.some((p) => normalized[i].includes(p))) {
        map[field] = headers[i];
        break;
      }
    }
  }

  return map;
}

export function CsvImportModal({ open, onOpenChange, onSuccess }: Props) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [columnMap, setColumnMap] = useState<Partial<ColumnMap>>({});
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  function reset() {
    setStep(1);
    setRows([]);
    setHeaders([]);
    setColumnMap({});
    setProgress(null);
  }

  function parseFile(file: File) {
    Papa.parse<ParsedRow>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (result) => {
        const hdrs = result.meta.fields ?? [];
        setHeaders(hdrs);
        setRows(result.data);
        setColumnMap(guessMapping(hdrs));
        setStep(2);
      },
      error: () => toast.error("Could not parse CSV file."),
    });
  }

  function handleFile(file: File | undefined) {
    if (!file || !file.name.endsWith(".csv")) {
      toast.error("Please select a .csv file.");
      return;
    }
    parseFile(file);
  }

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    handleFile(e.dataTransfer.files[0]);
  }, []);

  type GroupEntry = { group: { name: string; side?: string }; members: Array<{ firstName: string; lastName?: string; email?: string; phone?: string }> };

  function buildGroups(): GroupEntry[] {
    const groupMap = new Map<string, GroupEntry>();

    for (const row of rows) {
      const firstName = columnMap.firstName ? row[columnMap.firstName]?.trim() : "";
      if (!firstName) continue;

      const lastName = columnMap.lastName ? row[columnMap.lastName]?.trim() : undefined;
      const email = columnMap.email ? row[columnMap.email]?.trim() : undefined;
      const phone = columnMap.phone ? row[columnMap.phone]?.trim() : undefined;
      const rawGroup = columnMap.groupName ? row[columnMap.groupName]?.trim() : "";
      const groupName = rawGroup || `${firstName}${lastName ? " " + lastName : ""}`;
      const side = columnMap.side ? row[columnMap.side]?.trim() : undefined;

      if (!groupMap.has(groupName)) {
        groupMap.set(groupName, { group: { name: groupName, side: side || undefined }, members: [] });
      }
      groupMap.get(groupName)!.members.push({ firstName, lastName: lastName || undefined, email: email || undefined, phone: phone || undefined });
    }

    return Array.from(groupMap.values());
  }

  const groups = step >= 2 ? buildGroups() : [];
  const guestCount = groups.reduce((s, g) => s + g.members.length, 0);

  async function handleImport() {
    setStep(3);
    setProgress({ done: 0, total: groups.length });

    let done = 0;
    const errors: string[] = [];

    for (const g of groups) {
      try {
        const res = await fetch("/api/guests", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(g),
        });
        if (!res.ok) errors.push(g.group.name);
      } catch {
        errors.push(g.group.name);
      }
      done++;
      setProgress({ done, total: groups.length });
    }

    if (errors.length === 0) {
      toast.success(`Imported ${guestCount} guests in ${groups.length} groups.`);
    } else {
      toast.error(`Imported with ${errors.length} errors.`);
    }

    onSuccess();
    onOpenChange(false);
    reset();
  }

  const previewRow = rows[0];

  return (
    <Dialog.Root open={open} onOpenChange={(v) => { if (!v) reset(); onOpenChange(v); }}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl p-6 focus:outline-none">
          <div className="flex items-center justify-between mb-5">
            <Dialog.Title className="font-serif text-xl font-semibold text-stone-900">
              Import from CSV
            </Dialog.Title>
            <Dialog.Close asChild>
              <button className="p-1.5 rounded-lg text-stone-400 hover:text-stone-600 hover:bg-stone-100 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </Dialog.Close>
          </div>

          {/* Steps indicator */}
          <div className="flex items-center gap-2 mb-6">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center gap-2">
                <div className={cn(
                  "w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium transition-colors",
                  step > s ? "bg-brand-500 text-white" : step === s ? "bg-brand-100 text-brand-700 border border-brand-300" : "bg-stone-100 text-stone-400"
                )}>
                  {step > s ? <CheckCircle className="w-3.5 h-3.5" /> : s}
                </div>
                <span className={cn("text-xs", step === s ? "text-stone-700 font-medium" : "text-stone-400")}>
                  {s === 1 ? "Upload" : s === 2 ? "Map columns" : "Import"}
                </span>
                {s < 3 && <ChevronRight className="w-3 h-3 text-stone-300" />}
              </div>
            ))}
          </div>

          {/* Step 1: File upload */}
          {step === 1 && (
            <div
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={onDrop}
              className={cn(
                "border-2 border-dashed rounded-xl p-12 text-center transition-colors cursor-pointer",
                dragging ? "border-brand-400 bg-brand-50" : "border-stone-200 hover:border-stone-300"
              )}
              onClick={() => fileRef.current?.click()}
            >
              <Upload className="w-10 h-10 text-stone-300 mx-auto mb-3" />
              <p className="text-stone-600 font-medium mb-1">Drop your CSV file here</p>
              <p className="text-stone-400 text-sm">or click to browse</p>
              <input
                ref={fileRef}
                type="file"
                accept=".csv"
                className="hidden"
                onChange={(e) => handleFile(e.target.files?.[0])}
              />
            </div>
          )}

          {/* Step 2: Column mapping */}
          {step === 2 && (
            <div className="space-y-5">
              <p className="text-sm text-stone-500">
                Found {rows.length} rows. Map your CSV columns to guest fields.
              </p>

              <div className="space-y-3">
                {(Object.keys(FIELD_LABELS) as (keyof ColumnMap)[]).map((field) => (
                  <div key={field} className="flex items-center gap-4">
                    <label className="w-32 text-sm text-stone-600 shrink-0">{FIELD_LABELS[field]}</label>
                    <select
                      className="input flex-1"
                      value={columnMap[field] ?? ""}
                      onChange={(e) => setColumnMap((m) => ({ ...m, [field]: e.target.value || undefined }))}
                    >
                      <option value="">-- not mapped --</option>
                      {headers.map((h) => (
                        <option key={h} value={h}>{h}</option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>

              {/* Preview */}
              {previewRow && (
                <div className="border border-stone-100 rounded-lg p-3 bg-stone-50">
                  <p className="text-xs text-stone-400 mb-2 font-medium">Preview (first row)</p>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-stone-600">
                    {(Object.keys(FIELD_LABELS) as (keyof ColumnMap)[]).map((field) => {
                      const val = columnMap[field] ? previewRow[columnMap[field]!] : null;
                      return val ? (
                        <div key={field}>
                          <span className="text-stone-400">{FIELD_LABELS[field]}: </span>
                          <span>{val}</span>
                        </div>
                      ) : null;
                    })}
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <button type="button" onClick={() => setStep(1)} className="btn-ghost flex-1">Back</button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  disabled={!columnMap.firstName}
                  className="btn-primary flex-[2]"
                >
                  Preview import
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Confirm */}
          {step === 3 && (
            <div className="space-y-5">
              {!progress ? (
                <>
                  <div className="card p-5 text-center">
                    <div className="text-3xl font-semibold text-stone-900 mb-1">{guestCount}</div>
                    <div className="text-stone-500 text-sm">guests in {groups.length} groups</div>
                  </div>

                  <div className="max-h-48 overflow-y-auto space-y-1">
                    {groups.slice(0, 20).map((g, i) => (
                      <div key={i} className="flex items-center justify-between text-sm px-2 py-1">
                        <span className="text-stone-700">{g.group.name}</span>
                        <span className="text-stone-400">{g.members.length} {g.members.length === 1 ? "person" : "people"}</span>
                      </div>
                    ))}
                    {groups.length > 20 && (
                      <p className="text-xs text-stone-400 text-center pt-1">...and {groups.length - 20} more groups</p>
                    )}
                  </div>

                  <div className="flex gap-3">
                    <button type="button" onClick={() => setStep(2)} className="btn-ghost flex-1">Back</button>
                    <button type="button" onClick={handleImport} className="btn-primary flex-[2]">
                      Import {guestCount} guests
                    </button>
                  </div>
                </>
              ) : (
                <div className="space-y-4">
                  <p className="text-center text-stone-600 text-sm">
                    Importing {progress.done} of {progress.total} groups...
                  </p>
                  <div className="w-full bg-stone-100 rounded-full h-2">
                    <div
                      className="bg-brand-500 h-2 rounded-full transition-all"
                      style={{ width: `${(progress.done / progress.total) * 100}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
