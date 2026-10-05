/**
 * ==============================================================================
 * CENTRAL COLOR & THEME COMBINATION CONTROLLER (color.js)
 * ==============================================================================
 * 
 * Changing the combination here reflects across the entire project!
 * 
 * How to use in any component:
 * ------------------------------------------------------------------------------
 *   import { COLOR, bg, border, shadow, text, button, badge, card } from '@/theme/color';
 *   // or
 *   import { COLOR } from '@/color';
 * 
 *   // Example in JSX:
 *   <div className={`${bg.card} ${border.default} ${shadow.card} ${text.primary}`}>
 *     <h2 className={text.heading}>Title</h2>
 *     <button className={button.primary}>Save</button>
 *     <span className={badge.primary}>Status</span>
 *   </div>
 * 
 * To switch combinations:
 * ------------------------------------------------------------------------------
 * Change `ACTIVE_COMBINATION` below to:
 * - 'warmOrange'   (Warm Sunset Obsidian — Default)
 * - 'emerald'      (Emerald Forest & Mint)
 * - 'royalIndigo'  (Royal Indigo & Violet)
 * - 'oceanBlue'    (Ocean Azure & Sky)
 * - 'crimsonRose'  (Crimson Velvet & Rose)
 * - 'goldenAmber'  (Golden Amber & Honey)
 * - 'modernSlate'  (Sleek Monochrome / Zinc)
 * 
 * Or customize any individual color property in `COMBINATIONS`!
 * ==============================================================================
 */

export const ACTIVE_COMBINATION = 'warmOrange';

