import React, { useState, useEffect } from 'react';
import './FileUpload.css';
import { parseTimeFromFilename } from '../utils/timeParser';

const FileUpload = ({ onFileUpload, windowConfigs, onWindowConfigChange }) => {
  const [uploadedFiles, setUploadedFiles] = useState(() => {
    const savedFiles = localStorage.getItem('uploadedFiles');
    return savedFiles ? JSON.parse(savedFiles) : {};
  });
  const [editingWindows, setEditingWindows] = useState({});
  const [editNames, setEditNames] = useState({});

  // Сохраняем информацию о файлах в localStorage при изменении
  useEffect(() => {
    localStorage.setItem('uploadedFiles', JSON.stringify(uploadedFiles));
  }, [uploadedFiles]);

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleString('ru-RU', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const handleFileChange = (event, windowId) => {
    const files = Array.from(event.target.files);
    if (files.length > 0) {
      const file = files[0];
      const timeRange = parseTimeFromFilename(file.name);
      onFileUpload(files, windowId);
      setUploadedFiles(prev => ({
        ...prev,
        [windowId]: {
          name: file.name,
          timeRange
        }
      }));
    }
  };

  const handleAddWindow = () => {
    const newId = Date.now().toString();
    const newConfig = {
      id: newId,
      name: `Окно ${windowConfigs.length + 1}`
    };
    onWindowConfigChange([...windowConfigs, newConfig]);
  };

  const handleRemoveWindow = (windowId) => {
    onWindowConfigChange(windowConfigs.filter(config => config.id !== windowId));
    setUploadedFiles(prev => {
      const newFiles = { ...prev };
      delete newFiles[windowId];
      return newFiles;
    });
    setEditingWindows(prev => {
      const newEditing = { ...prev };
      delete newEditing[windowId];
      return newEditing;
    });
  };

  const handleResetWindows = () => {
    onWindowConfigChange([]);
    setUploadedFiles({});
    setEditingWindows({});
    localStorage.removeItem('uploadedFiles');
  };

  const handleStartEdit = (windowId) => {
    setEditingWindows(prev => ({
      ...prev,
      [windowId]: true
    }));
    setEditNames(prev => ({
      ...prev,
      [windowId]: windowConfigs.find(config => config.id === windowId)?.name || ''
    }));
  };

  const handleSaveEdit = (windowId) => {
    const newName = editNames[windowId]?.trim() || `Окно ${windowId}`;
    onWindowConfigChange(windowConfigs.map(config => 
      config.id === windowId ? { ...config, name: newName } : config
    ));
    setEditingWindows(prev => {
      const newEditing = { ...prev };
      delete newEditing[windowId];
      return newEditing;
    });
  };

  const handleCancelEdit = (windowId) => {
    setEditingWindows(prev => {
      const newEditing = { ...prev };
      delete newEditing[windowId];
      return newEditing;
    });
  };

  const handleEditNameChange = (windowId, value) => {
    setEditNames(prev => ({
      ...prev,
      [windowId]: value
    }));
  };

  const handleKeyPress = (event, windowId) => {
    if (event.key === 'Enter') {
      handleSaveEdit(windowId);
    } else if (event.key === 'Escape') {
      handleCancelEdit(windowId);
    }
  };

  const handleSaveConfig = () => {
    const config = {
      version: '1.0',
      timestamp: new Date().toISOString(),
      windows: windowConfigs,
      files: uploadedFiles
    };
    
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'video-windows-config.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleLoadConfig = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const config = JSON.parse(e.target.result);
          if (config.windows && Array.isArray(config.windows)) {
            onWindowConfigChange(config.windows);
            if (config.files) {
              setUploadedFiles(config.files);
            }
          }
        } catch (error) {
          console.error('Ошибка при загрузке конфигурации:', error);
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="file-upload">
      <div className="header-buttons">
        <button className="config-button" onClick={handleAddWindow}>
          Добавить окно
        </button>
        <button className="reset-windows-button" onClick={handleResetWindows}>
          Сбросить окна
        </button>
        <button className="save-config-button" onClick={handleSaveConfig}>
          Сохранить конфигурацию
        </button>
        <label className="load-config-button">
          Загрузить конфигурацию
          <input
            type="file"
            accept=".json"
            onChange={handleLoadConfig}
            style={{ display: 'none' }}
          />
        </label>
      </div>

      <div className="config-actions">
        <div className="windows-list">
          {windowConfigs.map((config) => (
            <div key={config.id} className="window-item">
              <div className="window-header">
                {editingWindows[config.id] ? (
                  <div className="window-name-edit">
                    <input
                      type="text"
                      value={editNames[config.id] || ''}
                      onChange={(e) => handleEditNameChange(config.id, e.target.value)}
                      onKeyDown={(e) => handleKeyPress(e, config.id)}
                      autoFocus
                      className="window-name-input"
                    />
                    <div className="window-name-actions">
                      <button onClick={() => handleSaveEdit(config.id)} className="save-name-button">✓</button>
                      <button onClick={() => handleCancelEdit(config.id)} className="cancel-name-button">✕</button>
                    </div>
                  </div>
                ) : (
                  <h3 onClick={() => handleStartEdit(config.id)} className="window-name">
                    {config.name}
                    <span className="edit-icon">✎</span>
                  </h3>
                )}
              </div>
              <div className="upload-area">
                <input
                  type="file"
                  accept="video/*"
                  onChange={(e) => handleFileChange(e, config.id)}
                  style={{ display: 'none' }}
                  id={`file-input-${config.id}`}
                />
                <label htmlFor={`file-input-${config.id}`}>
                  {uploadedFiles[config.id] ? (
                    <div className="file-info">
                      <div className="file-name">{uploadedFiles[config.id].name}</div>
                      {uploadedFiles[config.id].timeRange?.startTime ? (
                        <div className="time-range">
                          <div>Начало: {formatTime(uploadedFiles[config.id].timeRange.startTime)}</div>
                          {uploadedFiles[config.id].timeRange.endTime ? (
                            <div>Конец: {formatTime(uploadedFiles[config.id].timeRange.endTime)}</div>
                          ) : (
                            <div>Конец: будет определен после загрузки видео</div>
                          )}
                        </div>
                      ) : (
                        <div className="invalid-time-range">
                          Неверный формат времени в имени файла
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="upload-placeholder">
                      Перетащите видео сюда или кликните для выбора
                    </div>
                  )}
                </label>
              </div>
              <button 
                className="remove-window-button"
                onClick={() => handleRemoveWindow(config.id)}
              >
                Удалить окно
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FileUpload;