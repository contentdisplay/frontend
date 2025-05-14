import { useState, useEffect, useCallback } from 'react';
import { Howl } from 'howler';

// Create a map of sound effects
const soundEffects = {
  click: new Howl({ src: ['/sounds/click.mp3'], volume: 0.5 }),
  hover: new Howl({ src: ['/sounds/hover.mp3'], volume: 0.2 }),
  earn: new Howl({ src: ['/sounds/earn.mp3'], volume: 0.7 }),
  slide: new Howl({ src: ['/sounds/slide.mp3'], volume: 0.3 }),
};

// Create a hook to manage sound effects
export const useSoundEffects = () => {
  const [soundEnabled, setSoundEnabled] = useState(false);
  
  // Toggle sound on/off
  const toggleSound = useCallback(() => {
    setSoundEnabled(prev => !prev);
  }, []);
  
  // Play a sound effect if enabled
  const playSound = useCallback((sound: keyof typeof soundEffects) => {
    if (soundEnabled && soundEffects[sound]) {
      soundEffects[sound].play();
    }
  }, [soundEnabled]);

  // Load sounds on mount
  useEffect(() => {
    // Preload sounds
    Object.values(soundEffects).forEach(sound => {
      sound.load();
    });
    
    // Check for user preference in localStorage
    const savedPreference = localStorage.getItem('soundEnabled');
    if (savedPreference) {
      setSoundEnabled(savedPreference === 'true');
    }
    
    // Clean up
    return () => {
      Object.values(soundEffects).forEach(sound => {
        sound.unload();
      });
    };
  }, []);
  
  // Save preference when changed
  useEffect(() => {
    localStorage.setItem('soundEnabled', soundEnabled.toString());
  }, [soundEnabled]);
  
  return { soundEnabled, toggleSound, playSound };
};