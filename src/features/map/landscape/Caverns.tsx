/** Ink drawn over the Flexbox world's caverns: cracks, a crystal cluster and still water. */

/** Each crystal leans a little more than the one before. */
const CRYSTAL_TURN = 9;
const CRYSTAL_TILT = 12;

export function Caverns() {
  return (
    <>
      <g stroke="#988272" opacity=".52">
        <path d="M183 149l10-5 5-8 13-2m-18 10 7 2M335 318l11-6 4-9 9-5m-13 14 10 1M530 105l7-8 12-2 5-6m-17 8 3-7M49 292l8-7 11 1 6-5" />
      </g>
      <g fill="#a9d3d4" stroke="#574f72" strokeWidth=".8">
        {[
          [529, 194],
          [568, 253],
          [583, 170],
          [539, 225],
        ].map(([x, y], index) => (
          <g
            key={x}
            transform={`translate(${x} ${y}) rotate(${index * CRYSTAL_TURN - CRYSTAL_TILT})`}
          >
            <path d="M-4 1l-3-6 2-2 4 6L0-8l3-4 2 4-4 10Z" />
            <path d="M3-10 1 0" stroke="#efefd9" />
          </g>
        ))}
      </g>
      <path stroke="#addce2" opacity=".6" d="M433 84q9 3 18 1m12-17q8 2 15 0m-39 33q6 2 14 0" />
    </>
  );
}
