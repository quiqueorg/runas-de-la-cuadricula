/** Map scenery. Particles stay HTML; every former illustration is a canvas. */
import { useEffect, useRef, type CSSProperties, type ReactNode } from 'react';
import type { WorldId } from '../../core/models';
import { trackMotion } from '../../shared/canvas/motion';
import { observeRenderVisibility } from '../../shared/canvas/visibility';
import { Rune } from '../../shared/icons/Rune';
import { Flag, Flock, Flyer, flyerSize } from './figures';
import { routeSample } from './model';
import { paintAirship, paintBlades, paintBolt, paintFish, paintFlowCanvas, paintMinecart, paintPaperBoat, paintRunes, paintSketch, paintSpout } from './paint';
import scenery from './scenery.json';

type Pair = readonly number[];
type Path = readonly Pair[];

function spot(point: readonly (number | string)[], extra: Record<string, string | number> = {}): CSSProperties {
  const x = typeof point[0] === 'number' ? point[0] : 0;
  const y = typeof point[1] === 'number' ? point[1] : 0;
  const style: Record<string, string | number> = { '--x': x, '--y': y, ...extra };
  return style;
}

function FlowCanvas({ paths, classes }: { readonly paths: readonly { d: Path; dash: number[]; color: string; width: number; speed: number }[]; readonly classes: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pathsRef = useRef(paths);
  pathsRef.current = paths;
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const started = performance.now();
    const draw = (now: number) => paintFlowCanvas(canvas, pathsRef.current, (now - started) / 1000);
    draw(started);
    let stopMotion: (() => void) | null = trackMotion(draw);
    const stopVisibility = observeRenderVisibility(canvas, (visible) => {
      if (visible && !stopMotion) {
        stopMotion = trackMotion(draw);
      } else if (!visible && stopMotion) {
        stopMotion();
        stopMotion = null;
      }
    });
    return () => {
      stopMotion?.();
      stopVisibility();
    };
  }, []);
  return <canvas ref={canvasRef} className={`${classes} rune`} aria-hidden="true" />;
}

function Sketch({ className, style, box, draw, moving = false }: { readonly className: string; readonly style?: CSSProperties; readonly box: readonly [number, number]; readonly draw: (ctx: CanvasRenderingContext2D, time: number) => void; readonly moving?: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawRef = useRef(draw);
  drawRef.current = draw;
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const started = performance.now();
    const paint = (now: number) => paintSketch(canvas, box[0], box[1], drawRef.current, moving ? (now - started) / 1000 : 0);
    paint(started);
    if (!moving) {
      const observer = new ResizeObserver(() => paint(performance.now()));
      observer.observe(canvas);
      return () => observer.disconnect();
    }
    let stopMotion: (() => void) | null = trackMotion(paint);
    const stopVisibility = observeRenderVisibility(canvas, (visible) => {
      if (visible && !stopMotion) {
        stopMotion = trackMotion(paint);
      } else if (!visible && stopMotion) {
        stopMotion();
        stopMotion = null;
      }
    });
    return () => {
      stopMotion?.();
      stopVisibility();
    };
  }, [box, moving]);
  return <canvas ref={canvasRef} className={`${className} rune`} style={style} aria-hidden="true" />;
}

function Along({ points, duration, ping, flight, children, className, style }: { readonly points: Path; readonly duration: number; readonly ping?: boolean; readonly flight?: boolean; readonly children: ReactNode; readonly className: string; readonly style?: CSSProperties }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const node = ref.current;
    if (!node || points.length < 2) return;
    const started = performance.now();
    const loop = (now: number) => {
      const pose = routeSample(points, (now - started) / 1000, duration, flight ? 'flight' : ping ? 'ping' : 'loop');
      node.style.setProperty('--x', String(pose.x));
      node.style.setProperty('--y', String(pose.y));
      node.style.opacity = String(pose.opacity);
    };
    loop(started);
    return trackMotion(loop);
  }, [points, duration, ping, flight]);
  return <div ref={ref} className={className} style={{ position: 'absolute', left: 'calc(var(--x) * 100%)', top: 'calc(var(--y) * 100%)', translate: '-50% -50%', ...style }}>{children}</div>;
}

