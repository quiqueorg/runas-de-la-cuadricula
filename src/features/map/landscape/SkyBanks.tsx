/** Ink drawn over the sky world's chart: wind lines, the ruined skyway, the title and a scale. */

/** The scale along the top and bottom edges: a tick every 20 units, a longer one every fifth. */
const SCALE_TICKS = {
  count: 31,
  first: 30,
  gap: 20,
  majorEvery: 5,
  major: 3.5,
  minor: 1.6,
} as const;

/** A pier of the old skyway, with an arch on the ones that still stand. */
function SkywayPier({
  x,
  y,
  scale,
  arch = false,
}: {
  readonly x: number;
  readonly y: number;
  readonly scale: number;
  readonly arch?: boolean;
}) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`} strokeWidth=".7" strokeLinejoin="round">
      <path fill="#8b8c87" stroke="#62686a" d="M-15 0l20-5 11 4-4 9-6 2-3 10-5-5-4 2-6-9Z" />
      <path fill="#606c70" d="m5 2 11-3-4 9-6 2-3 10 2-10-3-2Z" />
      <path fill="#d4c9a0" stroke="#797b69" d="m-15 0 19-5 12 4L-3 5Z" />
      <path fill="#a9ac7b" d="m-14 0 9-2 5 1-7 3Zm18-4 6 2-4 1-5-2Z" />
      <path stroke="#b2aa92" d="m-10 4 4 6 1 4m3-8 3 3" />
      <path fill="#ded7bc" stroke="#7c8075" d="m-9-1 12-3 6 2L-3 2Z" />
      {arch && (
        <g>
          <path fill="#dcd6b9" stroke="#696e69" d="m-9-1 1-14 4-2 1 3-1 12Zm12-3 1-15 4-1 1 15Z" />
          <path fill="#929b8c" d="m-5-15 2 1-1 12-2 1Zm12-4 1-1 1 15-3 1Z" />
          <path
            fill="#c8c5a5"
            stroke="#696e69"
            d="m-10-16 6-3 3 1-2 3-7 2Zm12-4 6-2 3 2-2 2-7 1Z"
          />
          <path stroke="#688b82" strokeWidth="1.6" d="m-8-11 4-1m8-3 3-.8" />
        </g>
      )}
    </g>
  );
}

export function SkyBanks() {
  return (
    <>
      <g stroke="#526878" strokeWidth=".7" opacity=".55">
        <path d="M80 150C132 149 142 125 141 99S144 58 162 46M87 154C139 152 149 128 147 101S151 61 165 52" />
        <path d="M300 179C342 172 372 148 379 117S384 71 415 54M327 178C360 167 379 147 384 122S390 83 407 71" />
        <path d="m141 102 .1-6-2 4m240 21 1-6-3 4" />
      </g>
      <g className="skyway-ruins">
        <SkywayPier x={132} y={143} scale={0.72} arch />
        <SkywayPier x={150} y={135} scale={0.42} />
        <SkywayPier x={278} y={202} scale={0.85} arch />
        <SkywayPier x={303} y={192} scale={0.48} />
        <SkywayPier x={330} y={181} scale={0.62} />
        <SkywayPier x={409} y={95} scale={0.55} arch />
      </g>
      <g fill="#374959" fontFamily="Georgia, serif">
        <text x="63" y="24" fontSize="6.3" letterSpacing="1.1">
          CARTA DE LOS ALISIOS
        </text>
        <path stroke="#877451" strokeWidth=".7" d="M63 28h77m3 0h5" />
        <text x="63" y="35" fontSize="4.4" letterSpacing=".85">
          ATLAS CELESTE · I
        </text>
        <text x="325" y="169" fontSize="4.7" fontStyle="italic" transform="rotate(-20 325 169)">
          Viento de altura
        </text>
      </g>
      <g stroke="#625b4c" opacity=".53" strokeWidth=".65">
        {Array.from({ length: SCALE_TICKS.count }, (_, tick) => {
          const x = SCALE_TICKS.first + tick * SCALE_TICKS.gap;
          const length =
            tick % SCALE_TICKS.majorEvery === 0 ? SCALE_TICKS.major : SCALE_TICKS.minor;
          return <path key={x} d={`M${x} 9v${length}M${x} 445v-${length}`} />;
        })}
      </g>
    </>
  );
}
