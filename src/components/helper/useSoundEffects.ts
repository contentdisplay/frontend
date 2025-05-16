import { useState } from 'react';

export const useSoundEffects = () => {
  const [soundEnabled, setSoundEnabled] = useState(true);

  const playSound = (type: string) => {
    if (soundEnabled) {
      // Implement sound playback logic if needed
      console.log(`Playing sound: ${type}`);
    }
  };

  const toggleSound = () => {
    setSoundEnabled((prev) => !prev);
  };

  return { soundEnabled, toggleSound, playSound };
};