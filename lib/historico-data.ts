// ── Types ────────────────────────────────────────────────────────────────────

export interface TrimDatoEntidad {
  totalSO: number;
  s1: number;
  s2: number;
  s6: number;
  totalOIC: number;
  s3OIC: number;
  totalTJA: number;
  s3TJA: number;
}

export interface TrimData {
  id: string;
  label: string;
  entidades: Record<string, TrimDatoEntidad>;
}

export interface TrimConfig {
  trimestre: string;
  label: string;
  xlsxUrl: string;
  csvUrl: string;
}

// ── URL helpers ───────────────────────────────────────────────────────────────

// Google Sheets edit link → xlsx download link
export function toXlsxDownload(url: string): string {
  const m = url.match(/\/spreadsheets\/d\/([^/?]+)/);
  if (!m) return url;
  return `https://docs.google.com/spreadsheets/d/${m[1]}/export?format=xlsx`;
}

// Google Drive view link → direct download link
export function toCsvDownload(url: string): string {
  const m = url.match(/\/file\/d\/([^/?]+)/);
  if (!m) return url;
  return `https://drive.google.com/uc?export=download&id=${m[1]}`;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function n(v: string) {
  const x = parseInt(v, 10);
  return isNaN(x) ? 0 : x;
}

function padId(id: string) {
  return id.trim().padStart(2, "0");
}

function toLabel(id: string) {
  return id.replace(/^(\d+T)(\d{4})$/, "$1 $2");
}

async function fetchCsv(url: string | undefined, name: string): Promise<string> {
  if (!url) throw new Error(`Variable de entorno ${name} no configurada`);
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`Error ${res.status} al cargar ${name}`);
  return res.text();
}

// ── Sheet 1: resumen agregado (para gráficas) ─────────────────────────────────

export async function fetchHistoricoResumen(): Promise<TrimData[]> {
  const text = await fetchCsv(process.env.NEXT_PUBLIC_HISTORICO_RESUMEN_URL, "NEXT_PUBLIC_HISTORICO_RESUMEN_URL");
  const lines = text.trim().split("\n").slice(1);
  const map = new Map<string, TrimData>();

  for (const line of lines) {
    const [trimestre, entidadId, totalSO, s1, s2, s6, totalOIC, s3OIC, totalTJA, s3TJA] =
      line.split(",");
    const id = trimestre.trim();
    if (!map.has(id)) map.set(id, { id, label: toLabel(id), entidades: {} });
    map.get(id)!.entidades[padId(entidadId)] = {
      totalSO: n(totalSO), s1: n(s1), s2: n(s2), s6: n(s6),
      totalOIC: n(totalOIC), s3OIC: n(s3OIC), totalTJA: n(totalTJA), s3TJA: n(s3TJA),
    };
  }
  return Array.from(map.values());
}

// ── Sheet 2: config (URLs de descarga por trimestre) ─────────────────────────

export async function fetchHistoricoConfig(): Promise<TrimConfig[]> {
  const text = await fetchCsv(process.env.NEXT_PUBLIC_HISTORICO_CONFIG_URL, "NEXT_PUBLIC_HISTORICO_CONFIG_URL");
  const lines = text.trim().split("\n").slice(1);
  return lines
    .filter((l) => l.trim())
    .map((line) => {
      const [trimestre, label, xlsxUrl, csvUrl] = line.split(",");
      return {
        trimestre: trimestre.trim(),
        label: label.trim(),
        xlsxUrl: xlsxUrl?.trim() ?? "",
        csvUrl: csvUrl?.trim() ?? "",
      };
    });
}

