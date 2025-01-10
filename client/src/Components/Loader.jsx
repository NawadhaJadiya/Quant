import React, { useEffect, useState } from 'react'

const Loader = () => {
  const [dots, setDots] = useState('.');
  const [timeLeft, setTimeLeft] = useState(120);
  const [loadingPhase, setLoadingPhase] = useState(0);

  const loadingMessages = [
    "Analyzing profile data...",
    "Gathering metrics...",
    "Calculating insights...",
    "Preparing results..."
  ];

  useEffect(() => {
    const phaseInterval = setInterval(() => {
      setLoadingPhase(prev => (prev + 1) % loadingMessages.length);
    }, 3000);

    const dotsInterval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '.' : prev + '.');
    }, 500);

    const timerInterval = setInterval(() => {
      setTimeLeft(prev => prev > 0 ? prev - 1 : 0);
    }, 1000);

    return () => {
      clearInterval(dotsInterval);
      clearInterval(timerInterval);
      clearInterval(phaseInterval);
    };
  }, []);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className='flex justify-center w-full fixed top-0 left-0 bg-zinc-900/90 z-50 items-center min-h-screen'>
      <div className='w-[80%] max-w-2xl min-h-[60vh] bg-zinc-800 rounded-xl relative p-8 shadow-lg'>
        <div className='space-y-8'>
          {/* Header */}
          <div>
            <h2 className='text-3xl text-white font-bold'>Loading Your Profile</h2>
            <p className='text-blue-400 text-lg mt-2'>{loadingMessages[loadingPhase]}{dots}</p>
          </div>

          {/* Analysis Steps */}
          <div className='space-y-2 text-white/70 text-sm'>
            <div className='flex items-center gap-2'>
              <div className='w-1.5 h-1.5 bg-blue-400 rounded-full'></div>
              <span>Analyzing engagement patterns</span>
            </div>
            <div className='flex items-center gap-2'>
              <div className='w-1.5 h-1.5 bg-blue-400 rounded-full'></div>
              <span>Calculating performance metrics</span>
            </div>
            <div className='flex items-center gap-2'>
              <div className='w-1.5 h-1.5 bg-blue-400 rounded-full'></div>
              <span>Processing activity data</span>
            </div>
          </div>
        </div>

        {/* Loading indicator */}
        <div className='absolute bottom-6 right-6 text-white'>
          <div className='flex items-center gap-3 bg-zinc-900/50 px-4 py-2 rounded-full text-sm'>
            <div className='w-3 h-3 border-2 border-blue-400 border-t-transparent rounded-full animate-spin'></div>
            <span className='text-zinc-400'>Processing</span>
            <span className='text-blue-400'>{formatTime(timeLeft)}</span>
          </div>
        </div>

        {/* Time badge */}
        <div className='absolute top-6 right-6 text-xs text-zinc-400'>
          Est. time: 2 min
        </div>
      </div>
    </div>
  )
}

export default Loader