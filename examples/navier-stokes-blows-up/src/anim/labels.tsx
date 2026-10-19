// On-screen labels, written exactly as the article writes them (see factcheck.md).
import React from 'react';
import { C } from '../brand.ts';
import type { LabelId } from './VortexCore.state.ts';

const sup: React.CSSProperties = { fontSize: '0.62em', verticalAlign: '0.62em', marginLeft: 2 };
/** "∝" drawn as a line: the font glyph renders too small to read on a phone. */
const Prop: React.FC = () => (
  <svg width="0.95em" height="0.62em" viewBox="0 0 24 16" style={{ margin: '0 0.18em', verticalAlign: '0.02em' }}>
    <path d="M22 3 C16 3 13 13 7.5 13 C4 13 2 10.8 2 8 C2 5.2 4 3 7.5 3 C13 3 16 13 22 13" stroke="currentColor" strokeWidth={2.4} fill="none" strokeLinecap="round" />
  </svg>
);
const tau: React.CSSProperties = { fontStyle: 'italic' };

export const Formula: React.FC<{ id: LabelId }> = ({ id }) => {
  switch (id) {
    case 'radius':
      return (
        <span>
          radius <Prop /> <span style={tau}>τ</span>
          <span style={sup}>1/2</span>
        </span>
      );
    case 'peak':
      return (
        <span>
          peak speed <Prop /> <span style={tau}>τ</span>
          <span style={sup}>−1/2−h</span>
        </span>
      );
    case 'energy':
      return <span>core energy → 0</span>;
    case 'h':
      return (
        <span>
          <span style={tau}>h</span> &lt; 1/100
        </span>
      );
    case 'pushed':
      return (
        <span>
          pushed by a smooth force · <span style={{ color: C.accentText }}>proved</span>
        </span>
      );
    case 'alone':
      return (
        <span>
          left alone · <span style={{ color: C.text }}>still open</span>
        </span>
      );
  }
};

/** The swarm's label, in the article figure's form. */
export const SWARM_LABEL = '~10,000 agents · ~88 h';
/** The scale bar of the zoom. */
export const MFP_LABEL = 'mean free path of air molecules';
