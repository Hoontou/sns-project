import { SearchedHashtag, SearchedUser } from '../../../../Upload/Upload';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { List, ListItem } from '@mui/material';
import { SearchedTag } from 'sns-interfaces/grpc.interfaces';
import Spinner from '../../../../../../common/Spinner';
import InfiniteScroll from 'react-infinite-scroll-component';
import { TabPanelProps } from '../../SearchResultTap';
import { axiosInstance } from '../../../../../../App';

const pageLen = 20;

export const TagPanel = (props: TabPanelProps) => {
  const { children, value, index, userId, searchString } = props;
  const navigate = useNavigate();
  const [searchedTagList, setSearchedTagList] = useState<
    SearchedTag[] | undefined
  >(undefined);
  const [spin, setSpin] = useState<boolean>(true);
  const [page, setPage] = useState<number>(0);
  //더 가져올 유저가 있는가?
  const [hasMore, setHasMore] = useState<boolean>(true);

  const searchTagsBySearchString = () => {
    return axiosInstance
      .post('/gateway/post/searchhashtagsbysearchstring', {
        searchString,
        page,
      })
      .then((res) => {
        const data: { searchedTags: SearchedTag[] } = res.data;
        if (data.searchedTags.length < pageLen) {
          setHasMore(false);
        }

        setSearchedTagList(
          searchedTagList === undefined
            ? data.searchedTags
            : [...searchedTagList, ...data.searchedTags]
        );
        setPage(page + 1);
        setSpin(false);
      });
  };

  useEffect(() => {
    if (value === 2 && searchedTagList === undefined) {
      searchTagsBySearchString();
    }
  }, [value]);

  const makeCard = () => {
    return (
      <List sx={{ pt: 0 }} style={{ marginTop: '0.3rem' }}>
        {searchedTagList?.map((item, index) => (
          <ListItem
            key={index}
            onClick={() => {
              navigate(`/search/hashtag/${item.tagName.substring(0)}`);
            }}
          >
            <div>
              <div
                style={{
                  marginLeft: '-0.4rem',
                  fontSize: '1.4rem',
                  marginTop: '-0.2rem',
                }}
              >
                #{item.tagName}
              </div>
              <div
                style={{
                  marginLeft: '-0.4rem',
                  marginTop: '-0.4rem',
                  fontSize: '0.9rem',
                }}
              >
                게시물 {item.count}
              </div>
            </div>
          </ListItem>
        ))}
      </List>
    );
  };

  const renderItem =
    searchedTagList?.length === 0 ? (
      <div
        style={{
          fontSize: '1.5rem',
          color: 'gray',
          justifyContent: 'center',
          display: 'flex',
          marginTop: '7rem',
        }}
      >
        아무것도 없어요.
      </div>
    ) : (
      makeCard()
    );

  return (
    <div
      role='tabpanel'
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      style={{ display: value === 2 ? 'block' : 'none' }}
    >
      {spin && (
        <div style={{ position: 'absolute', left: '48%', top: '45%' }}>
          <Spinner />
        </div>
      )}

      <InfiniteScroll
        next={searchTagsBySearchString}
        hasMore={hasMore}
        loader={<div className='spinner'></div>}
        dataLength={searchedTagList === undefined ? 0 : searchedTagList.length}
        scrollThreshold={'95%'}
      >
        {/* scrollThreshold={'90%'} 페이지 얼만큼 내려오면 다음거 불러올건지 설정 */}
        {!spin && renderItem}
      </InfiniteScroll>
    </div>
  );
};
