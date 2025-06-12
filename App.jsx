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
  const [title, setTitle] = useState("My Audio Caption");
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
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Enter Title"
        className="mb-4 p-2 rounded bg-gray-800 text-white border border-gray-600 w-full max-w-md"
      />

      {audioUrl && (
        <div
          className="relative bg-gray-900 rounded overflow-hidden shadow-lg"
          style={{ width: '360px', height: '640px' }}
        >
          <div className="absolute top-0 left-0 w-full px-4 py-2 bg-black bg-opacity-60 text-center text-white text-xl font-bold">
            {title}
          </div>

          <div className="absolute bottom-24 left-0 w-full text-center px-4 text-lg">
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

          <audio ref={audioRef} controls src={audioUrl} className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-11/12" />
        </div>
      )}
    </div>
  );
}

export default App;
