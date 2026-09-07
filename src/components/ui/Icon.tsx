import type { SVGProps } from 'react';

/**
 * The project's whole icon set.
 *
 * Inline SVG rather than an icon library: the brand uses a small, fixed set of
 * pictograms, and a dependency would add weight and a second visual language.
 * Every glyph is single-weight, 24×24, and inherits `currentColor`. CLAUDE.md §23.9.
 */

export type IconName =
  | 'plane'
  | 'pin'
  | 'calendar'
  | 'clock'
  | 'users'
  | 'wallet'
  | 'car'
  | 'sparkles'
  | 'shield'
  | 'headset'
  | 'check'
  | 'cross'
  | 'chevronDown'
  | 'arrow'
  | 'menu'
  | 'close'
  | 'globe'
  | 'phone'
  | 'mail'
  | 'info'
  | 'image'
  | 'trash'
  | 'plus'
  | 'search'
  | 'star'
  | 'whatsapp'
  | 'facebook'
  | 'instagram'
  | 'tiktok'
  | 'telegram'
  | 'youtube'
  | 'x';

type IconProps = SVGProps<SVGSVGElement> & {
  name: IconName;
  size?: number;
  /** Directional icons flip in RTL; decorative ones must not. */
  flipRtl?: boolean;
};

/**
 * Each glyph is a list of stroked sub-paths and/or filled sub-paths. Brand marks
 * need both (a stroked outline plus a solid detail), and a single-path icon set
 * cannot express that — which is how the WhatsApp mark first shipped unreadable.
 */
type Glyph = { stroke?: string[]; fill?: string[] };

