// A short, pleasant two-tone "ding" synthesized with the Web Audio API — no audio
// asset to ship or decode. Used by NotificationsContext when a NEW notification
// arrives (e.g. after placing an order). Browsers gate audio behind a user
// gesture; that's fine because every caller fires from a tap (place order) or a
// status crossing reached while the user is interacting — never on initial load.

// Minimal typed accessor for the webkit-prefixed AudioContext on older Safari/iOS,
// without resorting to `any`.
type AudioContextCtor = typeof AudioContext;

function getAudioContextCtor(): AudioContextCtor | undefined {
  if (typeof window === "undefined") return undefined;
  const w = window as unknown as {
    AudioContext?: AudioContextCtor;
    webkitAudioContext?: AudioContextCtor;
  };
  return w.AudioContext ?? w.webkitAudioContext;
}

/**
 * Play a brief two-tone chime (880Hz → 1320Hz, ~0.35s) with a quick attack and an
 * exponential decay. Fully guarded: a missing API, a blocked autoplay policy, or
 * any runtime error is swallowed so notifications never throw on the UI thread.
 */
export function playNotificationSound(): void {
  try {
    const Ctor = getAudioContextCtor();
    if (!Ctor) return;

    const ctx = new Ctor();

    const gain = ctx.createGain();
    gain.connect(ctx.destination);

    const now = ctx.currentTime;
    const duration = 0.35;

    // Gain envelope: silent → quick ramp up → exponential decay to ~silent.
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.25, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    const osc = ctx.createOscillator();
    osc.type = "sine";
    // Two-tone "ding": start at 880Hz, jump up to 1320Hz partway through.
    osc.frequency.setValueAtTime(880, now);
    osc.frequency.setValueAtTime(1320, now + 0.12);
    osc.connect(gain);

    osc.start(now);
    osc.stop(now + duration);

    // Release the AudioContext once the tone finishes so we don't leak contexts.
    osc.onended = () => {
      void ctx.close().catch(() => {});
    };
  } catch {
    // Ignore — audio is a nicety, never a hard dependency.
  }
}
