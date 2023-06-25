// Import Swiper React components
import { Swiper, SwiperSlide } from 'swiper/react';
// Import Swiper styles
import 'swiper/css';
import 'swiper/css/effect-fade';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
// import required modules
import { Autoplay, EffectFade, Navigation, Pagination } from 'swiper';
import sample1 from '../../asset/sample1.jpg';
import sample2 from '../../asset/sample2.jpg';

const Slider = (props: { images: string[] }) => {
  const sampleList = [sample1, sample2];

  const slide = (list: string[]) => {
    return list.map((item, idx) => {
      return (
        <SwiperSlide key={idx}>
          {/* loadgin='lazy' 하면 넘길때 마다 로딩하는데, 창 내렸다 키면 없어짐.. */}
          <img
            style={{
              width: '100%',
              maxWidth: '700px',
              aspectRatio: '3 / 4',
              objectFit: 'cover',
              background: 'white',
            }}
            alt={`${idx}`}
            src={item}
          />
        </SwiperSlide>
      );
    });
  };

  //이미지 3:4비율 가로길이 380에 맞춰서, 비율유지 꽉차게 라는 뜻임
  return (
    <div style={{ paddingTop: '3.7rem' }}>
      <Swiper
        effect={'slide'}
        autoplay={{
          delay: 4000,
          disableOnInteraction: false,
        }}
        pagination={{
          clickable: true,
        }}
        modules={[Navigation, EffectFade, Pagination, Autoplay]}
        className='mySwiper'
        loop={false}
      >
        {/* props.images 비었으면 샘플이미지 보여준다. */}
        {props.images.length === 0 ? slide(sampleList) : slide(props.images)}
      </Swiper>
    </div>
  );
};

export default Slider;
