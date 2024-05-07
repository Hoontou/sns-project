export interface SnsUsersDocType {
  username: string;
  introduce: string;
  img: string;
  introduceName: string;
}

export interface SnsUsersUpdateForm {
  username?: string;
  introduce?: string;
  img?: string;
  introduceName?: string;
}

export interface SnsPostsDocType {
  title: string;
  tags?: string;
}
/**tag의 중복방지를 위해 _id==tagName으로 저장하고, 검색은 tagName, 태그DOC 가져오는건 _id로 수행 */
export interface SnsTagsDocType {
  tagName: string;
  objId: string;
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

export interface UserIndexSearchResult {
  _index: 'sns.posts';
  _id: string;
  _score: null | number;
  _source: SnsUsersDocType;
  _sort?: number[];
}

export interface PostIndexSearchResult {
  _index: 'sns.posts';
  _id: string;
  _score: null | number;
  _source: SnsPostsDocType;
  _sort?: number[];
}

export interface TagIndexSearchResult {
  _index: 'sns.tags';
  _id: string;
  _score: null | number;
  _source: SnsTagsDocType;
  _sort?: number[];
}