export const COMBINATIONS = {
  // ── 1. Warm Sunset Obsidian (Current Default) ─────────────────────────────
  warmOrange: {
    id: 'warmOrange',
    name: 'Warm Sunset Obsidian',
    raw: {
      primary: '#f97316',
      primaryHover: '#ea580c',
      accent: '#f59e0b',
      bgLight: '#faf7f2',
      bgDark: '#121214',
      cardLight: '#ffffff',
      cardDark: '#1c1b1a',
      cardDarkElevated: '#242322',
      borderLight: '#efe8dd',
      borderLightSoft: '#f5efeb',
      borderDark: '#2e2c2a',
      borderDarkSoft: '#262423',
      textLight: '#1c1917',
      textLightSecondary: '#78716c',
      textLightMuted: '#a8a29e',
      textDark: '#faf7f2',
      textDarkSecondary: '#d6cfc4',
      textDarkMuted: '#78716c',
      gradient: 'linear-gradient(135deg, #ff7a1a 0%, #f95700 100%)',
      shadowGlow: 'rgba(249, 115, 22, 0.25)',
    },
    bg: {
      page: 'bg-[#faf7f2] dark:bg-[#121214]',
      card: 'bg-white dark:bg-[#1c1b1a]',
      cardElevated: 'bg-white dark:bg-[#242322]',
      cardInteractive: 'bg-white dark:bg-[#1c1b1a] hover:bg-[#faf7f2] dark:hover:bg-[#242220]',
      surface: 'bg-[#f5efeb] dark:bg-[#242220]',
      surfaceSubtle: 'bg-[#faf7f2]/70 dark:bg-[#1c1b1a]/70',
      header: 'bg-white/95 dark:bg-[#181716]/95 backdrop-blur-md',
      sidebar: 'bg-white dark:bg-[#181716]',
      input: 'bg-[#f7f4ee] dark:bg-[#242220]',
      hover: 'hover:bg-[#f5efeb] dark:hover:bg-[#262423]',
      active: 'bg-orange-500/10 dark:bg-orange-500/20',
      brand: 'bg-orange-500',
      brandHover: 'hover:bg-orange-600',
      brandGradient: 'bg-gradient-to-r from-orange-500 to-amber-500',
      brandSubtle: 'bg-orange-500/10 text-orange-600 dark:bg-orange-500/15 dark:text-orange-400',
      glass: 'bg-white/85 dark:bg-[#1c1b1a]/85 backdrop-blur-md',
    },
    border: {
      default: 'border-[#efe8dd] dark:border-[#2e2c2a]',
      subtle: 'border-[#f5efeb] dark:border-[#262423]',
      strong: 'border-[#d6cfc4] dark:border-[#3f3c39]',
      focus: 'focus:border-orange-500 focus:ring-2 focus:ring-orange-500/25',
      brand: 'border-orange-500/30 dark:border-orange-500/40',
      brandActive: 'border-orange-500',
      glass: 'border-[#efe8dd]/80 dark:border-white/10',
      divider: 'divide-[#efe8dd] dark:divide-[#2e2c2a]',
      hover: 'hover:border-orange-400 dark:hover:border-orange-500/50',
    },
    shadow: {
      none: 'shadow-none',
      xs: 'shadow-2xs dark:shadow-none',
      sm: 'shadow-xs dark:shadow-black/20',
      md: 'shadow-md dark:shadow-black/40',
      lg: 'shadow-lg dark:shadow-black/50',
      xl: 'shadow-xl dark:shadow-black/60',
      card: 'shadow-xs hover:shadow-md transition-shadow dark:shadow-black/40',
      cardHover: 'hover:shadow-lg dark:hover:shadow-black/50 transition-shadow',
      brand: 'shadow-lg shadow-orange-500/20 dark:shadow-orange-500/10',
      brandGlow: 'shadow-[0_0_20px_rgba(249,115,22,0.35)]',
      glass: 'shadow-[0_8px_32px_0_rgba(234,88,12,0.06)] dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.5)]',
    },
    text: {
      primary: 'text-stone-900 dark:text-stone-100',
      secondary: 'text-stone-600 dark:text-stone-400',
      muted: 'text-stone-400 dark:text-stone-500',
      subtle: 'text-stone-500 dark:text-stone-400',
      brand: 'text-orange-500 dark:text-orange-400',
      brandHover: 'hover:text-orange-600 dark:hover:text-orange-300',
      inverse: 'text-white',
      heading: 'font-extrabold text-stone-900 dark:text-stone-100 tracking-tight',
      link: 'text-orange-500 hover:text-orange-600 dark:text-orange-400 dark:hover:text-orange-300 transition-colors',
      success: 'text-emerald-600 dark:text-emerald-400',
      warning: 'text-amber-600 dark:text-amber-400',
      danger: 'text-rose-600 dark:text-rose-400',
    },
    button: {
      primary: 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold rounded-xl shadow-xs hover:shadow-orange-500/25 transition-all active:scale-[0.98] cursor-pointer',
      secondary: 'bg-[#f7f4ee] hover:bg-[#efe8dd] dark:bg-[#242220] dark:hover:bg-[#2e2c2a] text-stone-700 dark:text-stone-200 border border-[#efe8dd] dark:border-[#2e2c2a] font-medium rounded-xl transition-all cursor-pointer',
      outline: 'border border-orange-500/40 text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-950/30 font-semibold rounded-xl transition-all cursor-pointer',
      ghost: 'text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100 hover:bg-[#f5efeb] dark:hover:bg-[#242220] rounded-xl transition-all cursor-pointer',
      danger: 'bg-rose-500 hover:bg-rose-600 text-white font-semibold rounded-xl shadow-xs transition-all cursor-pointer',
      success: 'bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-xl shadow-xs transition-all cursor-pointer',
      icon: 'p-2 rounded-xl text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100 hover:bg-[#f5efeb] dark:hover:bg-[#242220] transition-colors cursor-pointer',
    },
    badge: {
      primary: 'bg-orange-500/15 text-orange-600 dark:text-orange-400 border border-orange-500/30 rounded-full font-semibold',
      success: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 rounded-full font-semibold',
      warning: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 rounded-full font-semibold',
      danger: 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30 rounded-full font-semibold',
      info: 'bg-orange-500/10 text-orange-600 dark:text-orange-300 border border-orange-500/20 rounded-full font-semibold',
      neutral: 'bg-stone-200/60 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-300/50 dark:border-stone-700 rounded-full font-semibold',
    },
    input: {
      base: 'w-full bg-[#f7f4ee] dark:bg-[#242220] border border-[#ebe3d7] dark:border-[#33302d] rounded-xl text-stone-900 dark:text-stone-100 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 transition-all',
      select: 'w-full bg-[#f7f4ee] dark:bg-[#242220] border border-[#ebe3d7] dark:border-[#33302d] rounded-xl text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 transition-all',
    },
    card: {
      base: 'bg-white dark:bg-[#1c1b1a] border border-[#efe8dd] dark:border-[#2e2c2a] rounded-2xl shadow-xs',
      interactive: 'bg-white dark:bg-[#1c1b1a] border border-[#efe8dd] dark:border-[#2e2c2a] hover:border-orange-400 dark:hover:border-orange-500/50 rounded-2xl shadow-xs hover:shadow-md transition-all cursor-pointer',
      elevated: 'bg-white dark:bg-[#242322] border border-[#efe8dd] dark:border-[#2e2c2a] rounded-2xl shadow-md',
      glass: 'bg-white/85 dark:bg-[#1c1b1a]/85 backdrop-blur-md border border-[#efe8dd]/80 dark:border-white/10 rounded-2xl shadow-sm',
    },
    table: {
      container: 'bg-white dark:bg-[#1c1b1a] border border-[#efe8dd] dark:border-[#2e2c2a] rounded-2xl overflow-hidden shadow-xs',
      header: 'bg-[#f5efeb] dark:bg-[#181716] text-stone-600 dark:text-stone-400 border-b border-[#efe8dd] dark:border-[#2e2c2a] text-xs font-bold uppercase tracking-wider',
      row: 'border-b border-[#efe8dd] dark:border-[#2e2c2a] hover:bg-[#faf7f2]/80 dark:hover:bg-[#242220]/60 transition-colors',
    },
  },

  // ── 2. Emerald Forest & Mint ───────────────────────────────────────────────
  emerald: {
    id: 'emerald',
    name: 'Emerald Forest & Mint',
    raw: {
      primary: '#10b981',
      primaryHover: '#059669',
      accent: '#14b8a6',
      bgLight: '#f4f8f5',
      bgDark: '#0d1712',
      cardLight: '#ffffff',
      cardDark: '#13221b',
      cardDarkElevated: '#1a2e24',
      borderLight: '#e1ece4',
      borderLightSoft: '#edf4ef',
      borderDark: '#1c3328',
      borderDarkSoft: '#172b22',
      textLight: '#0f291e',
      textLightSecondary: '#406352',
      textLightMuted: '#6f9482',
      textDark: '#f4f8f5',
      textDarkSecondary: '#b7d4c5',
      textDarkMuted: '#6f9482',
      gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      shadowGlow: 'rgba(16, 185, 129, 0.25)',
    },
    bg: {
      page: 'bg-[#f4f8f5] dark:bg-[#0d1712]',
      card: 'bg-white dark:bg-[#13221b]',
      cardElevated: 'bg-white dark:bg-[#1a2e24]',
      cardInteractive: 'bg-white dark:bg-[#13221b] hover:bg-[#edf4ef] dark:hover:bg-[#1a2e24]',
      surface: 'bg-[#edf4ef] dark:bg-[#1a2e24]',
      surfaceSubtle: 'bg-[#f4f8f5]/70 dark:bg-[#13221b]/70',
      header: 'bg-white/95 dark:bg-[#0f1d16]/95 backdrop-blur-md',
      sidebar: 'bg-white dark:bg-[#0f1d16]',
      input: 'bg-[#edf4ef] dark:bg-[#1a2e24]',
      hover: 'hover:bg-[#edf4ef] dark:hover:bg-[#1c3328]',
      active: 'bg-emerald-500/10 dark:bg-emerald-500/20',
      brand: 'bg-emerald-500',
      brandHover: 'hover:bg-emerald-600',
      brandGradient: 'bg-gradient-to-r from-emerald-500 to-teal-500',
      brandSubtle: 'bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400',
      glass: 'bg-white/85 dark:bg-[#13221b]/85 backdrop-blur-md',
    },
    border: {
      default: 'border-[#e1ece4] dark:border-[#1c3328]',
      subtle: 'border-[#edf4ef] dark:border-[#172b22]',
      strong: 'border-[#c5dcd0] dark:border-[#274637]',
      focus: 'focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/25',
      brand: 'border-emerald-500/30 dark:border-emerald-500/40',
      brandActive: 'border-emerald-500',
      glass: 'border-[#e1ece4]/80 dark:border-white/10',
      divider: 'divide-[#e1ece4] dark:divide-[#1c3328]',
      hover: 'hover:border-emerald-400 dark:hover:border-emerald-500/50',
    },
    shadow: {
      none: 'shadow-none',
      xs: 'shadow-2xs dark:shadow-none',
      sm: 'shadow-xs dark:shadow-black/20',
      md: 'shadow-md dark:shadow-black/40',
      lg: 'shadow-lg dark:shadow-black/50',
      xl: 'shadow-xl dark:shadow-black/60',
      card: 'shadow-xs hover:shadow-md transition-shadow dark:shadow-black/40',
      cardHover: 'hover:shadow-lg dark:hover:shadow-black/50 transition-shadow',
      brand: 'shadow-lg shadow-emerald-500/20 dark:shadow-emerald-500/10',
      brandGlow: 'shadow-[0_0_20px_rgba(16,185,129,0.35)]',
      glass: 'shadow-[0_8px_32px_0_rgba(16,185,129,0.06)] dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.5)]',
    },
    text: {
      primary: 'text-stone-900 dark:text-stone-100',
      secondary: 'text-stone-600 dark:text-stone-400',
      muted: 'text-stone-400 dark:text-stone-500',
      subtle: 'text-stone-500 dark:text-stone-400',
      brand: 'text-emerald-500 dark:text-emerald-400',
      brandHover: 'hover:text-emerald-600 dark:hover:text-emerald-300',
      inverse: 'text-white',
      heading: 'font-extrabold text-stone-900 dark:text-stone-100 tracking-tight',
      link: 'text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 transition-colors',
      success: 'text-emerald-600 dark:text-emerald-400',
      warning: 'text-amber-600 dark:text-amber-400',
      danger: 'text-rose-600 dark:text-rose-400',
    },
    button: {
      primary: 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold rounded-xl shadow-xs hover:shadow-emerald-500/25 transition-all active:scale-[0.98] cursor-pointer',
      secondary: 'bg-[#edf4ef] hover:bg-[#e1ece4] dark:bg-[#1a2e24] dark:hover:bg-[#1c3328] text-stone-700 dark:text-stone-200 border border-[#e1ece4] dark:border-[#1c3328] font-medium rounded-xl transition-all cursor-pointer',
      outline: 'border border-emerald-500/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 font-semibold rounded-xl transition-all cursor-pointer',
      ghost: 'text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100 hover:bg-[#edf4ef] dark:hover:bg-[#1a2e24] rounded-xl transition-all cursor-pointer',
      danger: 'bg-rose-500 hover:bg-rose-600 text-white font-semibold rounded-xl shadow-xs transition-all cursor-pointer',
      success: 'bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-xl shadow-xs transition-all cursor-pointer',
      icon: 'p-2 rounded-xl text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100 hover:bg-[#edf4ef] dark:hover:bg-[#1a2e24] transition-colors cursor-pointer',
    },
    badge: {
      primary: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 rounded-full font-semibold',
      success: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 rounded-full font-semibold',
      warning: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 rounded-full font-semibold',
      danger: 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30 rounded-full font-semibold',
      info: 'bg-teal-500/10 text-teal-600 dark:text-teal-300 border border-teal-500/20 rounded-full font-semibold',
      neutral: 'bg-stone-200/60 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-300/50 dark:border-stone-700 rounded-full font-semibold',
    },
    input: {
      base: 'w-full bg-[#edf4ef] dark:bg-[#1a2e24] border border-[#e1ece4] dark:border-[#1c3328] rounded-xl text-stone-900 dark:text-stone-100 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all',
      select: 'w-full bg-[#edf4ef] dark:bg-[#1a2e24] border border-[#e1ece4] dark:border-[#1c3328] rounded-xl text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all',
    },
    card: {
      base: 'bg-white dark:bg-[#13221b] border border-[#e1ece4] dark:border-[#1c3328] rounded-2xl shadow-xs',
      interactive: 'bg-white dark:bg-[#13221b] border border-[#e1ece4] dark:border-[#1c3328] hover:border-emerald-400 dark:hover:border-emerald-500/50 rounded-2xl shadow-xs hover:shadow-md transition-all cursor-pointer',
      elevated: 'bg-white dark:bg-[#1a2e24] border border-[#e1ece4] dark:border-[#1c3328] rounded-2xl shadow-md',
      glass: 'bg-white/85 dark:bg-[#13221b]/85 backdrop-blur-md border border-[#e1ece4]/80 dark:border-white/10 rounded-2xl shadow-sm',
    },
    table: {
      container: 'bg-white dark:bg-[#13221b] border border-[#e1ece4] dark:border-[#1c3328] rounded-2xl overflow-hidden shadow-xs',
      header: 'bg-[#edf4ef] dark:bg-[#0f1d16] text-stone-600 dark:text-stone-400 border-b border-[#e1ece4] dark:border-[#1c3328] text-xs font-bold uppercase tracking-wider',
      row: 'border-b border-[#e1ece4] dark:border-[#1c3328] hover:bg-[#f4f8f5]/80 dark:hover:bg-[#1a2e24]/60 transition-colors',
    },
  },

  // ── 3. Royal Indigo & Violet ───────────────────────────────────────────────
  royalIndigo: {
    id: 'royalIndigo',
    name: 'Royal Indigo & Violet',
    raw: {
      primary: '#6366f1',
      primaryHover: '#4f46e5',
      accent: '#8b5cf6',
      bgLight: '#f6f7fb',
      bgDark: '#0f121d',
      cardLight: '#ffffff',
      cardDark: '#171b2b',
      cardDarkElevated: '#1f243a',
      borderLight: '#e2e5f1',
      borderLightSoft: '#edeff7',
      borderDark: '#262b42',
      borderDarkSoft: '#1f2336',
      textLight: '#111827',
      textLightSecondary: '#4b5563',
      textLightMuted: '#9ca3af',
      textDark: '#f9fafb',
      textDarkSecondary: '#cbd5e1',
      textDarkMuted: '#64748b',
      gradient: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
      shadowGlow: 'rgba(99, 102, 241, 0.25)',
    },
    bg: {
      page: 'bg-[#f6f7fb] dark:bg-[#0f121d]',
      card: 'bg-white dark:bg-[#171b2b]',
      cardElevated: 'bg-white dark:bg-[#1f243a]',
      cardInteractive: 'bg-white dark:bg-[#171b2b] hover:bg-[#edeff7] dark:hover:bg-[#1f243a]',
      surface: 'bg-[#edeff7] dark:bg-[#1f243a]',
      surfaceSubtle: 'bg-[#f6f7fb]/70 dark:bg-[#171b2b]/70',
      header: 'bg-white/95 dark:bg-[#121624]/95 backdrop-blur-md',
      sidebar: 'bg-white dark:bg-[#121624]',
      input: 'bg-[#edeff7] dark:bg-[#1f243a]',
      hover: 'hover:bg-[#edeff7] dark:hover:bg-[#262b42]',
      active: 'bg-indigo-500/10 dark:bg-indigo-500/20',
      brand: 'bg-indigo-500',
      brandHover: 'hover:bg-indigo-600',
      brandGradient: 'bg-gradient-to-r from-indigo-500 to-purple-500',
      brandSubtle: 'bg-indigo-500/10 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-400',
      glass: 'bg-white/85 dark:bg-[#171b2b]/85 backdrop-blur-md',
    },
    border: {
      default: 'border-[#e2e5f1] dark:border-[#262b42]',
      subtle: 'border-[#edeff7] dark:border-[#1f2336]',
      strong: 'border-[#c8cde4] dark:border-[#353c5c]',
      focus: 'focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/25',
      brand: 'border-indigo-500/30 dark:border-indigo-500/40',
      brandActive: 'border-indigo-500',
      glass: 'border-[#e2e5f1]/80 dark:border-white/10',
      divider: 'divide-[#e2e5f1] dark:divide-[#262b42]',
      hover: 'hover:border-indigo-400 dark:hover:border-indigo-500/50',
    },
    shadow: {
      none: 'shadow-none',
      xs: 'shadow-2xs dark:shadow-none',
      sm: 'shadow-xs dark:shadow-black/20',
      md: 'shadow-md dark:shadow-black/40',
      lg: 'shadow-lg dark:shadow-black/50',
      xl: 'shadow-xl dark:shadow-black/60',
      card: 'shadow-xs hover:shadow-md transition-shadow dark:shadow-black/40',
      cardHover: 'hover:shadow-lg dark:hover:shadow-black/50 transition-shadow',
      brand: 'shadow-lg shadow-indigo-500/20 dark:shadow-indigo-500/10',
      brandGlow: 'shadow-[0_0_20px_rgba(99,102,241,0.35)]',
      glass: 'shadow-[0_8px_32px_0_rgba(99,102,241,0.06)] dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.5)]',
    },
    text: {
      primary: 'text-stone-900 dark:text-stone-100',
      secondary: 'text-stone-600 dark:text-stone-400',
      muted: 'text-stone-400 dark:text-stone-500',
      subtle: 'text-stone-500 dark:text-stone-400',
      brand: 'text-indigo-500 dark:text-indigo-400',
      brandHover: 'hover:text-indigo-600 dark:hover:text-indigo-300',
      inverse: 'text-white',
      heading: 'font-extrabold text-stone-900 dark:text-stone-100 tracking-tight',
      link: 'text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors',
      success: 'text-emerald-600 dark:text-emerald-400',
      warning: 'text-amber-600 dark:text-amber-400',
      danger: 'text-rose-600 dark:text-rose-400',
    },
    button: {
      primary: 'bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-semibold rounded-xl shadow-xs hover:shadow-indigo-500/25 transition-all active:scale-[0.98] cursor-pointer',
      secondary: 'bg-[#edeff7] hover:bg-[#e2e5f1] dark:bg-[#1f243a] dark:hover:bg-[#262b42] text-stone-700 dark:text-stone-200 border border-[#e2e5f1] dark:border-[#262b42] font-medium rounded-xl transition-all cursor-pointer',
      outline: 'border border-indigo-500/40 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 font-semibold rounded-xl transition-all cursor-pointer',
      ghost: 'text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100 hover:bg-[#edeff7] dark:hover:bg-[#1f243a] rounded-xl transition-all cursor-pointer',
      danger: 'bg-rose-500 hover:bg-rose-600 text-white font-semibold rounded-xl shadow-xs transition-all cursor-pointer',
      success: 'bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-xl shadow-xs transition-all cursor-pointer',
      icon: 'p-2 rounded-xl text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100 hover:bg-[#edeff7] dark:hover:bg-[#1f243a] transition-colors cursor-pointer',
    },
    badge: {
      primary: 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30 rounded-full font-semibold',
      success: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 rounded-full font-semibold',
      warning: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 rounded-full font-semibold',
      danger: 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30 rounded-full font-semibold',
      info: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 border border-indigo-500/20 rounded-full font-semibold',
      neutral: 'bg-stone-200/60 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-300/50 dark:border-stone-700 rounded-full font-semibold',
    },
    input: {
      base: 'w-full bg-[#edeff7] dark:bg-[#1f243a] border border-[#e2e5f1] dark:border-[#262b42] rounded-xl text-stone-900 dark:text-stone-100 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all',
      select: 'w-full bg-[#edeff7] dark:bg-[#1f243a] border border-[#e2e5f1] dark:border-[#262b42] rounded-xl text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all',
    },
    card: {
      base: 'bg-white dark:bg-[#171b2b] border border-[#e2e5f1] dark:border-[#262b42] rounded-2xl shadow-xs',
      interactive: 'bg-white dark:bg-[#171b2b] border border-[#e2e5f1] dark:border-[#262b42] hover:border-indigo-400 dark:hover:border-indigo-500/50 rounded-2xl shadow-xs hover:shadow-md transition-all cursor-pointer',
      elevated: 'bg-white dark:bg-[#1f243a] border border-[#e2e5f1] dark:border-[#262b42] rounded-2xl shadow-md',
      glass: 'bg-white/85 dark:bg-[#171b2b]/85 backdrop-blur-md border border-[#e2e5f1]/80 dark:border-white/10 rounded-2xl shadow-sm',
    },
    table: {
      container: 'bg-white dark:bg-[#171b2b] border border-[#e2e5f1] dark:border-[#262b42] rounded-2xl overflow-hidden shadow-xs',
      header: 'bg-[#edeff7] dark:bg-[#121624] text-stone-600 dark:text-stone-400 border-b border-[#e2e5f1] dark:border-[#262b42] text-xs font-bold uppercase tracking-wider',
      row: 'border-b border-[#e2e5f1] dark:border-[#262b42] hover:bg-[#f6f7fb]/80 dark:hover:bg-[#1f243a]/60 transition-colors',
    },
  },

  // ── 4. Crimson Velvet & Rose ───────────────────────────────────────────────
  crimsonRose: {
    id: 'crimsonRose',
    name: 'Crimson Velvet & Rose',
    raw: {
      primary: '#f43f5e',
      primaryHover: '#e11d48',
      accent: '#fb7185',
      bgLight: '#fdf6f7',
      bgDark: '#170e11',
      cardLight: '#ffffff',
      cardDark: '#24151b',
      cardDarkElevated: '#301c24',
      borderLight: '#f8dfe3',
      borderLightSoft: '#faedf0',
      borderDark: '#3b202c',
      borderDarkSoft: '#2d1822',
      textLight: '#1f1014',
      textLightSecondary: '#6e4450',
      textLightMuted: '#a37784',
      textDark: '#fdf6f7',
      textDarkSecondary: '#dfbac3',
      textDarkMuted: '#946673',
      gradient: 'linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)',
      shadowGlow: 'rgba(244, 63, 94, 0.25)',
    },
    bg: {
      page: 'bg-[#fdf6f7] dark:bg-[#170e11]',
      card: 'bg-white dark:bg-[#24151b]',
      cardElevated: 'bg-white dark:bg-[#301c24]',
      cardInteractive: 'bg-white dark:bg-[#24151b] hover:bg-[#faedf0] dark:hover:bg-[#301c24]',
      surface: 'bg-[#faedf0] dark:bg-[#301c24]',
      surfaceSubtle: 'bg-[#fdf6f7]/70 dark:bg-[#24151b]/70',
      header: 'bg-white/95 dark:bg-[#1d1116]/95 backdrop-blur-md',
      sidebar: 'bg-white dark:bg-[#1d1116]',
      input: 'bg-[#faedf0] dark:bg-[#301c24]',
      hover: 'hover:bg-[#faedf0] dark:hover:bg-[#3b202c]',
      active: 'bg-rose-500/10 dark:bg-rose-500/20',
      brand: 'bg-rose-500',
      brandHover: 'hover:bg-rose-600',
      brandGradient: 'bg-gradient-to-r from-rose-500 to-pink-500',
      brandSubtle: 'bg-rose-500/10 text-rose-600 dark:bg-rose-500/15 dark:text-rose-400',
      glass: 'bg-white/85 dark:bg-[#24151b]/85 backdrop-blur-md',
    },
    border: {
      default: 'border-[#f8dfe3] dark:border-[#3b202c]',
      subtle: 'border-[#faedf0] dark:border-[#2d1822]',
      strong: 'border-[#ecc0c8] dark:border-[#4d2939]',
      focus: 'focus:border-rose-500 focus:ring-2 focus:ring-rose-500/25',
      brand: 'border-rose-500/30 dark:border-rose-500/40',
      brandActive: 'border-rose-500',
      glass: 'border-[#f8dfe3]/80 dark:border-white/10',
      divider: 'divide-[#f8dfe3] dark:divide-[#3b202c]',
      hover: 'hover:border-rose-400 dark:hover:border-rose-500/50',
    },
    shadow: {
      none: 'shadow-none',
      xs: 'shadow-2xs dark:shadow-none',
      sm: 'shadow-xs dark:shadow-black/20',
      md: 'shadow-md dark:shadow-black/40',
      lg: 'shadow-lg dark:shadow-black/50',
      xl: 'shadow-xl dark:shadow-black/60',
      card: 'shadow-xs hover:shadow-md transition-shadow dark:shadow-black/40',
      cardHover: 'hover:shadow-lg dark:hover:shadow-black/50 transition-shadow',
      brand: 'shadow-lg shadow-rose-500/20 dark:shadow-rose-500/10',
      brandGlow: 'shadow-[0_0_20px_rgba(244,63,94,0.35)]',
      glass: 'shadow-[0_8px_32px_0_rgba(244,63,94,0.06)] dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.5)]',
    },
    text: {
      primary: 'text-stone-900 dark:text-stone-100',
      secondary: 'text-stone-600 dark:text-stone-400',
      muted: 'text-stone-400 dark:text-stone-500',
      subtle: 'text-stone-500 dark:text-stone-400',
      brand: 'text-rose-500 dark:text-rose-400',
      brandHover: 'hover:text-rose-600 dark:hover:text-rose-300',
      inverse: 'text-white',
      heading: 'font-extrabold text-stone-900 dark:text-stone-100 tracking-tight',
      link: 'text-rose-600 hover:text-rose-700 dark:text-rose-400 dark:hover:text-rose-300 transition-colors',
      success: 'text-emerald-600 dark:text-emerald-400',
      warning: 'text-amber-600 dark:text-amber-400',
      danger: 'text-rose-600 dark:text-rose-400',
    },
    button: {
      primary: 'bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-semibold rounded-xl shadow-xs hover:shadow-rose-500/25 transition-all active:scale-[0.98] cursor-pointer',
      secondary: 'bg-[#faedf0] hover:bg-[#f8dfe3] dark:bg-[#301c24] dark:hover:bg-[#3b202c] text-stone-700 dark:text-stone-200 border border-[#f8dfe3] dark:border-[#3b202c] font-medium rounded-xl transition-all cursor-pointer',
      outline: 'border border-rose-500/40 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 font-semibold rounded-xl transition-all cursor-pointer',
      ghost: 'text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100 hover:bg-[#faedf0] dark:hover:bg-[#301c24] rounded-xl transition-all cursor-pointer',
      danger: 'bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-xl shadow-xs transition-all cursor-pointer',
      success: 'bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-xl shadow-xs transition-all cursor-pointer',
      icon: 'p-2 rounded-xl text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100 hover:bg-[#faedf0] dark:hover:bg-[#301c24] transition-colors cursor-pointer',
    },
    badge: {
      primary: 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30 rounded-full font-semibold',
      success: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 rounded-full font-semibold',
      warning: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 rounded-full font-semibold',
      danger: 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30 rounded-full font-semibold',
      info: 'bg-pink-500/10 text-pink-600 dark:text-pink-300 border border-pink-500/20 rounded-full font-semibold',
      neutral: 'bg-stone-200/60 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-300/50 dark:border-stone-700 rounded-full font-semibold',
    },
    input: {
      base: 'w-full bg-[#faedf0] dark:bg-[#301c24] border border-[#f8dfe3] dark:border-[#3b202c] rounded-xl text-stone-900 dark:text-stone-100 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-rose-500/30 focus:border-rose-500 transition-all',
      select: 'w-full bg-[#faedf0] dark:bg-[#301c24] border border-[#f8dfe3] dark:border-[#3b202c] rounded-xl text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-rose-500/30 focus:border-rose-500 transition-all',
    },
    card: {
      base: 'bg-white dark:bg-[#24151b] border border-[#f8dfe3] dark:border-[#3b202c] rounded-2xl shadow-xs',
      interactive: 'bg-white dark:bg-[#24151b] border border-[#f8dfe3] dark:border-[#3b202c] hover:border-rose-400 dark:hover:border-rose-500/50 rounded-2xl shadow-xs hover:shadow-md transition-all cursor-pointer',
      elevated: 'bg-white dark:bg-[#301c24] border border-[#f8dfe3] dark:border-[#3b202c] rounded-2xl shadow-md',
      glass: 'bg-white/85 dark:bg-[#24151b]/85 backdrop-blur-md border border-[#f8dfe3]/80 dark:border-white/10 rounded-2xl shadow-sm',
    },
    table: {
      container: 'bg-white dark:bg-[#24151b] border border-[#f8dfe3] dark:border-[#3b202c] rounded-2xl overflow-hidden shadow-xs',
      header: 'bg-[#faedf0] dark:bg-[#1d1116] text-stone-600 dark:text-stone-400 border-b border-[#f8dfe3] dark:border-[#3b202c] text-xs font-bold uppercase tracking-wider',
      row: 'border-b border-[#f8dfe3] dark:border-[#3b202c] hover:bg-[#fdf6f7]/80 dark:hover:bg-[#301c24]/60 transition-colors',
    },
  },
};

