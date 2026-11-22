/** The apprentice's isle, drawn in the atlas' own hand: flat shapes, dark outlines, soft shallows. */

const COAST = 'M78 250C72 214 86 186 104 164C118 146 112 122 132 104C156 80 196 74 222 54C246 36 292 44 322 38C352 32 372 54 404 46C440 36 486 52 520 74C552 94 566 126 590 146C614 168 600 204 608 232C614 262 590 284 594 312C598 344 560 362 536 384C512 404 484 408 462 416C430 428 400 416 370 424C336 432 300 420 268 424C232 428 196 414 170 396C140 376 118 360 104 334C90 308 84 282 78 250Z';
const CANAL = 'M607 228C584 238 560 246 542 262S510 306 498 332S486 382 485 414';
const INK = '#3d3226';

const PINES: readonly (readonly [number, number, number])[] = [
  [140, 132, 1], [152, 142, .9], [162, 126, 1.1], [174, 138, 1], [150, 156, .9], [136, 150, 1], [166, 152, .85],
  [546, 96, 1], [558, 108, .9], [536, 110, 1.1], [566, 124, .9], [578, 196, 1], [588, 214, .9], [590, 262, 1], [580, 278, .9],
  [108, 222, 1], [98, 240, .9], [106, 256, 1.1], [270, 404, 1], [256, 396, .9], [346, 404, 1], [362, 396, .9],
];

const BUSHES: readonly (readonly [number, number])[] = [
  [222, 160], [246, 150], [286, 188], [374, 180], [446, 196], [468, 250], [404, 318], [276, 300], [222, 262], [352, 344], [520, 208], [300, 108], [356, 128], [470, 126], [190, 330], [262, 340],
];

const FLOWERS: readonly (readonly [number, number, string])[] = [
  [232, 240, '#f8d24a'], [240, 246, '#f58ab0'], [248, 238, '#fffaf0'], [414, 216, '#f58ab0'], [422, 222, '#f8d24a'], [406, 224, '#fffaf0'],
  [300, 340, '#f8d24a'], [308, 346, '#fffaf0'], [316, 338, '#f58ab0'], [446, 292, '#fffaf0'], [454, 300, '#f8d24a'], [340, 150, '#f58ab0'],
  [348, 144, '#fffaf0'], [262, 232, '#f58ab0'], [382, 146, '#f8d24a'], [204, 276, '#fffaf0'], [212, 282, '#f8d24a'],
];

const TREES: readonly (readonly [number, number, number])[] = [
  [118, 168, 1], [128, 180, .9], [112, 196, 1.1], [124, 262, 1], [136, 276, .9], [116, 284, 1.1], [150, 292, 1],
  [196, 120, 1], [208, 132, .9], [190, 140, 1.1], [296, 62, .9], [310, 70, 1], [324, 60, 1.1], [338, 72, .9],
  [448, 78, 1], [462, 90, 1.1], [474, 78, .9], [556, 196, 1], [568, 210, .9], [574, 180, 1.1],
  [552, 318, 1], [566, 306, .9], [540, 344, 1.1], [300, 372, 1], [286, 384, .9], [314, 388, 1.1], [330, 376, .9],
  [214, 352, 1], [228, 364, 1.1], [242, 350, .9], [206, 372, .9], [236, 268, .9], [250, 280, 1], [412, 262, 1], [426, 274, .9],
  [250, 168, .9], [432, 150, 1], [446, 162, .9], [392, 300, 1], [376, 312, .9],
];

const WAVES: readonly (readonly [number, number])[] = [
  [34, 62], [58, 176], [30, 300], [52, 372], [140, 432], [262, 440], [410, 444], [560, 414], [628, 330], [634, 150], [610, 86], [520, 24], [386, 16], [214, 20], [96, 56], [636, 250],
];

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

