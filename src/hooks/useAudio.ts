import { useCallback, useRef } from 'react';

export function useAudio(enabled: boolean) {
  const audioCtxRef = useRef<AudioContext | null>(null);

  const getCtx = (): AudioContext | null => {
    try {
      if (!audioCtxRef.current) {
        const Ctor = (window as any).AudioContext || (window as any).webkitAudioContext;
        if (!Ctor) return null;
        audioCtxRef.current = new Ctor();
      }
      if (audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume();
      }
      return audioCtxRef.current;
    } catch { return null; }
  };

  const osc = useCallback((type: OscillatorType, freq: number, endFreq: number,
    duration: number, volume: number, delay = 0, filter?: number) => {
    if (!enabled) return;
    try {
      const ctx = getCtx();
      if (!ctx) return;
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = type;
      o.frequency.setValueAtTime(freq, ctx.currentTime + delay);
      o.frequency.exponentialRampToValueAtTime(endFreq, ctx.currentTime + delay + duration);
      g.gain.setValueAtTime(volume, ctx.currentTime + delay);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + duration);
      if (filter) {
        const f = ctx.createBiquadFilter();
        f.type = 'bandpass';
        f.frequency.setValueAtTime(filter, ctx.currentTime);
        o.connect(f); f.connect(g);
      } else { o.connect(g); }
      g.connect(ctx.destination);
      o.start(ctx.currentTime + delay);
      o.stop(ctx.currentTime + delay + duration);
    } catch { /* ignore */ }
  }, [enabled, getCtx]);

  const playClick = useCallback(() => osc('sine', 300, 800, 0.08, 0.12), [osc]);
  const playSuccess = useCallback(() => {
    [
      [523.25, 0], [659.25, 0.08], [783.99, 0.16], [1046.5, 0.24],
    ].forEach(([f, d]) => osc('triangle', f as number, (f as number) * 1.5, 0.1, 0.1, d as number));
  }, [osc]);
  const playCharge = useCallback(() =>
    osc('sawtooth', 200, 450, 0.3, 0.04, 0, 600), [osc]);
  const playWarp = useCallback(() =>
    osc('sine', 100, 1800, 1.2, 0.01, 0), [osc]);
  const playLightning = useCallback(() => {
    [800, 1200, 400].forEach((f, i) =>
      osc('triangle', f, f / 2, 0.08, 0.08, i * 0.05));
  }, [osc]);

  return { playClick, playSuccess, playCharge, playWarp, playLightning };
}
