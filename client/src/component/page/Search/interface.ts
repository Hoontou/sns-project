/**검색결과로 가져오는 정보*/
export type SearchResult = SearchedUser | SearchedHashtag;
export interface SearchedUser {
  type: 'user';
  resultList: {
    username: string;
    img: string;
    introduceName: string;
    introduce: string;
  }[];
}
export interface SearchedHashtag {
  type: 'hashtag';
  resultList: {
    tagName: string;
    count: number;
  }[];
}
