잡다한 생각 정리하는 리드미

## 중간정리? 23-02-21

이펙티브TS책 슥 훑고 프로젝트 하고있는데 잘 활용을 못하고있다. 제네릭도 아예 써보질못했다.  
하지만 확실히 TS에 조금씩 적응해가는중.
mongodb도 typeorm으로 하려했지만, 지원하는 mongodb버전이 낮아서 mongoose로 하기로했다.  
여전히 cors는 답답해죽겠다.
혼자 개발중이라 그런지, 테스트코드에 대한 필요성을 못느끼고 있다.  
유닛단위 테스트?가 그냥 콘솔로 계속찍어가면서 하는건가?
E2E는 프런트에서 sample페이지 같이 만들어서 계속 진행중이긴 한데..
지금은 수동으로 회원가입페이지, 로그인페이지, 업로드페이지 순으로 들어가서 요청을 날리는중.
upload에서 래빗메세지 뿌리기, 각각의 MSA에서 수신로직까지 만들고 난 후에  
E2E를 쫙 한번 짜보자.
fastify 정보가 별로없어서 답답하긴 한데 서드파티 패키지? 들까지 다 ts를 잘써줘서 확실히 편하다.  
지금까지 진행하면서 예전엔 구글검색이 90프로였다면 지금은 코드까보기 + 공식DOCS보는게 70퍼정도는 차지한다.  
무엇보다, 공식DOCS가 제일 정확하다는걸 깨닳고있다.

리팩토링, 성능개선 최적화는 끝이 없는것같다. 구현해놓고 다시보면 눈에밟히는게 많다.  
새로운 기능 만드는것 만큼이나 머리를 계속 굴리게 된다.  
대충 넘어가다가는 전 프로젝트 꼴이 날테니까..

## 래빗MQ 연결

https://github.com/amqp-node/amqplib/tree/main/examples/tutorials  
https://www.rabbitmq.com/getstarted.html  
공식문서, 구글링 통해서 몇시간의 삽질 끝에 제대로 연결성공. 래빗이 작동을 안했는데,  
tsconfig의 모듈: commonjs라서 오류가 발생하는것 같음. commonjs식으로 require하면 작동한다.  
네스트의 기본 tsconfig을 가져와서 쓰다보니 이미 익숙해져있는데 바꾸기란 쉽지 않겠다고 판단.  
그래서 문서, 구글링, 삽질 통해서 쉽게 쓸수있게 패턴화 시켰음.
각 msa의 src/common/amqp.ts에 래빗코드를 싹 정리해놨다.  
저걸 다른프로젝트에도 그냥 가져다쓰기만 하면 될것임.
각각의 로직에 맞게 메세지 컨슘만 수정하면 됨.  
ex) forEach문 안에 if (que == 컨슘사용할 큐) {channel.consume(컨슘로직작성)}

---

23.3.3 고찰
댓글기능을 구현할건데 이 기능을 main-back에 넣을지, 아니면 sub-back에다가 넣을지 고민중.  
고민중인 이유.  
메인백에다가 댓글기능을 넣으면 유저 uuid가 메인백에 저장돼있으니까 uuid조회가 편리할듯.
근데? 댓글에도 좋아요 기능이 있는데 댓글좋아요 누르면 섭백이랑 통신을 해야함... uuid랑 좋아요 두개를 잘 코멘트랑 연결해야하는데 두개가 다른 msa에 들어있게 될거니까 고민이 된다.
하나의 댓글에 들어있는 정보는 댓글id, 부모 댓글or포스트 id, useruuid, 내용 정도가 될듯.  
일단 댓글은 무조건 pgdb에 넣는다. cascading 삭제와 포린키 매핑해서 조인해야지 댓글관리가 쉬우니까.  
또 지금 리액트가 그냥 js인데 ts로 마이그레이션 해야할듯. 점점 프런트도 코드가 불어나면서 중구난방이 될거같다.  
메인백에 댓글관리 하기로했다. 이제 댓글기능 구현 할건데 그전에 리액트를 ts로 마이그레이션 해야할듯