const GLYPHS: Record<IconName, Glyph> = {
  /* --- interface ------------------------------------------------------- */
  plane: { stroke: ['M10.5 19.5 12 22l1.5-2.5M3 13.5 12 3l9 10.5-9-3.2-9 3.2Zm9-3.2V19'] },
  pin: {
    stroke: [
      'M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11Z',
      'M12 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z',
    ],
  },
  calendar: {
    stroke: ['M7 3v3M17 3v3M4 9h16M5 6h14a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1Z'],
  },
  clock: { stroke: ['M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z', 'M12 7.5V12l3 2'] },
  users: {
    stroke: [
      'M16 20v-1.5a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4V20M9 10.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z',
      'M22 20v-1.5a4 4 0 0 0-3-3.87M16 3.6a4 4 0 0 1 0 7.75',
    ],
  },
  wallet: {
    stroke: [
      'M3 8.5A2.5 2.5 0 0 1 5.5 6H18a2 2 0 0 1 2 2v1M3 8.5V18a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-2M3 8.5h13',
      'M16 13h5v3.5h-5a1.75 1.75 0 1 1 0-3.5Z',
    ],
  },
  car: {
    stroke: [
      'M5 17v2M19 17v2',
      'M3.5 17h17v-4l-1.7-4.4A2 2 0 0 0 16.9 7H7.1a2 2 0 0 0-1.9 1.6L3.5 13v4Z',
      'M3.5 13h17M7 15.5h1.5M15.5 15.5H17',
    ],
  },
  sparkles: {
    stroke: [
      'M12 3.5 13.6 8 18 9.6 13.6 11.2 12 15.6 10.4 11.2 6 9.6 10.4 8 12 3.5Z',
      'M18.5 15l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8.8-2.2Z',
    ],
  },
  shield: { stroke: ['M12 21s7-3.2 7-9V6.2L12 3.5 5 6.2V12c0 5.8 7 9 7 9Z', 'M9 12l2 2 4-4'] },
  headset: {
    stroke: [
      'M4 14v-2a8 8 0 1 1 16 0v2',
      'M4 14a2 2 0 0 1 2-2h1v6H6a2 2 0 0 1-2-2v-2ZM20 14a2 2 0 0 0-2-2h-1v6h1a2 2 0 0 0 2-2v-2Z',
      'M17 18v.5a2.5 2.5 0 0 1-2.5 2.5H12',
    ],
  },
  check: { stroke: ['m5 12.5 4.5 4.5L19 7'] },
  cross: { stroke: ['M6 6l12 12M18 6 6 18'] },
  chevronDown: { stroke: ['m6 9.5 6 6 6-6'] },
  arrow: { stroke: ['M4 12h15m-6-6 6 6-6 6'] },
  menu: { stroke: ['M4 7h16M4 12h16M4 17h16'] },
  close: { stroke: ['M6 6l12 12M18 6 6 18'] },
  globe: {
    stroke: [
      'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z',
      'M3.5 9h17M3.5 15h17M12 3a14 14 0 0 1 0 18 14 14 0 0 1 0-18Z',
    ],
  },
  phone: {
    stroke: [
      'M6.5 3.5h3l1.5 4-2 1.5a12 12 0 0 0 6 6l1.5-2 4 1.5v3a2 2 0 0 1-2.2 2A17 17 0 0 1 4.5 5.7 2 2 0 0 1 6.5 3.5Z',
    ],
  },
  mail: {
    stroke: ['M4 6h16a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1Z', 'm4.5 6.8 7.5 6.2 7.5-6.2'],
  },
  info: { stroke: ['M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z', 'M12 11v5M12 7.6v.5'] },
  image: {
    stroke: [
      'M4 5h16a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Z',
      'm3.5 17 5-5 3.5 3.5L15 12l5.5 5.5',
      'M8.5 10a1.2 1.2 0 1 0 0-2.4 1.2 1.2 0 0 0 0 2.4Z',
    ],
  },
  trash: { stroke: ['M4 7h16M9.5 7V5h5v2', 'M6.5 7l.8 12.1a1 1 0 0 0 1 .9h7.4a1 1 0 0 0 1-.9L17.5 7', 'M10 11v5M14 11v5'] },
  plus: { stroke: ['M12 5v14M5 12h14'] },
  search: { stroke: ['M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14Z', 'M16.2 16.2 21 21'] },
  star: { fill: ['M12 3.6l2.5 5.1 5.6.8-4 3.9 1 5.6-5.1-2.7-5 2.7 1-5.6-4.1-3.9 5.6-.8L12 3.6Z'] },

  /* --- brand marks ----------------------------------------------------- */
  whatsapp: {
    stroke: [
      'M20.6 11.8a8.6 8.6 0 0 1-12.8 7.5L3.4 20.6l1.4-4.3A8.6 8.6 0 1 1 20.6 11.8Z',
      'M9.6 8.6h1.1l.9 2.2-1 .9a7 7 0 0 0 2.7 2.7l.9-1 2.2.9v1.1c0 .6-.5 1.1-1.2 1.1A8.9 8.9 0 0 1 8.5 9.8c0-.7.5-1.2 1.1-1.2Z',
    ],
  },
  facebook: {
    fill: [
      'M13.2 20.5v-7.6h2.6l.5-3h-3.1V8.1c0-.9.3-1.5 1.5-1.5h1.7V3.9a19 19 0 0 0-2.4-.1c-2.4 0-4 1.5-4 4.1v2.1H7.3v3h2.7v7.5h3.2Z',
    ],
  },
  instagram: {
    stroke: [
      'M7.6 3.5h8.8a4.1 4.1 0 0 1 4.1 4.1v8.8a4.1 4.1 0 0 1-4.1 4.1H7.6a4.1 4.1 0 0 1-4.1-4.1V7.6a4.1 4.1 0 0 1 4.1-4.1Z',
      'M12 8.2a3.8 3.8 0 1 1 0 7.6 3.8 3.8 0 0 1 0-7.6Z',
    ],
    fill: ['M17 6.05a1.15 1.15 0 1 1 0 2.3 1.15 1.15 0 0 1 0-2.3Z'],
  },
  tiktok: { stroke: ['M15.4 3.5v10.1a3.7 3.7 0 1 1-3-3.63', 'M15.4 3.5a5 5 0 0 0 4.6 4.6'] },
  telegram: { stroke: ['M21.4 4.6 2.9 11.4l5.6 2 2 6 3-3.3 4.4 3.2 3.5-14.7Z', 'M8.5 13.4 21.4 4.6l-9.9 11.5'] },
  youtube: {
    stroke: ['M3 8.4a2.6 2.6 0 0 1 2.6-2.6h12.8A2.6 2.6 0 0 1 21 8.4v7.2a2.6 2.6 0 0 1-2.6 2.6H5.6A2.6 2.6 0 0 1 3 15.6V8.4Z', 'm10.3 9.2 5 2.8-5 2.8V9.2Z'],
  },
  x: { stroke: ['M4 4 20 20', 'M20 4 4 20'] },
};

export function Icon({ name, size = 20, flipRtl = false, className, ...rest }: IconProps) {
  const glyph = GLYPHS[name];

  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      aria-hidden="true"
      focusable="false"
      className={flipRtl ? `rtl:-scale-x-100 ${className ?? ''}` : className}
      {...rest}
    >
      {glyph.stroke?.map((d, index) => (
        <path
          key={`s${index}`}
          d={d}
          fill="none"
          stroke="currentColor"
          strokeWidth={1.6}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ))}

      {glyph.fill?.map((d, index) => (
        <path key={`f${index}`} d={d} fill="currentColor" />
      ))}
    </svg>
  );
}
