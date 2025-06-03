import React, { useState } from 'react';
import './App.css';
import FileUpload from './components/FileUpload';
import VideoPlayer from './components/VideoPlayer';
import Timeline from './components/Timeline';
import Instructions from './components/Instructions';
import { parseTimeFromFilename } from './utils/timeParser';

function App() {
  const [videos, setVideos] = useState({});
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);
  const [isPlaybackMode, setIsPlaybackMode] = useState(false);
  const [globalTimeRange, setGlobalTimeRange] = useState(null);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [windowConfigs, setWindowConfigs] = useState(() => {
    const saved = localStorage.getItem('windowConfigs');
    return saved ? JSON.parse(saved) : [];
  });

  const handleFileUpload = (files, windowId) => {
    const newVideos = { ...videos };
    files.forEach(file => {
      const videoUrl = URL.createObjectURL(file);
      const timeRange = parseTimeFromFilename(file.name);
      console.log(timeRange);
      if (!timeRange || !timeRange.startTime) {
        alert('Не удалось определить время из имени файла: ' + file.name);
        return;
      }
      
      // Создаем временный video элемент для получения продолжительности
      const video = document.createElement('video');
      video.src = videoUrl;
      
      video.onloadedmetadata = () => {
        const duration = video.duration * 1000; // конвертируем в миллисекунды
        const updatedTimeRange = {
          ...timeRange,
          endTime: timeRange.endTime ?? (timeRange.startTime + duration)
        };
        
        newVideos[windowId] = {
          ...newVideos[windowId],
          timeRange: updatedTimeRange
        };
        
        // Обновляем глобальный временной диапазон
        const timeRanges = Object.values(newVideos)
          .map(v => v.timeRange)
          .filter(Boolean);

        if (timeRanges.length > 0) {
          const startTimes = timeRanges.map(r => r.startTime);
          const endTimes = timeRanges.map(r => r.endTime);
          const globalStart = Math.min(...startTimes);
          const globalEnd = Math.max(...endTimes);
          setGlobalTimeRange({
            startTime: globalStart,
            endTime: globalEnd,
            duration: globalEnd - globalStart
          });
          // Устанавливаем начальное время на начало глобального диапазона
          setCurrentTime(globalStart);
        }
        
        setVideos({...newVideos});
      };
      
      newVideos[windowId] = {
        name: file.name,
        url: videoUrl,
        file: file,
        timeRange
      };
    });
    setVideos(newVideos);
  };

  const handleTimeUpdate = (time) => {
    setCurrentTime(time);
  };

  const handleTimeChange = (time) => {
    setCurrentTime(time);
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleStartPlayback = () => {
    if (Object.keys(videos).length > 0) {
      setIsPlaybackMode(true);
      setShowInstructions(false);
    }
  };

  const handleBackToUpload = () => {
    setIsPlaybackMode(false);
    setIsPlaying(false);
    if (globalTimeRange) {
      setCurrentTime(globalTimeRange.startTime);
    }
  };

  const handleWindowConfigChange = (newConfigs) => {
    setWindowConfigs(newConfigs);
    localStorage.setItem('windowConfigs', JSON.stringify(newConfigs));
  };

  const handleSpeedChange = (speed) => {
    setPlaybackSpeed(speed);
  };

  const calculateGridLayout = () => {
    const videoCount = Object.keys(videos).length;
    if (videoCount <= 1) return { rows: 1, cols: 1 };
    if (videoCount <= 2) return { rows: 1, cols: 2 };
    if (videoCount <= 4) return { rows: 2, cols: 2 };
    if (videoCount <= 6) return { rows: 2, cols: 3 };
    if (videoCount <= 9) return { rows: 3, cols: 3 };
    return { rows: 4, cols: 4 };
  };

  return (
    <div className="app">
      <div className="app-header">
        <h1>Синхронизированное воспроизведение видео</h1>
        <button 
          className="instructions-toggle"
          onClick={() => setShowInstructions(!showInstructions)}
        >
          {showInstructions ? 'Скрыть инструкцию' : 'Показать инструкцию'}
        </button>
      </div>

      {showInstructions && <Instructions />}

      {!isPlaybackMode ? (
        <div className="upload-mode">
          <div className="upload-section">
            <FileUpload 
              onFileUpload={handleFileUpload}
              windowConfigs={windowConfigs}
              onWindowConfigChange={handleWindowConfigChange}
            />
          </div>
          {Object.keys(videos).length > 0 && (
            <button 
              className="start-playback-button"
              onClick={handleStartPlayback}
            >
              Начать просмотр
            </button>
          )}
        </div>
      ) : (
        <div className="playback-mode">
          <button 
            className="back-to-upload-button"
            onClick={handleBackToUpload}
          >
            Вернуться к загрузке
          </button>
          <div 
            className="video-grid"
            style={{ 
              gridTemplateRows: `repeat(${calculateGridLayout().rows}, 1fr)`,
              gridTemplateColumns: `repeat(${calculateGridLayout().cols}, 1fr)`
            }}
          >
            {Object.entries(videos).map(([windowId, video]) => (
              <VideoPlayer
                key={windowId}
                video={video}
                isPlaying={isPlaying}
                currentTime={currentTime}
                onTimeUpdate={handleTimeUpdate}
                globalTimeRange={globalTimeRange}
                windowName={windowConfigs.find(config => config.id === windowId)?.name || `Окно ${windowId}`}
                playbackSpeed={playbackSpeed}
              />
            ))}
          </div>
          <Timeline
            currentTime={currentTime}
            isPlaying={isPlaying}
            onTimeChange={handleTimeChange}
            onPlayPause={handlePlayPause}
            timeRange={globalTimeRange}
            onSpeedChange={handleSpeedChange}
          />
        </div>
      )}
    </div>
  );
}

export default App;