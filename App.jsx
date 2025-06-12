// ملف: App.jsx
import React, { useState, useRef, useEffect } from 'react';
import { createFFmpeg, fetchFile } from '@ffmpeg/ffmpeg';
import './App.css';

const captionsSample = [
  { word: 'Hello', start: 0.0, end: 0.5 },
  { word: 'world,', start: 0.5, end: 1.0 },
  { word: 'this', start: 1.0, end: 1.3 },
  { word: 'is', start: 1.3, end: 1.5 },
  { word: 'a', start: 1.5, end: 1.6 },
  { word: 'test.', start: 1.6, end: 2.0 }
];

function App() {
  const [audioUrl, setAudioUrl] = useState(null);
  const [currentTime, setCurrentTime] = useState(0);
  const audioRef = useRef(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    return () => audio.removeEventListener('timeupdate', handleTimeUpdate);
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAudioUrl(URL.createObjectURL(file));
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4">
      <h1 className="text-3xl mb-4">🎧 Audio Caption Reel</h1>

      <input type="file" accept="audio/*" onChange={handleFileChange} className="mb-4" />

      {audioUrl && (
        <>
          <audio ref={audioRef} controls src={audioUrl} className="mb-4 w-full max-w-md" />
          <div className="text-xl text-center">
            {captionsSample.map((cap, idx) => (
              <span
                key={idx}
                className={
                  currentTime >= cap.start && currentTime <= cap.end
                    ? 'text-yellow-400'
                    : 'text-white'
                }
              >
                {cap.word + ' '}
              </span>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default App;
