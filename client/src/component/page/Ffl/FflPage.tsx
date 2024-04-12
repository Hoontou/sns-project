import { useNavigate, useParams } from 'react-router-dom';
import FollowTab from './FollowTab';
import LikeTab from './LikeTab';
import { useEffect } from 'react';
import { authHoc } from '../../../common/auth.hoc';

export interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
  searchString: string | undefined;
  userId: string;
}
export function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

export const FflPage = () => {
  const { target, type } = useParams();
  const navigate = useNavigate();

  const title = () => {
    if (type === 'like') {
      return '좋아요';
    }
    return target;
  };

  useEffect(() => {
    authHoc().then((authRes) => {
      if (authRes.success === false) {
        alert('Err while Authentication, need login');
        navigate('/signin');
        return;
      }
    });
  }, []);

  return (
    <div>
      <div
        style={{
          paddingTop: '0.5rem',
        }}
        className='text-center'
      >
        <span style={{ fontWeight: '600', fontSize: '1.2rem' }}>{title()}</span>
      </div>
      {type === 'like' ? (
        <LikeTab targetPost={target} />
      ) : (
        <FollowTab target={target} defalutTab={type === 'follower' ? 0 : 1} />
      )}

      <div></div>
    </div>
  );
};
