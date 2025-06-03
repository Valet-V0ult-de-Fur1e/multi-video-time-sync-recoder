import React, { useRef, useEffect, useState, useCallback } from 'react';
import './Timeline.css';

const Timeline = ({ timeRange, currentTime, onTimeChange, isPlaying, onPlayPause, onSpeedChange }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const sliderRef = useRef(null);
  const [sliderValue, setSliderValue] = useState(0);
  const isInitializedRef = useRef(false);
  const animationFrameRef = useRef(null);
  const startTimeRef = useRef(0);

  // Форматирование времени
  const formatTime = (timestamp) => {
    if (!timestamp) return '00:00:00';
    const date = new Date(timestamp);
    return date.toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  // Вычисление позиции слайдера в миллисекундах
  const calculateSliderPosition = useCallback(() => {
    if (!timeRange?.startTime || !timeRange?.endTime) return 0;
    
    // Вычисляем длительность в миллисекундах
    const duration = timeRange.endTime - timeRange.startTime;
    if (duration <= 0) return 0;

    // Вычисляем текущую позицию относительно начала
    const position = currentTime - timeRange.startTime;
    
    // Ограничиваем позицию в пределах от 0 до длительности
    return Math.max(0, Math.min(duration, position));
  }, [timeRange, currentTime]);

  // Вычисление максимального значения слайдера
  const calculateSliderMax = useCallback(() => {
    if (!timeRange?.startTime || !timeRange?.endTime) return 0;
    return Math.max(0, timeRange.endTime - timeRange.startTime);
  }, [timeRange]);

  // Обработка изменения позиции слайдера
  const handleSliderChange = useCallback((e) => {
    if (!timeRange?.startTime) return;
    
    // Получаем новую позицию из слайдера
    const newPosition = parseInt(e.target.value);
    setSliderValue(newPosition);
    
    // Вычисляем новое время
    const newTime = timeRange.startTime + newPosition;
    onTimeChange(newTime);
  }, [timeRange, onTimeChange]);

  // Обработка начала перетаскивания
  const handleMouseDown = useCallback(() => {
    setIsDragging(true);
  }, []);

  // Обработка окончания перетаскивания
  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    if (timeRange?.startTime) {
      const finalTime = timeRange.startTime + sliderValue;
      onTimeChange(finalTime);
    }
  }, [timeRange, sliderValue, onTimeChange]);

  // Обработка изменения скорости воспроизведения
  const handleSpeedChange = useCallback((e) => {
    const newSpeed = parseFloat(e.target.value);
    setPlaybackSpeed(newSpeed);
    onSpeedChange(newSpeed);
  }, [onSpeedChange]);

  // Обновление времени при воспроизведении
  useEffect(() => {
    if (isPlaying && !isDragging && timeRange?.startTime) {
      const updateTime = () => {
        const now = Date.now();
        if (!startTimeRef.current) {
          startTimeRef.current = now;
        }

        const elapsed = now - startTimeRef.current;
        const newPosition = (elapsed * playbackSpeed) + sliderValue;
        const maxPosition = calculateSliderMax();

        if (newPosition >= maxPosition) {
          onPlayPause();
          return;
        }

        setSliderValue(newPosition);
        onTimeChange(timeRange.startTime + newPosition);
        animationFrameRef.current = requestAnimationFrame(updateTime);
      };

      animationFrameRef.current = requestAnimationFrame(updateTime);
      return () => {
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
        startTimeRef.current = 0;
      };
    } else {
      startTimeRef.current = 0;
    }
  }, [isPlaying, isDragging, timeRange, playbackSpeed, sliderValue, calculateSliderMax, onTimeChange, onPlayPause]);

  // Синхронизация слайдера с текущим временем
  useEffect(() => {
    if (!isDragging && timeRange?.startTime) {
      const newPosition = calculateSliderPosition();
      setSliderValue(newPosition);
    }
  }, [currentTime, isDragging, timeRange, calculateSliderPosition]);

  // Инициализация начальной позиции
  useEffect(() => {
    if (timeRange?.startTime && !isInitializedRef.current) {
      const initialPosition = calculateSliderPosition();
      setSliderValue(initialPosition);
      isInitializedRef.current = true;
    }
  }, [timeRange?.startTime, calculateSliderPosition]);

  if (!timeRange?.startTime || !timeRange?.endTime) {
    return null;
  }

  return (
    <div className="timeline">
      <div className="timeline-controls">
        <button 
          className="play-pause-button"
          onClick={onPlayPause}
        >
          {isPlaying ? '⏸' : '▶'}
        </button>
        <div className="playback-speed">
          <select 
            value={playbackSpeed} 
            onChange={handleSpeedChange}
            className="speed-select"
          >
            <option value={0.25}>0.25x</option>
            <option value={0.5}>0.5x</option>
            <option value={0.75}>0.75x</option>
            <option value={1}>1x</option>
            <option value={1.25}>1.25x</option>
            <option value={1.5}>1.5x</option>
            <option value={2}>2x</option>
            <option value={10}>10x</option>
          </select>
        </div>
        <div className="timeline-container">
          <div className="time-range-start">
            {formatTime(timeRange.startTime)}
          </div>
          <div className="timeline-slider-container">
            <div className="current-time-display">
              {formatTime(currentTime)}
            </div>
            <input
              ref={sliderRef}
              type="range"
              className="timeline-slider"
              min={0}
              max={calculateSliderMax()}
              value={sliderValue}
              onChange={handleSliderChange}
              onMouseDown={handleMouseDown}
              onMouseUp={handleMouseUp}
            />
          </div>
          <div className="time-range-end">
            {formatTime(timeRange.endTime)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Timeline; 