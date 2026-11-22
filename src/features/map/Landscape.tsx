import type { WorldId } from '../../core/models';
import { Isle } from './Isle';
import scenery from './scenery.json';

function Volcano() {
  const [x, y] = scenery.grid.volcan;
  const fissure = 'M1 0l-2 6 3 4-1 7 6 5 3 7 7 5 3 4';
  return <g transform={`translate(${x * 660} ${y * 454})`}>
    <defs>
      <linearGradient id="basalt" x2=".8" y2="1" gradientUnits="objectBoundingBox">
        <stop stopColor="#c39777"/><stop offset=".46" stopColor="#926b5e"/><stop offset="1" stopColor="#534857"/>
      </linearGradient>
      <linearGradient id="ash" x2=".2" y2="1">
        <stop stopColor="#b3a9a4"/><stop offset=".55" stopColor="#84797e"/><stop offset="1" stopColor="#625863"/>
      </linearGradient>
    </defs>
    <path fill="url(#basalt)" stroke="#655651" strokeWidth=".6" d="M-26 37l10-13 4-12 5-8-3-3 4-4 5 2 4-2 6 1 4 6 4 11 8 9 7 10 9 7-12 2-8-2-7 3-8-4-9 1-6-5-9 3Z"/>
    <path fill="#655460" d="m6 0 5 2 9 17 8 7 5 9 9 6-14-1-11-8-4-11-6-9Z"/>
    <path fill="#aa826f" d="m-6 3-2 12-7 10-5 9 11-9 5-13 4-7Z"/>
    <path fill="none" stroke="#705951" strokeWidth=".8" d="m-4 8-2 10-6 6-3 6m22-17 3 5 2 9 6 7m7-9 3 6 7 6"/>
    <path fill="#493839" stroke="#ba826c" strokeWidth="1" d="m-10-1 4-4 6 2 4-2 7 3-4 3-7 2-5-1Z"/>
    <path fill="#f89a53" d="m-6 0 5-1 4 1 5-1-4 2-5 .8Z"/>
    <path d={fissure} stroke="#8b483e" strokeWidth="2.4"/>
    <path d={fissure} stroke="#e98a48" strokeWidth="1.15"/>
    <path className="lava-current" d={fissure} stroke="#ffda78" strokeWidth=".85" strokeDasharray="3 18"/>
    <path fill="none" stroke="#d87945" strokeWidth=".8" d="m0 9-3 4-1 7-5 8-3 5"/>
    {[-1,-3.8,-6.4].map(delay => <path key={delay} className="ash-drift" style={{animationDelay:`${delay}s`}} fill="url(#ash)" d="M-3 0q-5-2-3-5-5-1-4-5 1-4 5-4-1-4 4-5 5-1 7 2 6-2 8 2 6 1 4 6-2 3-8 3-4 1-6 4Z"/>)}
  </g>;
}

function Woods() {
  return <>
    <defs>
      <g id="atlas-oak">
        <ellipse cx="2" cy=".1" rx="5.4" ry="1.4" fill="#294a39" opacity=".28"/>
        <path d="M0 0l.2-4" stroke="#694f38" strokeWidth="1.5"/>
        <path fill="#476746" stroke="#405b42" strokeWidth=".45" d="M-4-3q-3-2-1-5 0-3 3-3 2-4 5-1 4 0 4 4 2 4-2 5-2 2-5 0Z"/>
        <path fill="#719055" d="M-5-6q-2-3 2-4 2-4 5-2l2 2-3 1-1 2Z"/>
        <path fill="#a3ac68" d="M-3-9q1-3 4-3l-1 1.5Z"/>
      </g>
    </defs>
    {[[427,139,.48],[431,151,.57],[424,168,.68],[454,194,.76],[475,200,.68],[236,310,.72],[258,318,.89],[225,337,.8],[267,346,.91],[318,362,.8],[284,377,.98],[299,398,1.03]].map(([x,y,s]) =>
      <g key={x} transform={`translate(${x} ${y}) scale(${s})`}>
        <use href="#atlas-oak" transform="translate(-5 -3) scale(.76)"/>
        <use href="#atlas-oak" transform="translate(3 -4) scale(.85)"/>
        <use href="#atlas-oak" transform="translate(0 2)"/>
      </g>)}
  </>;
}