function House({ x, y, w = 22, roof = '#c8553c', wall = '#f1e6cc' }: { readonly x: number; readonly y: number; readonly w?: number; readonly roof?: string; readonly wall?: string }) {
  const h = w * .52;
  return <g transform={`translate(${x} ${y})`} stroke={INK} strokeWidth=".9" strokeLinejoin="round">
    <ellipse cx={w * .1} cy={h * .5 + 1.5} rx={w * .62} ry="2.6" fill="#294a2a" stroke="none" opacity=".28"/>
    <path fill={wall} d={`M${-w / 2} ${-h / 2}h${w}v${h}h${-w}Z`}/>
    <path fill={roof} d={`M${-w / 2 - 2.5} ${-h / 2}L0 ${-h / 2 - w * .34}L${w / 2 + 2.5} ${-h / 2}Z`}/>
    <path fill="#6b4a2c" d={`M-2 ${h / 2}v${-h * .5}h4v${h * .5}Z`}/>
  </g>;
}

/** Off the trail: a bottle on the swell, two houses wall to wall, and a ship that is barely there. */
function Hideouts() {
  return <>
    <g className="isle-bottle" stroke={INK} strokeWidth=".8" strokeLinejoin="round">
      <ellipse cx="49" cy="212" rx="11" ry="3" fill="#d8f6ee" stroke="none" opacity=".6"/>
      <g transform="translate(5 0) rotate(-24 44 204)">
        <path d="M40 198h8v12q0 3-4 3t-4-3Z" fill="#9fd8b8" fillOpacity=".85"/>
        <path d="M42.4 193h3.2v5h-3.2Z" fill="#9fd8b8"/>
        <path d="M42 190.6h4v2.6h-4Z" fill="#a8743f"/>
        <path d="M41.6 201h4.8v7h-4.8Z" fill="#fff6dc" strokeWidth=".5"/>
      </g>
    </g>
    <g stroke={INK} strokeWidth=".8" strokeLinejoin="round">
      <ellipse cx="614" cy="388" rx="25" ry="11" fill="#d2f5ec" stroke="none" opacity=".5"/>
      <ellipse cx="614" cy="387" rx="20" ry="8.5" fill="#f3e2ae"/>
      <ellipse cx="614" cy="385.5" rx="15" ry="5.5" fill="#a6d16c" stroke="#4f7d38"/>
    </g>
    <House x={608} y={380} w={12} roof="#b0563a"/>
    <House x={620} y={380} w={12} roof="#b0563a"/>
    <g className="isle-ghost">
      <ellipse cx="616" cy="66" rx="30" ry="13" fill="#eef4f6" opacity=".55"/>
      <ellipse cx="600" cy="58" rx="16" ry="8" fill="#f6fafb" opacity=".5"/>
      <ellipse cx="634" cy="60" rx="13" ry="7" fill="#f6fafb" opacity=".45"/>
      <g opacity=".62" stroke="#3f6474" strokeWidth=".8" strokeLinejoin="round">
        <path d="M602 66h28l-4 7h-20Z" fill="#b9d6de"/>
        <path d="M611 66V46m9 20V50" strokeWidth="1"/>
        <path d="M611 48l-7 12 7 2Zm0 1 6 9-6 3Z" fill="#eaf4f6"/>
        <path d="M620 52l6 9-6 2Z" fill="#eaf4f6"/>
        <path d="M606 62l2 3m10-6 1 4" strokeWidth=".5"/>
      </g>
      <ellipse cx="616" cy="75" rx="24" ry="6" fill="#f6fafb" opacity=".6"/>
    </g>
  </>;
}

