import React, { useEffect } from 'react';
import ReactConfetti from 'react-confetti';
import { useWindowSize } from 'react-use';

const Confetti = ({ run, duration = 3000, onComplete }) => {
  const { width, height } = useWindowSize();
  
  useEffect(() => {
    if (run) {
      const timer = setTimeout(() => {
        onComplete?.();
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [run, duration, onComplete]);

  if (!run) return null;

  return (
    <ReactConfetti
      width={width}
      height={height}
      recycle={false}
      numberOfPieces={200}
      gravity={0.3}
    />
  );
};

export default Confetti;