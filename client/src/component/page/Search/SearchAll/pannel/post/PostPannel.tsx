import { TabPanelProps } from '../../TabPanel';
import SearchPostList from './SearchPostList';

//postlist 컴포넌트 가져오기,
//데이터는 post/searchpostsbysearchstring 요청

export const PostPannel = (props: TabPanelProps) => {
  const { children, value, index, searchString, userId } = props;

  return (
    <div
      role='tabpanel'
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      style={{ display: value === 0 ? 'block' : 'none' }}
    >
      <SearchPostList searchString={searchString} userId={userId} />
    </div>
  );
};
