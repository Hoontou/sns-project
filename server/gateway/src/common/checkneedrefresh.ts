export const checkNeedRefresh = (date: string): boolean => {
  //쿠키생성 하루 * 15가 지났으면 새로 JWT발급받고 생성시간 업데이트해서 날린다.
  const dayDifference = Math.floor(
    (new Date().getTime() - new Date(date).getTime()) / (1000 * 60 * 60 * 24),
  );
  return dayDifference > 15 ? true : false;

  //logger.log(`refresh token to ${req.user.id}`);
  //경과시간. 위에는 하루가 지났으면?
  //(now.getTime() - createdAt.getTime()) / 1000 / 60 분단위, 몇분지났나?
  //(now.getTime() - createdAt.getTime()) / 1000 / 60 / 60 시간단위, 24 더나누면 하루단위
};
