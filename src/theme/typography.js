/**
 * @file typography.js
 * @description Central typography and spacing design system tokens for RGES.
 *
 * Golden Rules:
 * 1. Mobile First Compactness: No text-2xl or text-3xl on mobile viewports (< 640px).
 * 2. Spacing 4 Rule: Standardize base spacing to 4 (16px / 1rem: p-4, m-4, gap-4).
 * 3. Consistent Button & Component rhythm across all views.
 */

export const typography = {
  /** Page Header / H1: 18px on mobile, 20px on tablet, 24px on desktop */
  h1: 'text-lg sm:text-xl md:text-2xl font-bold tracking-tight',

  /** Greeting Banner Title: Bold and prominent without blowing up mobile viewport */
  greeting: 'text-lg sm:text-xl md:text-2xl font-black tracking-tight',

  /** Section Header / Card Heading / Table Title (H2) */
  h2: 'text-sm sm:text-base font-bold tracking-tight',

  /** Sub-heading / Modal Title / Drawer Section (H3) */
  h3: 'text-xs sm:text-sm font-bold',

  /** Large KPI & Stat values (StatsCard numbers) */
  kpi: 'text-lg sm:text-xl font-extrabold tracking-tight',

  /** Default Body / Content */
  body: 'text-xs sm:text-sm font-normal',
  bodyBold: 'text-xs sm:text-sm font-semibold',

  /** Subtext, descriptions, muted helper text */
  subtext: 'text-[11px] sm:text-xs text-stone-500 dark:text-stone-400',

  /** Form labels */
  label: 'text-[10px] sm:text-xs font-semibold text-stone-600 dark:text-stone-300',

  /** Badges & Micro status tags */
  badge: 'text-[10px] sm:text-[11px] font-bold uppercase tracking-wider',

  /** Table column header */
  tableHeader: 'text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400',

  /** Table data cell */
  tableCell: 'text-xs',
};

export const spacing = {
  /** Standard Page Viewport Wrapper */
  pageWrapper: 'p-3.5 sm:p-4 md:p-6',

  /** Standard Vertical Flow between Page Sections */
  pageStack: 'space-y-4',

  /** Standard Card & Container Interior Padding */
  cardPadding: 'p-3.5 sm:p-4',

  /** Standard Section Bottom Margin */
  sectionMargin: 'mb-4',

  /** Standard Grid / Flex Gap */
  gridGap: 'gap-3 sm:gap-4',

  /** Table Cell Padding */
  tableCell: 'py-2.5 px-3 sm:py-3 sm:px-4',

  /** Modal Content Padding Scale */
  modalHeader: 'px-4 py-3 sm:px-5 sm:py-4',
  modalBody: 'p-4 sm:p-5 md:p-6',
  modalFooter: 'px-4 py-3 sm:px-5 sm:py-3.5',
};

export default {
  typography,
  spacing,
};
