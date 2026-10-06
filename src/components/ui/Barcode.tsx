import { cn } from '@/lib/utils';

// ===========================================
// Code 128 (set B)
// ===========================================

// Bar and space widths for each Code 128 symbol, in modules. Index 104 is
// Start B and 106 is Stop. Every symbol is 11 modules wide; Stop is 13.
const PATTERNS = (
  '212222 222122 222221 121223 121322 131222 122213 122312 132212 221213 ' +
  '221312 231212 112232 122132 122231 113222 123122 123221 223211 221132 ' +
  '221231 213212 223112 312131 311222 321122 321221 312212 322112 322211 ' +
  '212123 212321 232121 111323 131123 131321 112313 132113 132311 211313 ' +
  '231113 231311 112133 112331 132131 113123 113321 133121 313121 211331 ' +
  '231131 213113 213311 213131 311123 311321 331121 312113 312311 332111 ' +
  '314111 221411 431111 111224 111422 121124 121421 141122 141221 112214 ' +
  '112412 122114 122411 142112 142211 241211 221114 413111 241112 134111 ' +
  '111242 121142 121241 114212 124112 124211 411212 421112 421211 212141 ' +
  '214121 412121 111143 111341 131141 114113 114311 411113 411311 113141 ' +
  '114131 311141 411131 211412 211214 211232 2331112'
).split(' ');

const START_B = 104;
const STOP = 106;
// Scanners need a light margin either side of the bars.
const QUIET_ZONE = 10;

/**
 * The modules of a Code 128 barcode for `text`, quiet zones included:
 * true is a dark bar. Returns null if `text` has a character set B cannot
 * encode (anything outside printable ASCII).
 */
export function code128Modules(text: string): boolean[] | null {
  const values = Array.from(text, (ch) => ch.charCodeAt(0) - 32);
  if (values.some((v) => v < 0 || v > 94)) return null;

  const checksum = (START_B + values.reduce((sum, v, i) => sum + (i + 1) * v, 0)) % 103;
  const modules: boolean[] = Array(QUIET_ZONE).fill(false);
  for (const symbol of [START_B, ...values, checksum, STOP]) {
    let dark = true;
    for (const width of PATTERNS[symbol]) {
      for (let i = 0; i < Number(width); i++) modules.push(dark);
      dark = !dark;
    }
  }
  return modules.concat(Array(QUIET_ZONE).fill(false));
}

interface BarcodeProps {
  /** What the barcode reads as when scanned. */
  value: string;
  height?: number;
  className?: string;
}

/**
 * A real, scannable Code 128 barcode. It is drawn at exactly one CSS pixel per
 * module: scanners misread bars that land between pixels, and at this size it
 * decodes on standard and high-density screens alike.
 */
export function Barcode({ value, height = 22, className }: BarcodeProps) {
  const modules = code128Modules(value);
  if (!modules) return null;

  // One rect per run of dark modules keeps the SVG small.
  const bars: { x: number; w: number }[] = [];
  modules.forEach((dark, x) => {
    if (!dark) return;
    const last = bars[bars.length - 1];
    if (last && last.x + last.w === x) last.w += 1;
    else bars.push({ x, w: 1 });
  });

  return (
    <svg
      role="img"
      aria-label={`Barcode reading ${value}`}
      width={modules.length}
      height={height}
      viewBox={`0 0 ${modules.length} ${height}`}
      shapeRendering="crispEdges"
      className={cn('block shrink-0', className)}
    >
      <rect width={modules.length} height={height} fill="#FFFFFF" />
      {bars.map((bar) => (
        <rect key={bar.x} x={bar.x} width={bar.w} height={height} fill="#101012" />
      ))}
    </svg>
  );
}

export default Barcode;
