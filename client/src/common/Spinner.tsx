import { Oval } from 'react-loader-spinner';

const Spinner = ({ h, w }: { h?: number; w?: number }) => {
  const height = h === undefined ? 50 : h;
  const width = w === undefined ? 50 : w;

  return (
    <>
      <Oval
        height={height}
        width={width}
        color='steelblue'
        wrapperStyle={{}}
        wrapperClass=''
        visible={true}
        ariaLabel='oval-loading'
        secondaryColor='steelblue'
        strokeWidth={2}
        strokeWidthSecondary={2}
      />
    </>
  );
};

export default Spinner;
