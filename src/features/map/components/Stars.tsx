import { Rune } from '../../../shared/icons/Rune';

const STARS = [1, 2, 3];

/** An exam's score as three stars, lit up to `score`. */
export function Stars({ score }: { readonly score: number }) {
  return (
    <span className="stars" aria-hidden="true">
      {STARS.map((star) => (
        <Rune key={star} id="i-estrella" className={score >= star ? 'on' : ''} />
      ))}
    </span>
  );
}

/** Stars for an exam, a gem or a tick for a lesson done, nothing for one still pending. */
export function LessonMark({
  exam,
  score,
  done,
  gem,
}: {
  readonly exam: boolean;
  readonly score: number | null;
  readonly done: boolean;
  readonly gem: boolean;
}) {
  if (exam) return <Stars score={score ?? 0} />;
  if (done) return <Rune id={gem ? 'i-gema' : 'i-hecho'} />;
  return null;
}
