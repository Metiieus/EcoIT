import React from 'react';

// SVG Icon paths — exact match of the original dc.html defs
const DEFS: Record<string, React.ReactElement[]> = {};

function p(d: string) { return React.createElement('path', { d }); }
function r(x: number, y: number, w: number, h: number, rx: number) { return React.createElement('rect', { x, y, width: w, height: h, rx }); }
function c(cx: number, cy: number, rr: number) { return React.createElement('circle', { cx, cy, r: rr }); }
function l(x1: number, y1: number, x2: number, y2: number) { return React.createElement('line', { x1, y1, x2, y2 }); }

DEFS.roteador = [r(2,14,20,8,2), p('M6.01 18h.01'), p('M10.01 18h.01'), p('M15 10v4'), p('M17.84 7.17a4 4 0 0 0-5.66 0'), p('M20.66 4.34a8 8 0 0 0-11.31 0')];
DEFS.switch = [r(16,16,6,6,1), r(2,16,6,6,1), r(9,2,6,6,1), p('M5 16v-3a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v3'), p('M12 12V8')];
DEFS.wifi = [p('M12 20h.01'), p('M8.5 16.5a5 5 0 0 1 7 0'), p('M5 13a10 10 0 0 1 14 0'), p('M2 8.82a15 15 0 0 1 20 0')];
DEFS.servidor = [r(2,2,20,8,2), r(2,14,20,8,2), p('M6 6h.01'), p('M6 18h.01')];
DEFS.vm = [r(2,3,20,14,2), p('M8 21h8'), p('M12 17v4')];
DEFS.nuvem = [p('M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9z')];
DEFS.firewall = [p('M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z')];
DEFS.gov = [r(8,2,8,4,1), p('M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2'), p('M9 14l2 2 4-4')];
DEFS.chart = [l(12,20,12,10), l(18,20,18,4), l(6,20,6,16)];
DEFS.users = [p('M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2'), c(9,7,4), p('M22 21v-2a4 4 0 0 0-3-3.87'), p('M16 3.13a4 4 0 0 1 0 7.75')];
DEFS.dollar = [l(12,2,12,22), p('M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6')];
DEFS.cpu = [r(4,4,16,16,2), r(9,9,6,6,1), p('M9 2v2'), p('M15 2v2'), p('M9 20v2'), p('M15 20v2'), p('M2 9h2'), p('M2 15h2'), p('M20 9h2'), p('M20 15h2')];
DEFS.ecosystem = [c(18,5,3), c(6,12,3), c(18,19,3), l(8.59,13.51,15.42,17.49), l(15.41,6.51,8.59,10.49)];
DEFS.nodes = [p('M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z'), p('M3.3 7 12 12l8.7-5'), p('M12 22V12')];
DEFS.connections = [p('M9 17H7A5 5 0 0 1 7 7h2'), p('M15 7h2a5 5 0 0 1 0 10h-2'), l(8,12,16,12)];
DEFS.secrets = [r(3,11,18,11,2), p('M7 11V7a5 5 0 0 1 10 0v4')];
DEFS.settings = [c(12,12,3), p('M12 2v2'), p('M12 20v2'), p('M4.93 4.93l1.41 1.41'), p('M17.66 17.66l1.41 1.41'), p('M2 12h2'), p('M20 12h2'), p('M4.93 19.07l1.41-1.41'), p('M17.66 6.34l1.41-1.41')];
DEFS.search = [c(11,11,8), p('M21 21l-4.3-4.3')];
DEFS.plus = [p('M5 12h14'), p('M12 5v14')];
DEFS.x = [p('M18 6 6 18'), p('M6 6l12 12')];
DEFS.bell = [p('M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9'), p('M10.3 21a1.94 1.94 0 0 0 3.4 0')];
DEFS.chevron = [p('M6 9l6 6 6-6')];
DEFS.eye = [p('M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z'), c(12,12,3)];
DEFS.eyeoff = [p('M9.88 9.88a3 3 0 1 0 4.24 4.24'), p('M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68'), p('M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61'), l(2,2,22,22)];
DEFS.trash = [p('M3 6h18'), p('M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2')];
DEFS.edit = [p('M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7'), p('M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4z')];
DEFS.lock = [r(3,11,18,11,2), p('M7 11V7a5 5 0 0 1 10 0v4')];
DEFS.spark = [p('M12 3v3'), p('M12 18v3'), p('M3 12h3'), p('M18 12h3'), p('M5.6 5.6l2.1 2.1'), p('M16.3 16.3l2.1 2.1'), p('M5.6 18.4l2.1-2.1'), p('M16.3 7.7l2.1-2.1')];
DEFS.zoomin = [c(11,11,8), p('M21 21l-4.3-4.3'), l(11,8,11,14), l(8,11,14,11)];
DEFS.zoomout = [c(11,11,8), p('M21 21l-4.3-4.3'), l(8,11,14,11)];
DEFS.fit = [p('M8 3H5a2 2 0 0 0-2 2v3'), p('M21 8V5a2 2 0 0 0-2-2h-3'), p('M3 16v3a2 2 0 0 0 2 2h3'), p('M16 21h3a2 2 0 0 0 2-2v-3')];
DEFS.target = [c(12,12,10), c(12,12,6), c(12,12,2)];

export function Icon({ name, color = 'currentColor', size = 18 }: { name: string; color?: string; size?: number }) {
  const kids = (DEFS[name] || DEFS.nodes).map((child, i) => React.cloneElement(child, { key: i }));
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      {kids}
    </svg>
  );
}
