export const getElapsedTimeString = (targetTime: string | Date): string => {
  if (targetTime === '') {
    return '요청 보냄';
  }

  const targetDate = new Date(targetTime);
  const currentDate = new Date();
  const elapsedMilliseconds = currentDate.getTime() - targetDate.getTime();

  const elapsedMinutes = Math.floor(elapsedMilliseconds / (60 * 1000));
  const elapsedHours = Math.floor(elapsedMilliseconds / (60 * 60 * 1000));
  const elapsedDays = Math.floor(elapsedMilliseconds / (24 * 60 * 60 * 1000));

  if (elapsedMinutes < 60) {
    return `${elapsedMinutes}분 전`;
  }
  if (elapsedHours < 24) {
    return `${elapsedHours}시간 전`;
  }

  if (isSameDay(currentDate, targetDate)) {
    return '어제';
  }

  if (elapsedDays < 30) {
    return `${elapsedDays}일 전`;
  }

  if (elapsedDays < 365) {
    return `${Math.floor(elapsedDays / 30)}달 전`;
  }

  return `${Math.floor(elapsedDays / 365)}년 전`;
};

const isSameDay = (date1: Date, date2: Date): boolean => {
  const timeDifference = Math.abs(date1.getTime() - date2.getTime());
  const hoursDifference = Math.ceil(timeDifference / (60 * 60 * 1000));
  return hoursDifference < 24;
};
