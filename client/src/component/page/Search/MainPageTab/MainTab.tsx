import { useState } from 'react';
import FirstUpdatePanel from './panel/FirstUpdatePanel';
import LastUpdatePanel from './panel/LastUpdatePanel';
import LikesPanel from './panel/LikesPanel';
import { NavDropdown } from 'react-bootstrap';

export const PageItemLen = 12;

const MainTab = (props: { userId: string }) => {
  const [targetPanelIndex, setTargetPanelIndex] = useState<number>(0);

  return (
    <div>
      <NavDropdown
        style={{
          marginTop: '-0.5rem',
          marginLeft: '1.5rem',
          marginBottom: '0.3rem',
        }}
        id='nav-dropdown-dark-example'
        title={
          targetPanelIndex === 0
            ? '최근 추가된'
            : targetPanelIndex === 1
            ? '오래된'
            : '좋아요'
        }
        menuVariant='dark'
      >
        {targetPanelIndex !== 0 && (
          <NavDropdown.Item
            onClick={() => {
              setTargetPanelIndex(0);
            }}
          >
            최근 추가된
          </NavDropdown.Item>
        )}
        {targetPanelIndex !== 1 && (
          <NavDropdown.Item
            onClick={() => {
              setTargetPanelIndex(1);
            }}
          >
            오래된
          </NavDropdown.Item>
        )}
        {targetPanelIndex !== 2 && (
          <NavDropdown.Item
            onClick={() => {
              setTargetPanelIndex(2);
            }}
          >
            좋아요
          </NavDropdown.Item>
        )}
      </NavDropdown>

      <div style={{ width: '95%', margin: 'auto' }}>
        <LastUpdatePanel
          userId={props.userId}
          index={0}
          targetIndex={targetPanelIndex}
        />
        <FirstUpdatePanel
          userId={props.userId}
          index={1}
          targetIndex={targetPanelIndex}
        />
        <LikesPanel
          userId={props.userId}
          index={2}
          targetIndex={targetPanelIndex}
        />
      </div>
    </div>
  );
};

export default MainTab;
