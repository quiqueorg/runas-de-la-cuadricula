import type { CSSProperties } from 'react';

/** Custom properties (`--x`, `--d`…) that the map's CSS reads. */
export type CustomProperties = Readonly<Record<`--${string}`, string | number>>;

/** Custom properties as a style. React passes them through; its types only lack the names. */
export const cssVars = (properties: CustomProperties): CSSProperties => properties as CSSProperties;
