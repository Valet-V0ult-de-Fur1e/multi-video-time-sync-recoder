// Функция для парсинга временных меток из имени файла
export const parseTimeFromFilename = (filename) => {
  // Сначала пробуем найти формат с датой и временем YYYY.MM.DD HH_MM_SS
  const dateTimeRegex = /(\d{4}\.\d{2}\.\d{2})[ _](\d{2}_\d{2}_\d{2})/;
  const dateTimeMatch = filename.match(dateTimeRegex);
  if (dateTimeMatch) {
    const [, dateStr, timeStr] = dateTimeMatch;
    const [year, month, day] = dateStr.split('.').map(Number);
    const [hours, minutes, seconds] = timeStr.split('_').map(Number);
    const startTime = new Date(year, month - 1, day, hours, minutes, seconds, 0);

    // Ищем продолжительность
    const durationRegex = /_(\d+)([dm])/;
    const durationMatch = filename.match(durationRegex);

    if (durationMatch) {
      const [, duration, unit] = durationMatch;
      const durationMs = unit === 'd'
        ? parseInt(duration) * 24 * 60 * 60 * 1000
        : parseInt(duration) * 60 * 1000;
      const endTime = new Date(startTime.getTime() + durationMs);
      return { startTime: startTime.getTime(), endTime: endTime.getTime() };
    }
    // Нет продолжительности — возвращаем только startTime
    return { startTime: startTime.getTime(), endTime: null };
  }

  // Старый формат HH-MM-SS
  const timeRegex = /(\d{2}-\d{2}-\d{2})/g;
  const matches = filename.match(timeRegex);

  if (!matches) {
    return null;
  }

  // Если найдена только одна метка времени
  if (matches.length === 1) {
    const [hours, minutes, seconds] = matches[0].split('-').map(Number);
    const startTime = new Date();
    startTime.setHours(hours, minutes, seconds, 0);

    // Ищем продолжительность в формате _Xd или _Xm (где X - число, d - дни, m - минуты)
    const durationRegex = /_(\d+)([dm])/;
    const durationMatch = filename.match(durationRegex);

    if (durationMatch) {
      const [, duration, unit] = durationMatch;
      const durationMs = unit === 'd'
        ? parseInt(duration) * 24 * 60 * 60 * 1000
        : parseInt(duration) * 60 * 1000;
      const endTime = new Date(startTime.getTime() + durationMs);
      return { startTime: startTime.getTime(), endTime: endTime.getTime() };
    }
    // Нет продолжительности — возвращаем только startTime
    return { startTime: startTime.getTime(), endTime: null };
  }
  // Если найдены две метки времени
  else if (matches.length === 2) {
    const [startMatch, endMatch] = matches;
    const [startHours, startMinutes, startSeconds] = startMatch.split('-').map(Number);
    const [endHours, endMinutes, endSeconds] = endMatch.split('-').map(Number);

    const startTime = new Date();
    startTime.setHours(startHours, startMinutes, startSeconds, 0);

    const endTime = new Date();
    endTime.setHours(endHours, endMinutes, endSeconds, 0);

    // Если время окончания меньше времени начала, значит видео переходит на следующий день
    if (endTime < startTime) {
      endTime.setDate(endTime.getDate() + 1);
    }

    return {
      startTime: startTime.getTime(),
      endTime: endTime.getTime()
    };
  }

  return null;
}; 