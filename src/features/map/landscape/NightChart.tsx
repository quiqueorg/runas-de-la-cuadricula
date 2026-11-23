/** Ink drawn over the final battle's night chart: three constellations and a faint arc. */

/** The first star of each constellation is the brightest. */
const LEAD_STAR_RADIUS = 1.6;
const STAR_RADIUS = 1.1;

export function NightChart() {
  return (
    <>
      {[
        '49,328 60,318 73,321 84,309',
        '443,53 455,43 467,49 480,39',
        '535,343 543,355 559,358 567,367',
      ].map((points) => (
        <g key={points}>
          <polyline points={points} stroke="#b3a9cb" strokeWidth=".7" opacity=".5" />
          {points.split(' ').map((point, star) => {
            const [x, y] = point.split(',');
            const radius = star === 0 ? LEAD_STAR_RADIUS : STAR_RADIUS;
            return <circle key={point} cx={x} cy={y} r={radius} fill="#eee1bd" />;
          })}
        </g>
      ))}
      <path
        stroke="#d6b3ae"
        opacity=".38"
        d="M251 241c-17 19 23 29 74 20m19-4c39-9 67-23 69-35m-3-6-3-2"
      />
    </>
  );
}