/**
 * Resolved active theme combination definition
 */
export const activePalette = COMBINATIONS[ACTIVE_COMBINATION] || COMBINATIONS.warmOrange;

// Export individual groups for clean and direct classname imports:
export const raw = activePalette.raw;
export const bg = activePalette.bg;
export const border = activePalette.border;
export const shadow = activePalette.shadow;
export const text = activePalette.text;
export const button = activePalette.button;
export const badge = activePalette.badge;
export const input = activePalette.input;
export const card = activePalette.card;
export const table = activePalette.table;

export const brand = {
  name: activePalette.name,
  primary: activePalette.raw.primary,
  primaryHover: activePalette.raw.primaryHover,
  accent: activePalette.raw.accent,
  gradient: activePalette.raw.gradient,
  shadowGlow: activePalette.raw.shadowGlow,
  bg: activePalette.bg.brand,
  bgHover: activePalette.bg.brandHover,
  bgGradient: activePalette.bg.brandGradient,
  text: activePalette.text.brand,
  border: activePalette.border.brand,
  ring: activePalette.border.focus,
};

export const glass = {
  panel: 'glass-panel',
  card: 'glass-card',
  bg: activePalette.bg.glass,
  border: activePalette.border.glass,
};

/**
 * Synchronize CSS variables on the document root to match the active combination.
 * This guarantees that plain CSS, custom scrollbars, glass effects, and third-party
 * components immediately inherit the central combination.
 */