function smoke(points: readonly Pair[], count: number, small: boolean) {
  return points.flatMap((point, group) => Array.from({ length: count }, (_, puff) => (
    <i key={`${group}-${puff}`} className={small ? 'fx-humo chica' : 'fx-humo'} style={spot(point, { '--d': `${(-puff * 1.8 - group * 0.6).toFixed(1)}s` })} />
  )));
}

export function Effects({ world }: { readonly world: WorldId }) {
  if (world === 'flex') return <Underground />;
  if (world === 'cielo') return <Sky />;
  if (world === 'final') return <Finale />;
  if (world === 'base') return <IsleLife />;
  return <Grid />;
}

function Grid() {
  const fx = scenery.grid;
  const rivers = Object.values(fx.rios);
  return (
    <>
      <FlowCanvas classes="fx-rios" paths={rivers.map((river) => ({ d: river, dash: [2, 16], color: 'rgba(236,255,252,.9)', width: 1.3, speed: 8 }))} />
      {fx.chimeneas.flatMap((point, group) => Array.from({ length: 3 }, (_, puff) => <i key={`${group}-${puff}`} className="fx-humo chica" style={spot(point, { '--d': `${(-puff * 1.8 - group * 0.7).toFixed(1)}s` })} />))}
      <Sketch className="fx-aspas" style={spot(fx.molino)} box={[40, 40]} draw={paintBlades} />
      <i className="fx-faro" style={spot(fx.faro)} />
      <i className="fx-lampara" style={spot(fx.faro)} />
      <Sketch className="fx-chorro" style={spot(fx.ballena)} box={[40, 46]} draw={paintSpout} />
      {fx.peces.map((point, index) => <i key={index} className="fx-pez" style={spot(point, { '--d': `${(-index * 2.9).toFixed(1)}s` })}><Sketch className="" box={[24, 12]} draw={paintFish} /></i>)}
      <i className="fx-runa" style={spot(fx.runa)} />
      {fx.brillos.map((point, index) => <i key={index} className="fx-brillo" style={spot(point, { '--d': `${(-index * 0.77).toFixed(2)}s` })} />)}
      {fx.ondas.map((point, index) => <i key={index} className="fx-onda" style={spot(point, { '--d': `${(-index * 0.6).toFixed(1)}s` })} />)}
      <i className="fx-aura" style={spot(fx.aura)} />
      <i className="fx-destello" style={spot(fx.cofre)} />
      <i className="fx-pilar" style={spot(fx.pilar)}>{[0, 1, 2, 3, 4, 5].map((puff) => <b key={puff} style={spot([0, 0], { '--d': `${(-puff * 0.55).toFixed(2)}s`, '--dx': ((puff % 3) - 1) * 0.35 })} />)}</i>
      {fx.banderas.map((point, index) => <Flag key={index} style={spot(point, { '--d': `${(-index * 0.37).toFixed(2)}s` })} />)}
      <i className="fx-globo" style={spot([0.37, 0.38])}><Rune id="globo-aire" /></i>
      {[[0.4, 0.43, '#f6c04a'], [0.56, 0.62, '#f08ab0'], [0.34, 0.63, '#8ad0f0'], [0.6, 0.4, '#fffaf0'], [0.27, 0.83, '#c0a0f0'], [0.52, 0.34, '#f6c04a']].map(([x, y, color], index) => (
        <i key={index} className="fx-mariposa" style={spot([Number(x), Number(y)], { '--d': `${(-index * 1.7).toFixed(1)}s`, '--c': String(color) })}><b /><b /></i>
      ))}
      {[[0.36, 70, -8], [0.62, 90, -52]].map(([y, duration, delay], index) => (
        <Flock key={index} style={{ ['--y' as string]: y, ['--dur' as string]: `${duration}s`, ['--d' as string]: `${delay}s` }} />
      ))}
    </>
  );
}

