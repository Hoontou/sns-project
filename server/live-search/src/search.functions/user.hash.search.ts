import { elastic } from '../common/elasticsearch';

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

export const searchUserOrHashtag = async (
  string: string,
): Promise<SearchResult> => {
  const type = string.at(0);
  const searchString = string.substring(1);

  //#시작하면 태그검색, @시작하면 유저검색임
  const result = await elastic.client.search({
    index: type === '#' ? elastic.SnsHashtagsIndex : elastic.SnsUsersIndex,
    body: {
      query: {
        prefix:
          type === '#'
            ? {
                tagName: searchString,
              }
            : {
                username: searchString,
              },
      },
    },
  });

  const resultList: SearchedUser[] | SearchedHashtag[] = result.hits.hits.map(
    (item) => {
      return item._source;
    },
  );

  return { resultList, type: type === '#' ? 'hashtag' : 'user' };
};