export const syncDocumentThemeVariables = (combinationId = ACTIVE_COMBINATION) => {
  if (typeof document === 'undefined') return;

  const currentCombination = COMBINATIONS[combinationId] || activePalette;
  const { raw: r } = currentCombination;
  const root = document.documentElement;
  const isDark = root.classList.contains('dark');

  if (isDark) {
    root.style.setProperty('--bg-primary', r.bgDark);
    root.style.setProperty('--bg-secondary', r.cardDark);
    root.style.setProperty('--border-color', r.borderDark);
    root.style.setProperty('--border-soft', r.borderDarkSoft || r.borderDark);
    root.style.setProperty('--surface-1', r.cardDark);
    root.style.setProperty('--surface-2', r.cardDarkElevated || r.cardDark);
    root.style.setProperty('--text-primary', r.textDark);
    root.style.setProperty('--text-secondary', r.textDarkSecondary || r.textDarkMuted);
    root.style.setProperty('--brand-primary', r.primary);
    root.style.setProperty('--brand-gradient', r.gradient);
    root.style.setProperty('--glass-bg', `${r.cardDark}d9`);
    root.style.setProperty('--glass-border', 'rgba(255, 255, 255, 0.08)');
  } else {
    root.style.setProperty('--bg-primary', r.bgLight);
    root.style.setProperty('--bg-secondary', r.cardLight);
    root.style.setProperty('--border-color', r.borderLight);
    root.style.setProperty('--border-soft', r.borderLightSoft || r.borderLight);
    root.style.setProperty('--surface-1', r.cardLight);
    root.style.setProperty('--surface-2', r.bgLight);
    root.style.setProperty('--text-primary', r.textLight);
    root.style.setProperty('--text-secondary', r.textLightSecondary);
    root.style.setProperty('--brand-primary', r.primary);
    root.style.setProperty('--brand-gradient', r.gradient);
    root.style.setProperty('--glass-bg', `${r.cardLight}d9`);
    root.style.setProperty('--glass-border', `${r.borderLight}cc`);
  }
};

// Auto-run if running in browser
if (typeof document !== 'undefined') {
  syncDocumentThemeVariables(ACTIVE_COMBINATION);
}

/**
 * Master COLOR object export
 */
export const COLOR = {
  ACTIVE_COMBINATION,
  COMBINATIONS,
  activePalette,
  raw,
  brand,
  bg,
  border,
  shadow,
  text,
  button,
  badge,
  input,
  card,
  table,
  glass,
  syncDocumentThemeVariables,
};

export default COLOR;
