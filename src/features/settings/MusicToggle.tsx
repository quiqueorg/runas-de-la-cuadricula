/** The music button every top bar shows, wired to the saved setting. */
import { changeSettings, useProgress } from '../../core/progress/store';
import { MusicButton } from '../../shared/audio/MusicButton';

export function MusicToggle() {
  const { music } = useProgress().settings;
  return <MusicButton on={music} onToggle={() => changeSettings({ music: !music })} />;
}