function SurfaceRelief() {
  return <g>
    <defs>
      <linearGradient id="dune-slope" x1="0" y1="0" x2=".35" y2="1">
        <stop stopColor="#b98951" stopOpacity=".72"/><stop offset="1" stopColor="#deb477" stopOpacity="0"/>
      </linearGradient>
      <g id="atlas-dune">
        <path fill="url(#dune-slope)" d="M-19 3Q-11 3-3-2T10-6Q9-2 18 3 8 2 0 5T-19 3Z"/>
        <path stroke="#fff0bc" strokeWidth=".8" d="M-18 3Q-10 2-3-2T10-6"/>
        <path stroke="#a88250" opacity=".55" strokeWidth=".45" d="M5-3 8-1m-6 0 3 2m-5 0 2 1"/>
      </g>
      <linearGradient id="shelf-water" x1="0" y1="0" x2="0" y2="1">
        <stop stopColor="#9ee2cb" stopOpacity=".38"/><stop offset="1" stopColor="#5097ab" stopOpacity="0"/>
      </linearGradient>
      <linearGradient id="mesa-face" x1="0" y1="0" x2=".2" y2="1">
        <stop stopColor="#8c5243"/><stop offset=".55" stopColor="#ba7955"/><stop offset="1" stopColor="#d19664"/>
      </linearGradient>
      <g id="atlas-ledge">
        <path fill="#825849" opacity=".24" d="m-12 3 15-4 15 3-10 5-16 1Z"/>
        <path fill="url(#mesa-face)" d="m-12 0 9-4 11 .5 3 2 2 5-9 2-7-1-11 1Z"/>
        <path fill="#e1b180" d="m-12 0 9-4 11 .5 3 2-9 2.2-7-.6Z"/>
        <path stroke="#844f41" strokeWidth=".55" d="m-10 1 5-.4 7 .6 8-1.8m-3 3.2 4-.8M-1 2l.6 2"/>
      </g>
      <radialGradient id="ridge-shade"><stop stopColor="#314e55" stopOpacity=".35"/><stop offset="1" stopColor="#46585b" stopOpacity="0"/></radialGradient>
      <g id="atlas-fold">
        <path fill="#617944" opacity=".19" d="M-19 3Q-8-8 3-5 11-4 20 0 6-1-2 3T-19 3Z"/>
        <path stroke="#e4de9e" strokeWidth=".7" d="M-18 2Q-8-7 1-5t12 3"/>
        <path stroke="#768752" strokeWidth=".45" opacity=".65" d="m-12 3 2-2m1 2 2-2m1 1 2-2"/>
      </g>
    </defs>
    <g>
      <path fill="url(#shelf-water)" d="M102 382q23 3 45-7t47-1q19 5 38 1 13 2 23 15 19 24 51 23 17 0 40-9 32-8 46-1 33 14 68 7 28-6 52-5-27 26-72 27-47 1-79-8-48 19-85 8-28-7-43-29-14-14-44-11-53-7-87 7Z"/>
      <g stroke="#c8eade" strokeWidth=".7" opacity=".55">
        <path d="M106 384q17 3 33-3m14-5q18-4 37 1m13 1 15-1m21 3q8 5 14 14m8 7q15 15 36 16m10 0 12-1m15-4q18-7 30-7m43 8q19 6 37 3m6-1 10-2"/>
        <path d="M255 404q11 12 29 15m94-9 11 1m49 9 14-2" opacity=".6"/>
      </g>
    </g>
    <ellipse cx="337" cy="125" rx="87" ry="30" fill="url(#ridge-shade)" transform="rotate(-8 337 125)"/>
    <g stroke="#655f6e" opacity=".58" strokeWidth=".7">
      <path d="m302 27 3 12 4 4m-7-10 2 9m24-19 3 10 4 6m-3-5 2 9m21-15 4 12 4 5m-5-9 2 9M289 64l3 9 3 3m27-15 1 8 4 4m14 10 3 10 4 5m-3-7 1 6m-40 4 3 7 4 4"/>
    </g>
    {[[173,89,.64],[205,97,.82],[151,116,.8],[197,128,.68],[239,108,.65],[176,159,.88]].map(([x,y,s]) =>
      <use key={x} href="#atlas-dune" transform={`translate(${x} ${y}) scale(${s})`}/>)}
    {[[230,207,.75],[203,238,.98],[293,203,.86],[331,260,.85],[365,234,.66],[158,285,.72],[282,284,.85]].map(([x,y,s]) =>
      <use key={x} href="#atlas-fold" transform={`translate(${x} ${y}) scale(${s})`}/>)}
    {[[371,339,.62],[389,357,.8],[399,382,.95],[439,389,.74],[469,375,.56]].map(([x,y,s]) =>
      <use key={x} href="#atlas-ledge" transform={`translate(${x} ${y}) scale(${s})`}/>)}
    <g stroke="#985e48" strokeWidth=".65" opacity=".65">
      <path d="M365 344q7 3 14 1l6-3m-17 5q8 2 12 0m14 15 10-2 6-4 7-1m-16 8 5-1m-13 24 11 3 10-2m3-1 6-3m19 10 8-1 5-4m13-9 6-2"/>
    </g>
  </g>;
}