function IsleLife() {
  const fx = scenery.base;
  return (
    <>
      <FlowCanvas classes="fx-rios" paths={[{ d: fx.canal, dash: [2, 16], color: 'rgba(236,255,252,.9)', width: 1.3, speed: 7 }]} />
      {smoke(fx.chimeneas, 3, true)}
      <i className="fx-faro" style={spot(fx.faro)} />
      <i className="fx-lampara" style={spot(fx.faro)} />
      {fx.ondas.map((point, index) => <i key={index} className="fx-onda" style={spot(point, { '--d': `${(-index * 0.9).toFixed(1)}s` })} />)}
      {fx.brillos.map((point, index) => <i key={index} className="fx-brillo" style={spot(point, { '--d': `${(-index * 0.77).toFixed(2)}s` })} />)}
      <i className="fx-aura" style={spot(fx.aura)} />
      {/* someone upstream keeps folding boats out of misprints */}
      {[31, 47].map((duration) => (
        <Along key={duration} points={fx.canal} duration={duration} flight className="barquito"><Sketch className="" box={[20, 14]} style={{ aspectRatio: '20 / 14' }} draw={paintPaperBoat} /></Along>
      ))}
      {fx.tinas.map((vat, index) => <i key={index} className="fx-tinta" style={spot(vat, { '--c': vat[2] ?? '#fff', '--d': `${(-index * 1.2).toFixed(1)}s` })} />)}
      {fx.mariposas.map((spotOf, index) => <i key={index} className="fx-mariposa" style={spot(spotOf, { '--c': spotOf[2] ?? '#fff', '--d': `${(-index * 1.9).toFixed(1)}s` })}><b /><b /></i>)}
      <i className="fx-glifos" style={spot(fx.aura)}>{['{', ';', '#', '}', ':', '.'].map((glyph, index) => <b key={index} style={{ ['--d' as string]: `${(-index * 0.87).toFixed(2)}s`, ['--dx' as string]: (index - 2.5) * 0.8 }}>{glyph}</b>)}</i>
      {[[0.3, 78, -14], [0.72, 96, -58]].map(([y, duration, delay], index) => (
        <Flock key={index} style={{ ['--y' as string]: y, ['--dur' as string]: `${duration}s`, ['--d' as string]: `${delay}s` }} />
      ))}
    </>
  );
}

