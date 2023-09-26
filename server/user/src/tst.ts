// import { elastic, SnsUsersDocType } from './configs/elasticsearch';

// export const testFunc = async () => {
//   //새로운 인덱스 삽입 테스트
//   const newDoc: SnsUsersDocType = {
//     username: 'z9hoon',
//     introduce: '',
//     img: '',
//   };
//   const result = await elastic.client.index({
//     index: elastic.SnsUsersIndex,
//     id: 40,
//     document: newDoc,
//   });
//   console.log(result);
// };

// export const insertNewIndexToSnsUsers = async () => {
//   //새로운 인덱스 삽입 테스트
//   const newDoc: SnsUsersDocType = {
//     username: 'z9hoon',
//     introduce: '',
//     img: '',
//   };
//   const result = await elastic.client.index({
//     index: elastic.SnsUsersIndex,
//     id: 40,
//     document: newDoc,
//   });
//   console.log(result);
// };