function Coast() {
  return <>
    <SurfaceRelief/><Volcano/><Woods/>
    <g stroke="#d5f1de" opacity=".66">
      <path d="M26 151q10 2 23 0m6-2 9-1M32 155l9 .5M76 204q-5 8-7 16m-2 7-2 8M72 231l-4 13M89 348q-7 10-10 20m5-6-3 10M255 407q33 13 64 2m9-3 12-4M271 414q18 5 36 1M527 375q13-10 19-23m-5 19 6-8"/>
      <path d="M55 77q5-2 10 0m3 0 7-1M577 286q7-2 15-1m4 0 5-1M104 414q6-2 12 0m5 0 5-1"/>
    </g>
    <g stroke="#976e40" opacity=".52">
      <path d="M138 128q13-9 31-8m-20 10q7-4 15-5"/>
      <path d="M151 93q9-7 24-7m-15 9 8-3M188 146q10-7 23-6m-13 7 7-2"/>
    </g>
    <g stroke="#587542" opacity=".72">
      {[[202,253],[231,225],[279,189],[192,279],[147,304],[368,249],[209,214]].map(([x,y]) =>
        <path key={x} transform={`translate(${x} ${y})`} d="M-4 0l-2-2m3 3 1-4m1 3 3-2m3 4 2-2"/> )}
    </g>
  </>;
}

function Caverns() {
  return <>
    <g stroke="#988272" opacity=".52">
      <path d="M183 149l10-5 5-8 13-2m-18 10 7 2M335 318l11-6 4-9 9-5m-13 14 10 1M530 105l7-8 12-2 5-6m-17 8 3-7M49 292l8-7 11 1 6-5"/>
    </g>
    <g fill="#a9d3d4" stroke="#574f72" strokeWidth=".8">
      {[[529,194],[568,253],[583,170],[539,225]].map(([x,y],i) =>
        <g key={x} transform={`translate(${x} ${y}) rotate(${i*9-12})`}>
          <path d="M-4 1l-3-6 2-2 4 6L0-8l3-4 2 4-4 10Z"/>
          <path d="M3-10 1 0" stroke="#efefd9"/>
        </g>)}
    </g>
    <path stroke="#addce2" opacity=".6" d="M433 84q9 3 18 1m12-17q8 2 15 0m-39 33q6 2 14 0"/>
  </>;
}

