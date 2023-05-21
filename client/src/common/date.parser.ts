export const getElapsedTimeString = (targetTime: string): string => {
  if (targetTime === '') {
    return '요청 보냄';
  }
  const targetDate = new Date(targetTime);
  const currentDate = new Date();
  //postgres 에서 한국시간을 기본으로 잡아준다.
  //const koreaOffset = 9 * 60; // 한국은 UTC+9:00 시간대이므로 9시간을 분으로 환산
  const elapsedMilliseconds = currentDate.getTime() - targetDate.getTime(); //+ koreaOffset * 60 * 1000;
  const elapsedMinutes = Math.floor(elapsedMilliseconds / (60 * 1000));
  const elapsedHours = Math.floor(elapsedMilliseconds / (60 * 60 * 1000));

  if (elapsedMinutes < 60) {
    return `${elapsedMinutes}분 전`;
  }
  if (elapsedHours < 24) {
    return `${elapsedHours}시간 전`;
  }
  if (isSameDay(currentDate, targetDate)) {
    return '어제';
  }
  if (elapsedHours <= 24 * 7) {
    return `${Math.floor(elapsedHours / 24)}일 전`;
  }

  return targetDate.toLocaleDateString('ko-KR');
};

const isSameDay = (date1: Date, date2: Date): boolean => {
  const timeDifference = Math.abs(date1.getTime() - date2.getTime());
  const hoursDifference = Math.ceil(timeDifference / (60 * 60 * 1000));
  return hoursDifference < 24;
};
