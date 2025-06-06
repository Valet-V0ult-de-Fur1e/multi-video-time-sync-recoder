import React from 'react';
import './Instructions.css';

const Instructions = () => {
  return (
    <div className="instructions">
      <h2>Инструкция по использованию</h2>
      <div className="instructions-content">
        <div className="instruction-section">
          <h3>Поддерживаемые форматы имен файлов</h3>
          <p>Имя файла должно содержать временную метку в одном из следующих форматов:</p>
          <ul>
            <li>Формат с датой и временем: <code>YYYY.MM.DD HH_MM_SS</code><br/>
              Пример: <code>рлс id 3 время 2025.05.26 00_06_40 цели 71_75.mp4</code></li>
            <li>Формат с одним временем: <code>HH-MM-SS</code><br/>
              Пример: <code>video_12-30-00.mp4</code></li>
            <li>Формат с двумя временами: <code>HH-MM-SS-HH-MM-SS</code><br/>
              Пример: <code>video_12-30-00-13-45-00.mp4</code></li>
            <li>Формат с длительностью: <code>_Xd</code> (дни) или <code>_Xm</code> (минуты)<br/>
              Примеры: <code>video_12-30-00_1d.mp4</code> (1 день), <code>video_12-30-00_30m.mp4</code> (30 минут)</li>
          </ul>
          <p className="note">Примечание: Если в имени файла указано только начальное время, конечное время будет автоматически определено из длительности видео после его загрузки.</p>
        </div>

        <div className="instruction-section">
          <h3>Основные функции</h3>
          <ul>
            <li>Загрузка видеофайлов с временными метками</li>
            <li>Синхронизированное воспроизведение нескольких видео</li>
            <li>Управление скоростью воспроизведения (0.25x, 0.5x, 1x, 2x, 5x, 10x)</li>
            <li>Возможность перемотки по временной шкале</li>
            <li>Сохранение и загрузка конфигурации окон</li>
          </ul>
        </div>

        <div className="instruction-section">
          <h3>Как использовать</h3>
          <ol>
            <li>Нажмите "Добавить окно" для создания нового окна видео</li>
            <li>Загрузите видеофайл в каждое окно, перетащив файл или выбрав его через диалог</li>
            <li>При необходимости измените название окна, нажав на иконку редактирования</li>
            <li>После загрузки всех видео нажмите "Начать просмотр"</li>
            <li>Используйте элементы управления для синхронизированного воспроизведения</li>
          </ol>
        </div>

        <div className="instruction-section">
          <h3>Сохранение конфигурации</h3>
          <p>Вы можете сохранить текущую конфигурацию окон и загрузить её позже:</p>
          <ul>
            <li>Нажмите "Сохранить конфигурацию" для сохранения текущих настроек</li>
            <li>Используйте "Загрузить конфигурацию" для восстановления сохраненных настроек</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Instructions; 