function SkywayPier({ x, y, scale, arch = false }: { x: number; y: number; scale: number; arch?: boolean }) {
  return <g transform={`translate(${x} ${y}) scale(${scale})`} strokeWidth=".7" strokeLinejoin="round">
    <path fill="#8b8c87" stroke="#62686a" d="M-15 0l20-5 11 4-4 9-6 2-3 10-5-5-4 2-6-9Z"/>
    <path fill="#606c70" d="m5 2 11-3-4 9-6 2-3 10 2-10-3-2Z"/>
    <path fill="#d4c9a0" stroke="#797b69" d="m-15 0 19-5 12 4L-3 5Z"/>
    <path fill="#a9ac7b" d="m-14 0 9-2 5 1-7 3Zm18-4 6 2-4 1-5-2Z"/>
    <path stroke="#b2aa92" d="m-10 4 4 6 1 4m3-8 3 3"/>
    <path fill="#ded7bc" stroke="#7c8075" d="m-9-1 12-3 6 2L-3 2Z"/>
    {arch && <g>
      <path fill="#dcd6b9" stroke="#696e69" d="m-9-1 1-14 4-2 1 3-1 12Zm12-3 1-15 4-1 1 15Z"/>
      <path fill="#929b8c" d="m-5-15 2 1-1 12-2 1Zm12-4 1-1 1 15-3 1Z"/>
      <path fill="#c8c5a5" stroke="#696e69" d="m-10-16 6-3 3 1-2 3-7 2Zm12-4 6-2 3 2-2 2-7 1Z"/>
      <path stroke="#688b82" strokeWidth="1.6" d="m-8-11 4-1m8-3 3-.8"/>
    </g>}
  </g>;
}

function SkyBanks() {
  return <>
    <g stroke="#526878" strokeWidth=".7" opacity=".55">
      <path d="M80 150C132 149 142 125 141 99S144 58 162 46M87 154C139 152 149 128 147 101S151 61 165 52"/>
      <path d="M300 179C342 172 372 148 379 117S384 71 415 54M327 178C360 167 379 147 384 122S390 83 407 71"/>
      <path d="m141 102 .1-6-2 4m240 21 1-6-3 4"/>
    </g>
    <g className="skyway-ruins">
      <SkywayPier x={132} y={143} scale={.72} arch/>
      <SkywayPier x={150} y={135} scale={.42}/>
      <SkywayPier x={278} y={202} scale={.85} arch/>
      <SkywayPier x={303} y={192} scale={.48}/>
      <SkywayPier x={330} y={181} scale={.62}/>
      <SkywayPier x={409} y={95} scale={.55} arch/>
    </g>
    <g fill="#374959" fontFamily="Georgia, serif">
      <text x="63" y="24" fontSize="6.3" letterSpacing="1.1">CARTA DE LOS ALISIOS</text>
      <path stroke="#877451" strokeWidth=".7" d="M63 28h77m3 0h5"/>
      <text x="63" y="35" fontSize="4.4" letterSpacing=".85">ATLAS CELESTE · I</text>
      <text x="325" y="169" fontSize="4.7" fontStyle="italic" transform="rotate(-20 325 169)">Viento de altura</text>
    </g>
    <g stroke="#625b4c" opacity=".53" strokeWidth=".65">
      {Array.from({length: 31}, (_,i) => {
        const x = 30 + i * 20;
        const h = i % 5 === 0 ? 3.5 : 1.6;
        return <path key={x} d={`M${x} 9v${h}M${x} 445v-${h}`}/>;
      })}
    </g>
  </>;
}

function NightChart() {
  return <>
    {['49,328 60,318 73,321 84,309','443,53 455,43 467,49 480,39','535,343 543,355 559,358 567,367'].map(points =>
      <g key={points}>
        <polyline points={points} stroke="#b3a9cb" strokeWidth=".7" opacity=".5"/>
        {points.split(' ').map((point,i) => {
          const [cx,cy] = point.split(',');
          return <circle key={point} cx={cx} cy={cy} r={i === 0 ? 1.6 : 1.1} fill="#eee1bd"/>;
        })}
      </g>)}
    <path stroke="#d6b3ae" opacity=".38" d="M251 241c-17 19 23 29 74 20m19-4c39-9 67-23 69-35m-3-6-3-2"/>
  </>;
}

export function Landscape({ world }: { readonly world: WorldId }) {
  return <svg className={`landscape-ink ink-${world}`} viewBox="0 0 660 454" preserveAspectRatio="none" fill="none" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {world === 'grid' ? <Coast/> : world === 'flex' ? <Caverns/> : world === 'cielo' ? <SkyBanks/> : world === 'base' ? <Isle/> : <NightChart/>}
  </svg>;
}