function Underground() {
  const fx = scenery.flex;
  return (
    <>
      <FlowCanvas classes="fx-rios" paths={[
        { d: fx.rios.agua, dash: [2, 16], color: 'rgba(230,255,255,.95)', width: 1.3, speed: 8 },
        { d: fx.rios.lava, dash: [3, 14], color: 'rgba(255,240,170,.95)', width: 1.3, speed: 4 },
      ]} />
      <Along points={fx.carril} duration={16} ping className="vag">
        <Sketch className="" box={[28, 20]} style={{ aspectRatio: '28 / 20' }} draw={paintMinecart} />
      </Along>
      <i className="fx-rayo" style={spot(fx.luz)} />
      {fx.esporas.map((point, index) => <i key={index} className="fx-espora" style={spot(point, { '--d': `${(-index * 0.9).toFixed(1)}s`, '--c': index % 3 ? '#a8fff0' : '#e0b0ff' })} />)}
      <i className="fx-cascada" style={{ ['--x' as string]: fx.cascada[0], ['--y' as string]: fx.cascada[1], ['--h' as string]: fx.cascada[2] }} />
      {fx.cristales.map((point, index) => <i key={index} className="fx-cristal" style={spot(point, { '--d': `${(-index * 0.7).toFixed(1)}s`, '--c': point[2] ?? '#fff' })} />)}
      {smoke(fx.chimeneas, 3, true)}
      {fx.fuegos.map((point, index) => <i key={index} className="fx-fuego" style={spot(point, { '--d': `${(-index * 1.1).toFixed(1)}s`, '--c': point[2] ?? '#fff' })} />)}
      {fx.fantasmas.map((point, index) => <i key={index} className="fx-alma" style={spot(point, { '--d': `${(-index * 2.7).toFixed(1)}s`, '--dx': index % 2 ? 1 : -1 })} />)}
      {fx.cirios.map((point, index) => <i key={index} className="fx-cirio" style={spot(point, { '--d': `${(-index * 0.23).toFixed(2)}s` })} />)}
      {fx.faroles.map((point, index) => <i key={index} className="fx-cirio farol" style={spot(point, { '--d': `${(-index * 0.41).toFixed(2)}s` })} />)}
      <i className="fx-puerta" style={spot(fx.puerta)}>{['ᚠ', 'ᚱ', 'ᛟ', 'ᚦ'].map((rune, index) => <b key={rune} style={{ ['--d' as string]: `${(-index * 1.1).toFixed(1)}s`, ['--dx' as string]: (index - 1.5) * 0.7 }}>{rune}</b>)}</i>
      <i className="fx-hoguera" style={spot(fx.hoguera)}><b /><b /><b /></i>
      {fx.gotas.map((point, index) => <i key={index} className="fx-gota" style={spot(point, { '--d': `${(-index * 1.37).toFixed(2)}s` })} />)}
      {fx.brillos_roca.map((point, index) => <i key={index} className="fx-brillo" style={spot(point, { '--d': `${(-index * 0.83).toFixed(2)}s` })} />)}
      {fx.aranas.map((point, index) => <i key={index} className="fx-arana" style={spot(point, { '--d': `${(-index * 2.3).toFixed(1)}s` })}><Rune id="i-arana" /></i>)}
      <Sketch className="fx-runas" style={spot(fx.circulo)} box={[200, 200]} draw={paintRunes} moving />
      {[[0.3, 60, -10], [0.66, 80, -44]].map(([y, duration, delay], index) => (
        <Flock key={index} bats style={{ ['--y' as string]: y, ['--dur' as string]: `${duration}s`, ['--d' as string]: `${delay}s` }} />
      ))}
      <i className="fx-zzz" style={spot(fx.dragon)}><b>z</b><b>z</b><b>Z</b></i>
      <i className="fx-polvo" style={spot(fx.gusano)} />
    </>
  );
}

function Sky() {
  const fx = scenery.cielo;
  return (
    <>
      <i className="fx-vortice" style={spot(fx.vortice)}><b /><b /></i>
      <i className="fx-aura ojo" style={spot(fx.vortice)} />
      {fx.relampagos.map((point, index) => <Sketch key={index} className="fx-relampago" style={spot(point, { '--d': `${(-index * 2.3 - 1).toFixed(1)}s`, '--dur': `${(6 + (index % 3) * 1.7).toFixed(1)}s` })} box={[20, 40]} draw={paintBolt} />)}
      <Along points={fx.dirigible} duration={80} className="dir"><Sketch className="" box={[60, 40]} style={{ aspectRatio: '3 / 2' }} draw={paintAirship} /></Along>
      {fx.campanas.map((point, index) => <i key={index} className="fx-campana" style={spot(point)}><Rune id="i-campana" /></i>)}
      {fx.banderas.map((point, index) => <Flag key={index} style={spot(point, { '--d': `${(-index * 0.37).toFixed(2)}s` })} />)}
      <svg className="fx-rios sky-streams" viewBox="0 0 900 618.75" preserveAspectRatio="none" aria-hidden="true">
        <path d="M195 384 C197 405 216 415 220 430 S220 450 231 461 S243 479 243 492 S249 518 253 532" />
        <path d="M837 301 Q836 305 841 309 Q844 312 835 316" />
      </svg>
      {smoke(fx.chimeneas, 3, true)}
      <i className="fx-faro" style={spot(fx.faro)} />
      <i className="fx-lampara" style={spot(fx.faro)} />
      <Sketch className="fx-aspas" style={spot(fx.aspas)} box={[40, 40]} draw={paintBlades} />
      <i className="fx-surtidor" style={spot(fx.surtidor)}><b /><b /><b /></i>
      {[[0.3, 74, -12], [0.7, 96, -60]].map(([y, duration, delay], index) => (
        <Flock key={index} style={{ ['--y' as string]: y, ['--dur' as string]: `${duration}s`, ['--d' as string]: `${delay}s` }} />
      ))}
      {Object.entries(fx.vuelos).map(([name, points]) => {
        const kind = name === 'dragon' ? 'dragon' : 'grifo';
        return <Along key={name} points={points} duration={kind === 'dragon' ? 9 : 7} flight className={`flyer vuelo-${name}`} style={{ width: flyerSize(kind) }}><Flyer kind={kind} /></Along>;
      })}
    </>
  );
}