export function Isle() {
  return <>
    <defs>
      <radialGradient id="isle-land" cx=".46" cy=".42" r=".7">
        <stop stopColor="#c3e486"/><stop offset=".6" stopColor="#a6d16c"/><stop offset="1" stopColor="#8fbf5c"/>
      </radialGradient>
      <g id="isle-tree">
        <ellipse cx="1.6" cy=".8" rx="5.2" ry="1.7" fill="#294a2a" opacity=".26"/>
        <path d="M0 0V-3" stroke="#6b4a2c" strokeWidth="1.4"/>
        <circle cy="-6" r="4.6" fill="#5fae4e" stroke="#2f5d2b" strokeWidth=".9"/>
        <path d="M-2.4-7.4a3 3 0 0 1 3.2-2" stroke="#bfe58c" strokeWidth=".9"/>
      </g>
      <g id="isle-pine">
        <ellipse cx="1.4" cy=".8" rx="4.6" ry="1.5" fill="#294a2a" opacity=".26"/>
        <path d="M0 0V-3" stroke="#6b4a2c" strokeWidth="1.3"/>
        <path d="M0-13 4.6-2.4H-4.6Z" fill="#3f8a4c" stroke="#234a2a" strokeWidth=".9"/>
        <path d="M0-13-4.6-2.4H0Z" fill="#57a65c"/>
      </g>
      <g id="isle-bush">
        <ellipse cx="1" cy="1.2" rx="6" ry="1.6" fill="#294a2a" opacity=".22"/>
        <path d="M-6 1q-1-5 3-5 1-3 4-1 4-1 4 3 1 3-2 3Z" fill="#6cb858" stroke="#2f5d2b" strokeWidth=".8"/>
      </g>
      <clipPath id="isle-clip"><path d={COAST}/></clipPath>
    </defs>

    {/* sea marks */}
    <g stroke="#d5f1ee" strokeWidth=".9" opacity=".6">
      {WAVES.map(([x, y]) => <path key={`${x}-${y}`} d={`M${x} ${y}q3-3 6 0t6 0`}/>)}
    </g>
    <rect x="9" y="9" width="642" height="436" stroke="#17405a" strokeWidth="1.1" opacity=".75"/>
    <rect x="12.5" y="12.5" width="635" height="429" stroke="#17405a" strokeWidth=".5" opacity=".5"/>

    {/* shallows, beach, land */}
    <path d={COAST} stroke="#bfeee6" strokeWidth="40" opacity=".28" strokeLinejoin="round"/>
    <path d={COAST} stroke="#d2f5ec" strokeWidth="24" opacity=".45" strokeLinejoin="round"/>
    <path className="isle-foam" d={COAST} stroke="#ffffff" strokeWidth="14" strokeLinejoin="round" opacity=".85"/>
    <path d={COAST} stroke="#f3e2ae" strokeWidth="11" strokeLinejoin="round"/>
    <path d={COAST} fill="url(#isle-land)" stroke="#4f7d38" strokeWidth="1.3"/>
    <g clipPath="url(#isle-clip)">
      <ellipse cx="170" cy="150" rx="80" ry="46" fill="#7fb556" opacity=".35" transform="rotate(-24 170 150)"/>
      <ellipse cx="520" cy="250" rx="66" ry="92" fill="#86ba58" opacity=".3"/>
      <ellipse cx="300" cy="380" rx="110" ry="34" fill="#7fb556" opacity=".32"/>
      <ellipse cx="360" cy="120" rx="130" ry="40" fill="#d6ec98" opacity=".35"/>
      <g stroke="#6f9a48" strokeWidth=".8" opacity=".6">
        {[[212, 222], [262, 206], [402, 196], [450, 226], [272, 318], [418, 330], [356, 162], [300, 132], [470, 300], [196, 300]].map(([x, y]) =>
          <path key={`${x}-${y}`} d={`M${x} ${y}q5-6 10 0`}/>)}
      </g>
      {/* the canal cuts the east side down to the south shore */}
      <path d={CANAL} stroke="#3f7f9c" strokeWidth="11.5"/>
      <path d={CANAL} stroke="#74c8de" strokeWidth="8.5"/>
      <path d={CANAL} stroke="#d8f6f2" strokeWidth=".9" strokeDasharray="5 9" opacity=".8"/>
    </g>

    {/* low hills, to give the meadow a back */}
    <g stroke="#5f8f42" strokeWidth=".9">
      {[[226, 196, 1.1], [444, 240, 1], [270, 262, .9], [396, 150, 1.2], [470, 180, .9], [216, 310, 1], [372, 352, 1.1], [512, 232, .9]].map(([x, y, k]) =>
        <g key={`${x}-${y}`} transform={`translate(${x} ${y}) scale(${k})`}>
          <path d="M-13 3Q-6-9 2-6T14 3Z" fill="#b6dc7c" stroke="none"/>
          <path d="M-13 3Q-6-9 2-6T14 3"/><path d="M-4-2q3-2 6 0" strokeWidth=".6" opacity=".7"/>
        </g>)}
    </g>
    {/* a tilled field by the yard and a little pond in the south meadow */}
    <g stroke={INK} strokeWidth=".8" strokeLinejoin="round">
      <path d="m204 246 30-6 6 24-30 6Z" fill="#d9c877"/>
      <path d="m210 245 6 24m6-26 6 24m6-25 6 24" stroke="#a8963f" strokeWidth=".6"/>
      <ellipse cx="282" cy="350" rx="15" ry="8" fill="#74c8de"/><path d="M274 349q4-3 8 0m2 3q3-2 6 0" stroke="#d8f6f2" strokeWidth=".7"/>
    </g>
    {FLOWERS.map(([x, y, color]) => <circle key={`${x}-${y}`} cx={x} cy={y} r="1.3" fill={color} stroke="#4f7d38" strokeWidth=".4"/>)}
    {BUSHES.map(([x, y]) => <use key={`${x}-${y}`} href="#isle-bush" transform={`translate(${x} ${y})`}/>)}
    {PINES.map(([x, y, k]) => <use key={`${x}-${y}`} href="#isle-pine" transform={`translate(${x} ${y}) scale(${k})`}/>)}
    {TREES.map(([x, y, k]) => <use key={`${x}-${y}`} href="#isle-tree" transform={`translate(${x} ${y}) scale(${k})`}/>)}

    {/* 1 · the pier */}
    <g stroke={INK} strokeWidth=".9" strokeLinejoin="round">
      <path fill="#b88a52" d="m112 356 9 7-36 41-9-7Z"/>
      <path stroke="#7a5230" strokeWidth=".7" d="m106 363 9 7m-15 0 9 7m-15 0 9 7m-15 0 9 7m-15 0 9 7"/>
      <path fill="#6b4a2c" d="M74 394h3v9h-3zm12 10h3v8h-3z"/>
    </g>
    <House x={158} y={318} w={20} roof="#3a7ab0"/>
    <Boat x={60} y={398} s={1.05} sail="#f2c9a0"/>
    <Boat x={100} y={418} s={.85}/>

    {/* 2 · the drill yard */}
    <g stroke={INK} strokeWidth=".9" strokeLinejoin="round">
      <path fill="#e2d4aa" d="M188 190h46v40h-46Z"/>
      <path stroke="#b9a777" strokeWidth=".6" d="M188 203h46m-46 14h46M203 190v40m16-40v40"/>
      <g fill="#8f96aa" strokeWidth=".7">
        {[0, 1, 2, 3].flatMap((column) => [0, 1, 2].map((row) => <path key={`${column}-${row}`} d={`M${193.5 + column * 11.2} ${197 + row * 12}h3.4v-5.4h-3.4Z`}/>))}
      </g>
      <path d="M184 196v-22" strokeWidth="1.1"/><path className="isle-flag" fill="#c8553c" d="m184 174 11 3.4-11 3.4Z"/>
    </g>

    {/* 3 · the dye works */}
    <House x={270} y={88} w={24} roof="#b03a66" wall="#f4ead2"/>
    <g stroke={INK} strokeWidth=".9">
      <circle cx="262" cy="116" r="6.2" fill="#7a5a3a"/><circle cx="262" cy="116" r="4.2" fill="#d8483a"/>
      <circle cx="277" cy="120" r="6.2" fill="#7a5a3a"/><circle cx="277" cy="120" r="4.2" fill="#f0c030"/>
      <circle cx="292" cy="114" r="6.2" fill="#7a5a3a"/><circle cx="292" cy="114" r="4.2" fill="#3a7ad8"/>
      <path d="M304 83v15m38-15v15" strokeWidth="1.1"/><path d="M304 85q19 5 38 0" strokeWidth=".7"/>
      <path className="isle-cloth" fill="#d8483a" d="m308.5 86.6 6 .9v9l-6-.9Z"/>
      <path className="isle-cloth" style={{ animationDelay: '-.9s' }} fill="#f0c030" d="m319.6 88h6v9h-6Z"/>
      <path className="isle-cloth" style={{ animationDelay: '-1.7s' }} fill="#3a7ad8" d="m331 87.5 6-.9v9l-6 .9Z"/>
    </g>

    {/* 4 · the print shop */}
    <g stroke={INK} strokeWidth=".9" strokeLinejoin="round">
      <ellipse cx="413" cy="86" rx="19" ry="3" fill="#294a2a" stroke="none" opacity=".28"/>
      <path fill="#d9d2c2" d="M396 66h32v19h-32Z"/><path fill="#5d6a7c" d="m393 66 19-11 19 11Z"/>
      <path fill="#8a5a3a" d="M421 52h5v9h-5Z"/><path fill="#6b4a2c" d="M409 85v-9h6v9Z"/>
      <path fill="#fffaf0" d="M400 71h6v5h-6Zm17 0h6v5h-6Z"/>
      <g className="isle-wheel">
        <circle cx="398" cy="102" r="6" fill="#7a5230"/><circle cx="398" cy="102" r="2" fill="#e8c76c"/>
        <path d="M398 96v12m-6-6h12" strokeWidth=".7"/>
      </g>
      <path fill="#fffaf0" d="m410 98 12-2 1.6 8-12 2Z"/><path stroke="#8a8478" strokeWidth=".5" d="m412.6 100 7-1.2m-6.6 3.6 7-1.2"/>
    </g>

    {/* 5 · the warehouse */}
    <g stroke={INK} strokeWidth=".9" strokeLinejoin="round">
      <ellipse cx="545" cy="150" rx="24" ry="3.2" fill="#294a2a" stroke="none" opacity=".28"/>
      <path fill="#e6d2a4" d="M524 128h40v21h-40Z"/><path fill="#8a5230" d="m520 128 8-12h32l8 12Z"/>
      <path fill="#5a3a1e" d="M538 149v-12h12v12Z"/><path d="M544 137v12" strokeWidth=".6"/>
      <g fill="#c79a5e"><path d="M532 160h9v9h-9Zm10 0h9v9h-9Zm-5-9h9v9h-9Z"/></g>
      <path stroke="#7a5230" strokeWidth=".6" d="m532 160 9 9m1-9 9 9m-14-18 9 9"/>
    </g>

    {/* 6 · bridge and barges on the canal */}
    <g stroke={INK} strokeWidth=".9" strokeLinejoin="round">
      <path fill="#b88a52" d="m484 330 26 8-2.4 7-26-8Z"/><path stroke="#7a5230" strokeWidth=".6" d="m490 332-2.2 7m8-5-2.2 7m8-5-2.2 7"/>
      <path fill="#a8643a" d="m548 250 11-5 2.4 4-11 5.6Z"/><path fill="#f2c9a0" d="m551 250 5-2.4 1 2-5 2.4Z"/>
      <path fill="#a8643a" d="m488 372 2-11 4.4.8-2 11Z"/>
    </g>
    <House x={562} y={282} w={18} roof="#4a9a8a"/>

    {/* 7 · the lighthouse on its rock */}
    <g stroke={INK} strokeWidth=".9" strokeLinejoin="round">
      <path fill="#9aa39a" d="m424 398 6-9 9-3 9 2 7 8-3 6-22 1Z"/><path stroke="#6c756d" strokeWidth=".6" d="m431 392 5 4m6-6 4 6"/>
      <path fill="#fffaf0" d="m434 390 2.6-24h6.8l2.6 24Z"/>
      <path fill="#d8483a" d="m434.9 382 .9-7.6h8.4l.9 7.6Z"/>
      <path fill="#3d3226" d="M434 366h12v-2.4h-12Z"/><path fill="#ffe890" d="M436.6 363.6v-5.6h6.8v5.6Z"/><path fill="#d8483a" d="m435.4 358 4.6-4.4 4.6 4.4Z"/>
    </g>

    {/* 8 · the great hall, in the middle of everything */}
    <g>
      <circle cx="330" cy="227" r="55" fill="#ecdfba" opacity=".8" stroke="#a89a6c" strokeWidth=".9"/>
      <circle cx="330" cy="227" r="55" stroke="#fffaf0" strokeWidth="4.5" strokeDasharray="2.4 9.1"/>
      <circle cx="330" cy="227" r="55" stroke={INK} strokeWidth=".7" opacity=".5"/>
      <circle cx="330" cy="227" r="33" stroke="#c9b98a" strokeWidth="1.6"/>
      <circle cx="330" cy="227" r="19" fill="#f6efd8" stroke="#a89a6c" strokeWidth=".9"/>
      <circle cx="330" cy="227" r="19" stroke="#72f2e0" strokeWidth="1.2" strokeDasharray="1.5 4" opacity=".9"/>
      <g stroke={INK} strokeWidth=".8" strokeLinejoin="round">
        {[0, 1, 2, 3, 4, 5, 6, 7].map((step) => {
          const angle = (step * 45 + 22.5) * Math.PI / 180;
          const x = 330 + Math.cos(angle) * 44;
          const y = 227 + Math.sin(angle) * 44;
          return <g key={step}><path d={`M${x - 2.2} ${y + 3}v-9h4.4v9Z`} fill="#fffaf0"/><path d={`M${x - 3.2} ${y - 6}h6.4l-3.2-3.4Z`} fill="#3a7ab0"/></g>;
        })}
        <path d="M324 233v-14l6-5 6 5v14Z" fill="#8f96aa"/>
        <path d="M330 219v11m-3.4-8 3.4 3 3.4-3m-6.8 6 3.4-3 3.4 3" stroke="#8cfff0" strokeWidth="1.2"/>
      </g>
    </g>

    {/* chart lettering */}
    <g fill="#12384f" fontFamily="Georgia, serif">
      <text x="496" y="430" fontSize="7" letterSpacing="1.4">ISLA DEL APRENDIZ</text>
      <path stroke="#12384f" strokeWidth=".7" d="M496 434h92m3 0h6" opacity=".7"/>
      <text x="496" y="441" fontSize="4.4" letterSpacing=".9" opacity=".8">CARTA DE PRIMERAS RUNAS</text>
    </g>
    <Hideouts/>
    <g stroke={INK} strokeWidth=".8">
      <ellipse cx="38" cy="124" rx="13" ry="7" fill="#f3e2ae"/><ellipse cx="38" cy="123" rx="8" ry="4" fill="#a6d16c" stroke="#4f7d38"/>
      <path d="M38 122v-9" stroke="#6b4a2c" strokeWidth="1.2"/><path fill="#5fae4e" stroke="#2f5d2b" d="m38 113-7-2 5-2-3-4 5 2 1-4 2 4 5-2-3 4 5 2-7 2Z"/>
    </g>
  </>;
}
