import axios from 'axios';
import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Metadata } from '../../common/Post/Postlist';

const SearchHashtag = () => {
  const { targetHashtag } = useParams(); //url에서 가져온
  const navigate = useNavigate();

  useEffect(() => {
    if (targetHashtag === undefined) {
      navigate('/');
    }

    axios
      .post('/gateway/post/getpostsbyhashtag', {
        hashtag: targetHashtag,
        page: 0,
      })
      .then((res) => {
        const metadatas: Metadata[] = res.data.metadatas;
        console.log(metadatas);
        return;
      });
  }, []);

  return <>this is SearchHashtag</>;
};

export default SearchHashtag;