function Finale() {
  const fx = scenery.final;
  return (
    <>
      <i className="fx-garabato" style={spot(fx.centro)}><b /><b /><b /></i>
      {fx.portales.map((portal, index) => <i key={index} className="fx-portal" style={spot(portal, { '--c': portal[2] ?? '#fff', '--d': `${(-index * 1.3).toFixed(1)}s` })}><b /><b /></i>)}
      {fx.fragmentos.map((piece, index) => <i key={index} className="fx-fragmento" style={spot(piece, { '--c': piece[2] ?? '#fff', '--d': `${(-index * 1.7).toFixed(1)}s`, '--g': `${(index % 2 ? 1 : -1) * (12 + (index % 5) * 7)}deg` })} />)}
      {fx.chispas.map((point, index) => <i key={index} className="fx-brillo" style={spot(point, { '--d': `${(-index * 0.47).toFixed(2)}s` })} />)}
    </>
  );
}

export function cloudLayer(world: WorldId): ReactNode {
  if (world === 'final') return Array.from({ length: 10 }, (_, index) => <i key={index} className="mota" style={{ ['--y' as string]: (0.08 + index * 0.09).toFixed(2), ['--dur' as string]: `${60 + (index % 4) * 17}s`, ['--d' as string]: `${-index * 11}s`, ['--c' as string]: ['#c8a8ff', '#ffd0f0', '#a8e8ff'][index % 3] ?? '#fff' }} />);
  if (world === 'flex') return Array.from({ length: 9 }, (_, index) => <i key={index} className="mota" style={{ ['--y' as string]: (0.1 + index * 0.1).toFixed(2), ['--dur' as string]: `${70 + (index % 4) * 18}s`, ['--d' as string]: `${-index * 13}s`, ['--c' as string]: ['#a8fff0', '#e0b0ff', '#fff0b0'][index % 3] ?? '#fff' }} />);
  if (world === 'cielo') return [[0.08, 170, -40, 1, 11], [0.44, 210, -150, 2, 9], [0.94, 190, -90, 3, 12]].map(([y, duration, delay, variant, width], index) => <i key={index} className={`nube-paso v${variant}`} style={{ ['--y' as string]: y, ['--dur' as string]: `${duration}s`, ['--d' as string]: `${delay}s`, ['--w' as string]: `${width}cqi` }}><b /></i>);
  return [[0.09, 220, -31, 1, 8], [0.35, 170, -118, 2, 12], [0.63, 230, -67, 3, 9], [0.84, 155, -22, 1, 15]].map(([y, duration, delay, variant, width], index) => <i key={index} className={`passing-cloud ${index % 2 ? 'near' : 'far'} v${variant}`} style={{ ['--y' as string]: y, ['--dur' as string]: `${duration}s`, ['--d' as string]: `${delay}s`, ['--w' as string]: `${width}cqi` }}><b /></i>);
}
