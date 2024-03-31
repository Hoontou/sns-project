export const checkNeedRefresh = (date: string): boolean => {
  //쿠키생성 하루 * 15가 지났으면 새로 JWT발급받고 생성시간 업데이트해서 날린다.
  const dayDifference = Math.floor(
    (new Date().getTime() - new Date(date).getTime()) / (1000 * 60 * 60 * 24),
  );
  return dayDifference > 15 ? true : false;
};