---

리액트 ts로 바꿨고 리팩토링도 많이했음.
class validater 쓰려다가 안함.
post comment cocomment 테이블 정의했고 pgadmin으로 erd 사진이랑 create table 띄워보니 의도대로 된듯?
이제 테스트하면서 구현하면 됨.

---

23.3.10
post C, R, D 구현완료, R는 클라이언트에서 azure url파싱해서 사진까지 띄워줌.  
C는 클라이언트에서 사진, title 인풋으로 시작함.  
D는 아직 postmain API 요청으로만 접근 가능함.

comment, cocomment는 아직 API 요청으로만 가능함.  
post U와 comment D, U는 클라이언트 제대로 만들면서 구현할거임.  
post U는 좀 귀찮을듯.

이제 sub백에서 팔로우팔로잉, 글 좋아요, 댓글 좋아요, 그리고  
팔로우취소 등등 구현 시작.
섭백에 팔로우한 사람들이 최근 업로드한 게시글 다 긁어오기 같은거 구현하면 편할듯?  
섭백까지 어느정도 만들면? sns에서 필요한 건 거의 다 만든듯?(기본적인것만)
그 이후는 클라이언트 모양 잡고... 세부적인 기능 만들기.
이 세부적인 기능은 진짜 욕심내면 끝도없을것같음...

---

23.3.21
cs, 코테 하느라 프로젝트를 잠깐 쉬면서 생각한 것들.  
https://www.youtube.com/watch?v=U_TvOgZXK8k&ab_channel=OSCKorea  
MSA가 API형식으로 소통하는게 아니라 메세지큐 형태로 소통함.  
여기서 어느 한곳이라도 실패하면 롤백시켜야하는데.. 구현해야할게 많을듯.  
일단 미뤄두고 한꺼번에 싹다 만들까.. 어떻게 구현할지도 아직 못정했고.
위 영상처럼 메세지만 뿌려주는 MSA를 중간에 넣을까.
메세지들을 모아놓은 인스턴스 만들어서 추후 실패메세지가 온다면?
인스턴스에서 정보뽑아서 애들한테 삭제하라고 날리면.  
이외에 찾아본것들, 재미있게 본 것들은
ORM vs 그냥쿼리 랑 amqp vs rest api. 이 두개 내용은 재미있었다.
나중에 다시 찾아봐라.
https://levelup.gitconnected.com/raw-sql-vs-query-builder-vs-orm-eee72dbdd275  
https://kyungyeon.dev/posts/3

쿼리빌더 vs raw sql

---

23-03-24
지금 프로젝트를 진행하는걸 멈추고,

1. MSA에 흩어져 있는 같은이름의 인터페이스, DTO를 모아서 npm 패키지로 만들기
2. 몽고디비를 리포지토리 패턴화
3. 레디스, (fastify | nestjs)로 캐시서버를 MSA로 만들기
4. API gateway 좀더 알아보고 만들어볼까?

그리고 진행하면서 참고할만한 글과 영상들

1. 당근 채팅시스템 아키텍쳐  
   https://www.youtube.com/watch?v=lCxgddyxDyg&ab_channel=AmazonWebServicesKorea
2. 댓글 불러오기 할 때 봐야할것. Eager and Lazy Relations  
   https://typeorm.io/eager-and-lazy-relations  
   https://dawitblog.tistory.com/186
3. MSA에서 트랜잭션 롤백, MSA에서의 서킷브레이커?  
   npm 패키지 opossum  
   https://www.youtube.com/watch?v=U_TvOgZXK8k&ab_channel=OSCKorea
4. API gateway?  
   지금 클라이언트는 각각의 MSA의 url로 요청보내는데,
   이것을 정리해서 하나의 url로 보낼수 있게 하는게 API gateway인가?
   확실히 이건 필요해보임.
5. 프록시 패턴? 프록시 캐시?  
   프록시패턴에 캐시도 있던데 그럼 redis 캐시서버에 프록시 기능까지 탑재해서 DB 게이트웨이 형식으로?

진짜 MSA는 끝도없다..