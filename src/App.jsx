// ملف: App.jsx
import React, { useState, useRef, useEffect } from 'react';
import html2canvas from 'html2canvas';
import { saveAs } from 'file-saver';
import { createFFmpeg, fetchFile } from '@ffmpeg/ffmpeg';
import './App.css';

function App() {
  const [audioUrl, setAudioUrl] = useState(null);
  const [audioFile, setAudioFile] = useState(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [title, setTitle] = useState("jamhoor");
  const [captions, setCaptions] = useState([]);
  const audioRef = useRef(null);
  const reelRef = useRef(null);

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
      setAudioFile(file);
      setAudioUrl(URL.createObjectURL(file));
    }
  };

  const handleCaptionUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        setCaptions(parsed);
      } catch (err) {
        alert('Invalid caption file. Please upload a JSON file with word, start, end.');
      }
    };
    reader.readAsText(file);
  };

  const handleCapture = async () => {
    if (!reelRef.current || !audioFile) return;

    const canvas = await html2canvas(reelRef.current);
    canvas.toBlob(async (blob) => {
      const ffmpeg = createFFmpeg({ log: true });
      await ffmpeg.load();

      ffmpeg.FS('writeFile', 'image.png', await fetchFile(blob));
      ffmpeg.FS('writeFile', 'audio.mp3', await fetchFile(audioFile));

      await ffmpeg.run(
        '-loop', '1',
        '-i', 'image.png',
        '-i', 'audio.mp3',
        '-c:v', 'libx264',
        '-tune', 'stillimage',
        '-c:a', 'aac',
        '-b:a', '192k',
        '-pix_fmt', 'yuv420p',
        '-shortest',
        'output.mp4'
      );

      const data = ffmpeg.FS('readFile', 'output.mp4');
      const videoBlob = new Blob([data.buffer], { type: 'video/mp4' });
      saveAs(videoBlob, 'caption-reel.mp4');
    });
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4">
      <h1 className="text-3xl mb-4">🎧 Audio Caption Reel</h1>

      <input type="file" accept="audio/*" onChange={handleFileChange} className="mb-2" />
      <input type="file" accept="application/json" onChange={handleCaptionUpload} className="mb-4" />

      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Enter Title"
        className="mb-4 p-2 rounded bg-gray-800 text-white border border-gray-600 w-full max-w-md"
      />

      {!audioUrl && (
        <div className="text-center text-gray-400">
          <p className="mb-2">🎙️ الرجاء رفع ملف صوتي لبدء العرض</p>
          <p>ثم أرفق ملف الترجمة (captions) بصيغة JSON</p>
        </div>
      )}

      {audioUrl && (
        <>
          <div
            ref={reelRef}
            className="relative bg-gray-900 rounded overflow-hidden shadow-lg"
            style={{ width: '360px', height: '640px' }}
          >
            <div className="absolute top-0 left-0 w-full px-4 py-2 bg-black bg-opacity-60 text-center text-white text-xl font-bold">
              {title}
            </div>

            <div className="absolute bottom-24 left-0 w-full text-center px-4 text-lg">
              {captions.map((cap, idx) => (
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

          <button
            onClick={handleCapture}
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Export as Video 🎬
          </button>
        </>
      )}
    </div>
  );
}

export default App;
