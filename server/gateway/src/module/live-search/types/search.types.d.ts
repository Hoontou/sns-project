/**userId 프로퍼티가 굳이 필요한가 싶은데, 일단 넣어놨음. 지금 docId == userId 상태임. */
export interface SnsUsersDocType {
  username: string;
  introduce: string;
  img: string;
  introduceName: string;
}

export interface SnsPostsDocType {
  title: string;
  tags?: string;
  createdAt: Date;
}
/**tag의 중복방지를 위해 _id==tagName으로 저장하고, 검색은 tagName, 태그DOC 가져오는건 _id로 수행 */
export interface SnsTagsDocType {
  tagName: string;
  count: number;
}

export interface SearchResult {
  type: 'user' | 'hashtag';
  resultList: SearchedUser[] | SearchedHashtag[];
}
export interface SearchedUser {
  username: string;
  img: string;
  introduceName: string;
  introduce: string;
}
export interface SearchedHashtag {
  tagName: string;
  count: number;
}
