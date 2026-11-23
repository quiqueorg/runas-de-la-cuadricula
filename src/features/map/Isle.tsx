/**
 * The apprentice's isle. The chart itself is a baked image (assets/mapa-isla.jpg, painted by
 * scripts/isle-chart.ts); this layer adds the few things that move: boats, flags, cloth, a mill wheel
 * and the secrets that bob.
 */
import { ISLE_SPOTS } from './isleLayout';

const INK = '#3d3226';

function Boat({ x, y, s = 1, sail = '#f6f1e6' }: { readonly x: number; readonly y: number; readonly s?: number; readonly sail?: string }) {
  return <g transform={`translate(${x} ${y}) scale(${s})`} stroke={INK} strokeWidth=".9" strokeLinejoin="round">
    <ellipse cx="0" cy="4.5" rx="11" ry="2.2" fill="#d8f6ee" stroke="none" opacity=".7"/>
    <g className="isle-bob" style={{ animationDelay: `${-(x % 7) / 2}s` }}>
      <path fill={sail} d="M0-13 8 0H0Z"/><path fill="#e9dcc0" d="M-1-10-7 0h6Z"/>
      <path d="M0-14V1" strokeWidth="1"/>
      <path fill="#a8643a" d="M-9 0H9L6 4.5H-6Z"/>
    </g>
  </g>;
}

function House({ x, y, w = 12, roof = '#b0563a' }: { readonly x: number; readonly y: number; readonly w?: number; readonly roof?: string }) {
  const h = w * .52;
  return <g transform={`translate(${x} ${y})`} stroke={INK} strokeWidth=".8" strokeLinejoin="round">
    <path fill="#f1e6cc" d={`M${-w / 2} ${-h / 2}h${w}v${h}h${-w}Z`}/>
    <path fill={roof} d={`M${-w / 2 - 2} ${-h / 2}L0 ${-h / 2 - w * .34}L${w / 2 + 2} ${-h / 2}Z`}/>
    <path fill="#6b4a2c" d={`M-1.6 ${h / 2}v${-h * .5}h3.2v${h * .5}Z`}/>
  </g>;
}

/** Secrets that move, so they catch the eye: a bottle on the swell, two houses wall to wall, a ship that is barely there, a tent on the edge of the chart. */
function Hideouts() {
  return <>
    <g className="isle-bottle" stroke={INK} strokeWidth=".8" strokeLinejoin="round">
      <ellipse cx="24" cy="133" rx="11" ry="3" fill="#d8f6ee" stroke="none" opacity=".6"/>
      <g transform="translate(-20 -77) rotate(-24 44 204)">
        <path d="M40 198h8v12q0 3-4 3t-4-3Z" fill="#9fd8b8" fillOpacity=".85"/>
        <path d="M42.4 193h3.2v5h-3.2Z" fill="#9fd8b8"/>
        <path d="M42 190.6h4v2.6h-4Z" fill="#a8743f"/>
        <path d="M41.6 201h4.8v7h-4.8Z" fill="#fff6dc" strokeWidth=".5"/>
      </g>
    </g>
    <House x={624} y={404} roof="#b0563a"/>
    <House x={636} y={404} roof="#b0563a"/>
    <g className="isle-ghost">
      <ellipse cx="616" cy="66" rx="30" ry="13" fill="#eef4f6" opacity=".55"/>
      <ellipse cx="600" cy="58" rx="16" ry="8" fill="#f6fafb" opacity=".5"/>
      <ellipse cx="634" cy="60" rx="13" ry="7" fill="#f6fafb" opacity=".45"/>
      <g opacity=".62" stroke="#3f6474" strokeWidth=".8" strokeLinejoin="round">
        <path d="M602 66h28l-4 7h-20Z" fill="#b9d6de"/>
        <path d="M611 66V46m9 20V50" strokeWidth="1"/>
        <path d="M611 48l-7 12 7 2Zm0 1 6 9-6 3Z" fill="#eaf4f6"/>
        <path d="M620 52l6 9-6 2Z" fill="#eaf4f6"/>
      </g>
      <ellipse cx="616" cy="75" rx="24" ry="6" fill="#f6fafb" opacity=".6"/>
    </g>
    {/* the cartographer's tent, pitched on the frame itself */}
    <g stroke={INK} strokeWidth=".7" strokeLinejoin="round">
      <path d="M14 432 23 418 32 432Z" fill="#f2ead6"/>
      <path d="M23 418 25.5 432H20.5Z" fill="#c8553c"/>
      <path d="M23 418v-7" strokeWidth=".8"/>
      <path className="isle-flag" d="m23 411 6 1.8-6 1.8Z" fill="#3a7ab0"/>
    </g>
  </>;
}

export function Isle() {
  const [hx, hy] = ISLE_SPOTS.harbour;
  const [yx, yy] = ISLE_SPOTS.yard;
  const [dx, dy] = ISLE_SPOTS.dyes;
  const [px, py] = ISLE_SPOTS.press;
  return <>
    {/* harbour: boats moored in the bay */}
    <Boat x={hx - 38} y={hy + 12} s={1.05} sail="#f2c9a0"/>
    <Boat x={hx - 44} y={hy + 26} s={.85}/>
    <Boat x={hx - 48} y={hy - 2} s={.7}/>
    {/* drill yard flag */}
    <g stroke={INK} strokeWidth=".9"><path d={`M${yx + 24} ${yy - 22}v-18`} strokeWidth="1.1"/><path className="isle-flag" fill="#c8553c" d={`m${yx + 24} ${yy - 40} 10 3.2-10 3.2Z`}/></g>
    {/* dye works: cloth drying on a line over the flower beds */}
    <g stroke={INK} strokeWidth=".8">
      <path d={`M${dx - 44} ${dy - 4}v12m30-12v12`} strokeWidth="1"/><path d={`M${dx - 44} ${dy - 2}q15 4 30 0`} strokeWidth=".6"/>
      <path className="isle-cloth" fill="#d8483a" d={`m${dx - 41} ${dy - 0.6} 5 .7v7l-5-.7Z`}/>
      <path className="isle-cloth" style={{ animationDelay: '-.9s' }} fill="#f0c030" d={`m${dx - 32} ${dy + 0.6}h5v7h-5Z`}/>
      <path className="isle-cloth" style={{ animationDelay: '-1.7s' }} fill="#3a7ad8" d={`m${dx - 23} ${dy + 0.2} 5-.7v7l-5 .7Z`}/>
    </g>
    {/* the paper mill's wheel on the print town's stream */}
    <g className="isle-wheel" stroke={INK} strokeWidth=".8">
      <circle cx={px + 22} cy={py + 12} r="4.4" fill="#7a5230"/><circle cx={px + 22} cy={py + 12} r="1.5" fill="#e8c76c"/>
      <path d={`M${px + 22} ${py + 7.6}v8.8m-4.4-4.4h8.8`} strokeWidth=".6"/>
    </g>
    <Hideouts/>
  </>;
}
