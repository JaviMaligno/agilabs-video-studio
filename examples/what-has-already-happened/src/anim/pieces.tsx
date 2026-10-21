import React from 'react';

/** A small padlock: "frozen", fixed, cannot change. */
export const Lock: React.FC<{ size: number; color: string }> = ({ size, color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" style={{ flex: 'none' }}>
    <path d="M7 11V8a5 5 0 0 1 10 0v3" fill="none" stroke={color} strokeWidth={2.6} strokeLinecap="round" />
    <rect x={4.5} y={11} width={15} height={10.5} rx={2.2} fill={color} />
  </svg>
);

/** A check mark or a cross, for "read it · wrote it · ignored it". */
export const Mark: React.FC<{ size: number; color: string; cross?: boolean }> = ({ size, color, cross }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" style={{ flex: 'none' }}>
    {cross ? (
      <path d="M6 6 L18 18 M18 6 L6 18" stroke={color} strokeWidth={3.4} strokeLinecap="round" />
    ) : (
      <path d="M4.5 12.5 L10 18 L19.5 6.5" fill="none" stroke={color} strokeWidth={3.4} strokeLinecap="round" strokeLinejoin="round" />
    )}
  </svg>
);
