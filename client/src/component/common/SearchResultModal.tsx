import React, { useEffect, useState } from 'react';
import Spinner from '../../common/Spinner';
import { SearchResult } from '../view/Upload/Upload';
import { Avatar, List, ListItem, ListItemAvatar } from '@mui/material';
import sample from '../../asset/sample1.jpg';
import { requestUrl } from '../../common/etc';

const modalStyle: React.CSSProperties = {
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100%',
  height: '25%', // 화면 높이의 20%
  background: 'white',
  // display: 'flex',
  alignItems: 'center',
  zIndex: '999',
  overflow: 'auto',
  marginTop: '0.4rem',
};

const SearchResultModal = (props: {
  spin: boolean;
  searchResult: SearchResult | undefined;
  setSearchbarDisplay: React.Dispatch<React.SetStateAction<boolean>>;
  setClickedTag: React.Dispatch<React.SetStateAction<string>>;
}) => {
  useEffect(() => {
    if (props.searchResult === undefined) {
      return;
    }
    console.log(props.searchResult);
  }, [props.searchResult]);

  const makeCard = (searchResult: SearchResult | undefined) => {
    if (searchResult === undefined) {
      return <></>;
    }
    if (searchResult.type === 'user') {
      return (
        <List sx={{ pt: 0 }}>
          {searchResult.resultList.map((item, index) => (
            <ListItem
              key={index}
              onClick={() => {
                props.setSearchbarDisplay(false);
                props.setClickedTag('@' + item.username);
              }}
            >
              <ListItemAvatar>
                <Avatar
                  sx={{ width: 50, height: 50 }}
                  style={{ marginLeft: '1.3rem' }}
                  alt={String(index)}
                  src={item.img === '' ? sample : `${requestUrl}/${item.img}`}
                ></Avatar>
              </ListItemAvatar>
              <div>
                <div
                  style={{
                    marginLeft: '1rem',
                    fontSize: '1.4rem',
                    marginTop: '-0.2rem',
                  }}
                >
                  {item.username}
                </div>
                <div
                  style={{
                    marginLeft: '1rem',
                    marginTop: '-0.4rem',
                    fontSize: '0.9rem',
                  }}
                >
                  {item.introduceName}
                </div>
              </div>
            </ListItem>
          ))}
        </List>
      );
    }

    if (searchResult.type === 'hashtag') {
      return (
        <List sx={{ pt: 0 }}>
          {searchResult.resultList.map((item, index) => (
            <ListItem key={index}>
              <div>
                <div
                  style={{
                    marginLeft: '1rem',
                    fontSize: '1.4rem',
                    marginTop: '-0.2rem',
                  }}
                >
                  {item.tagName}
                </div>
                <div
                  style={{
                    marginLeft: '1rem',
                    marginTop: '-0.4rem',
                    fontSize: '0.9rem',
                  }}
                >
                  {item.count}
                </div>
              </div>
            </ListItem>
          ))}
        </List>
      );
    }
  };

  const renderItem =
    props.searchResult?.resultList.length === 0 ? (
      <div style={{ fontSize: '1.5rem', color: 'gray', margin: 'auto' }}>
        아무것도 없어요.
      </div>
    ) : (
      makeCard(props.searchResult)
    );
  return (
    <div>
      <div style={modalStyle}>
        {props.spin && <Spinner />}
        {!props.spin && renderItem}
      </div>
    </div>
  );
};

export default SearchResultModal;
