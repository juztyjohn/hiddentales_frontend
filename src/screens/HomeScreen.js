import { useEffect, useReducer } from 'react';
import axios from 'axios';
import logger from 'use-reducer-logger';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Place from '../components/Place';
import { Helmet } from 'react-helmet-async';
import LoadingBox from '../components/LoadingBox';
import MessageBox from '../components/MessageBox';
// import data from '../data';

const reducer = (state, action) => {
  switch (action.type) {
    case 'FETCH_REQUEST':
      return { ...state, loading: true };
    case 'FETCH_SUCCESS':
      return { ...state, places: action.payload, loading: false };
    case 'FETCH_FAIL':
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
};

function HomeScreen() {
  const [{ loading, error, places }, dispatch] = useReducer(logger(reducer), {
    places: [],
    loading: true,
    error: '',
  });
  // const [places, setPlaces] = useState([]);
  useEffect(() => {
    const fetchData = async () => {
      dispatch({ type: 'FETCH_REQUEST' });
      try {
        const result = await axios.get('/api/places');
        dispatch({ type: 'FETCH_SUCCESS', payload: result.data });
      } catch (err) {
        dispatch({ type: 'FETCH_FAIL', payload: err.message });
      }

      // setPlaces(result.data);
    };
    fetchData();
  }, []);
  return (
    <div>
      <Helmet>
        <title>Hidden Tales</title>
      </Helmet>
      <h1>Featured Places</h1>
      <div className="places">
        {loading ? (
          <LoadingBox />
        ) : error ? (
          <MessageBox variant="danger">{error}</MessageBox>
        ) : (
          <Row>
            {places.map((place) => {
              if(place.category!=='Resort'){
                return(
                <Col key={place.slug} sm={6} md={4} lg={3} className="mb-3">
                <Place place={place}></Place>
              </Col>)
              }
              
            })}
          </Row>
        )}
      </div>
    </div>
  );
}
export default HomeScreen;
