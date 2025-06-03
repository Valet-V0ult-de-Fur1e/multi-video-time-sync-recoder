import React, { useRef, useState, useEffect } from 'react';
import './VideoPlayer.css';

const VideoPlayer = ({ video, isPlaying, currentTime, onTimeUpdate, globalTimeRange, windowName, playbackSpeed }) => {
  const videoRef = useRef(null);
  const [timeRange, setTimeRange] = useState(null);
  const [shouldPlay, setShouldPlay] = useState(false);
  const [isSeeking, setIsSeeking] = useState(false);
  const playPromiseRef = useRef(null);
  const isInitializedRef = useRef(false);

  // Форматирование времени для отображения
  const formatTime = (time) => {
    if (!time) return '00:00:00';
    const date = new Date(time);
    return date.toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  // Инициализация временного диапазона
  useEffect(() => {
    if (video?.timeRange) {
      setTimeRange(video.timeRange);
      isInitializedRef.current = false;
      setIsSeeking(false);
    }
  }, [video]);

  // Определяем, должно ли видео проигрываться в текущий момент
  useEffect(() => {
    if (timeRange && globalTimeRange) {
      const isInRange = currentTime >= timeRange.startTime && currentTime <= timeRange.endTime;
      setShouldPlay(isInRange);
    }
  }, [currentTime, timeRange, globalTimeRange]);

  // Синхронизация времени и воспроизведения
  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement || !timeRange) return;

    const handleSync = async () => {
      try {
        // Если видео еще не инициализировано, устанавливаем начальную позицию
        if (!isInitializedRef.current) {
          const initialTime = Math.max(0, (currentTime - timeRange.startTime) / 1000);
          if (isFinite(initialTime)) {
            videoElement.currentTime = initialTime;
          }
          isInitializedRef.current = true;
        }

        // Синхронизируем время с таймлайном
        const targetTime = (currentTime - timeRange.startTime) / 1000;
        const currentVideoTime = videoElement.currentTime;
        
        // Синхронизируем только при значительном расхождении
        if (Math.abs(currentVideoTime - targetTime) > 0.1) {
          videoElement.currentTime = targetTime;
        }

        // Управление воспроизведением
        if (isPlaying && shouldPlay && !isSeeking) {
          if (playPromiseRef.current) {
            await playPromiseRef.current;
          }
          try {
            playPromiseRef.current = videoElement.play();
            await playPromiseRef.current;
          } catch (error) {
            if (error.name !== 'AbortError') {
              console.error('Ошибка воспроизведения:', error);
            }
          }
        } else {
          if (playPromiseRef.current) {
            try {
              await playPromiseRef.current;
              videoElement.pause();
            } catch (error) {
              if (error.name !== 'AbortError') {
                console.error('Ошибка паузы:', error);
              }
            }
          } else {
            videoElement.pause();
          }
        }
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error('Ошибка синхронизации:', error);
        }
      }
    };

    handleSync();
  }, [currentTime, timeRange, isPlaying, shouldPlay, isSeeking]);

  // Обработка начала перемотки
  const handleSeeking = () => {
    setIsSeeking(true);
  };

  // Обработка окончания перемотки
  const handleSeeked = () => {
    setIsSeeking(false);
  };

  // Обработка загрузки метаданных
  const handleLoadedMetadata = () => {
    if (videoRef.current && timeRange) {
      const initialTime = Math.max(0, (currentTime - timeRange.startTime) / 1000);
      if (isFinite(initialTime)) {
        try {
          videoRef.current.currentTime = initialTime;
        } catch (error) {
          console.error('Ошибка установки начального времени:', error);
        }
      }
      isInitializedRef.current = true;
    }
  };

  // Обработка изменения скорости воспроизведения
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = playbackSpeed;
    }
  }, [playbackSpeed]);

  if (!video) {
    return (
      <div className="video-container">
        <div className="no-video-message">
          Нет видео
        </div>
      </div>
    );
  }

  return (
    <div className="video-container">
      <video
        ref={videoRef}
        src={video.url}
        onSeeking={handleSeeking}
        onSeeked={handleSeeked}
        onLoadedMetadata={handleLoadedMetadata}
        playsInline
      />
      <div className="video-label">
        <div className="window-name">{windowName}</div>
        {timeRange && (
          <div className="time-range">
            {formatTime(timeRange.startTime)} - {formatTime(timeRange.endTime)}
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoPlayer;