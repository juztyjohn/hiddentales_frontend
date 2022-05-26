import axios from 'axios';
import { useContext, useEffect, useReducer, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';
import ListGroup from 'react-bootstrap/ListGroup';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Rating from '../components/Rating';
import { Helmet } from 'react-helmet-async';
import LoadingBox from '../components/LoadingBox';
import MessageBox from '../components/MessageBox';
import { getError } from '../utils';
import { Store } from '../Store';
import FloatingLabel from 'react-bootstrap/FloatingLabel';
import { toast } from 'react-toastify';
import Resort from '../components/Resort';
const reducer = (state, action) => {
  switch (action.type) {
    case 'REFRESH_PLACE':
      return { ...state, place: action.payload };
    case 'CREATE_REQUEST':
      return { ...state, loadingCreateReview: true };
    case 'CREATE_SUCCESS':
      return { ...state, loadingCreateReview: false };
    case 'CREATE_FAIL':
      return { ...state, loadingCreateReview: false };
    case 'FETCH_REQUEST':
      return { ...state, loading: true };
    case 'FETCH_SUCCESS':
      return { ...state, place: action.payload, loading: false };
    case 'FETCH_FAIL':
      return { ...state, loading: false, error: action.payload };
      case 'FETCH_REQUEST1':
        return { ...state, loading: true };
      case 'FETCH_SUCCESS1':
        return { ...state, resorts: action.payload, loading: false };
      case 'FETCH_FAIL1':
        return { ...state, loading: false, error: action.payload };
      default:
      return state;
  }
};

function PlaceScreen() {
  useEffect(()=>{ 
    const token = localStorage.getItem('userInfo')
    console.log(userInfo);
    if(!userInfo){
      localStorage.removeItem('userInfo');
      window.location.pathname = "/signin";
    }   
    },[])
  let reviewsRef = useRef();

  // const [resorts, setresorts] = useState([]);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [selectedImage, setSelectedImage] = useState('');

  const navigate = useNavigate();
  const params = useParams();
  const { slug } = params;
  // const [categories, setCategories] = useState([]);

  const [{ loading, error, place, resorts, loadingCreateReview }, dispatch] =
    useReducer(reducer, {
      place: [],
      resorts: [],
      loading: true,
      error: '',
    });
  useEffect(() => {
    const fetchData = async () => {
      dispatch({ type: 'FETCH_REQUEST' });
      try {
        const result = await axios.get(`/api/places/slug/${slug}`);
        dispatch({ type: 'FETCH_SUCCESS', payload: result.data });
      } catch (err) {
        dispatch({ type: 'FETCH_FAIL', payload: getError(err) });
      }
    };
    fetchData();
  }, [slug]);
  useEffect(() => {
    const fetchCategories = async () => {
      dispatch({ type: 'FETCH_REQUEST1' });

      try {
        const  result  = await axios.get(`/api/resorts`);
        dispatch({ type: 'FETCH_SUCCESS1', payload: result.data });

      } catch (err) {
        dispatch({ type: 'FETCH_FAIL1', payload: getError(err) });

        toast.error(getError(err));
      }
    };
    fetchCategories();
  }, []);

  const { state, dispatch: ctxDispatch } = useContext(Store);
  const { cart, userInfo } = state;
  const addToCartHandler = async () => {
    const existItem = cart.cartItems.find((x) => x._id === place._id);
    const quantity = existItem ? existItem.quantity + 1 : 1;
    const { data } = await axios.get(`/api/places/${place._id}`);
    if (data.countInStock < quantity) {
      window.alert('Sorry. Place');
      return;
    }
    ctxDispatch({
      type: 'CART_ADD_ITEM',
      payload: { ...place, quantity },
    });
    navigate('/cart');
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    if (!comment || !rating) {
      toast.error('Please enter comment and rating');
      return;
    }
    try {
      const { data } = await axios.post(
        `/api/places/${place._id}/reviews`,
        { rating, comment, name: userInfo.name },
        {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        }
      );

      dispatch({
        type: 'CREATE_SUCCESS',
      });
      toast.success('Review submitted successfully');
      place.reviews.unshift(data.review);
      place.numReviews = data.numReviews;
      place.rating = data.rating;
      dispatch({ type: 'REFRESH_PLACE', payload: place });
      window.scrollTo({
        behavior: 'smooth',
        top: reviewsRef.current.offsetTop,
      });
    } catch (error) {
      toast.error(getError(error));
      dispatch({ type: 'CREATE_FAIL' });
    }
  };
  return loading ? (
    <LoadingBox />
  ) : error ? (
    <MessageBox variant="danger">{error}</MessageBox>
  ) : (
    <div>
      <Row >
        <Col md={6}>
          <img
            className="img-large"
            src={selectedImage || place.image}
            alt={place.name}
          ></img>
        </Col>
        <Col md={3}>
          <ListGroup variant="flush">
            <ListGroup.Item className='Card'>
              <Helmet>
                <title>{place.name}</title>
              </Helmet>
              <h1>{place.name}</h1>
            </ListGroup.Item>
            <ListGroup.Item>
              <Rating
                rating={place.rating}
                numReviews={place.numReviews}
              ></Rating>
            </ListGroup.Item>
            <ListGroup.Item>
              <Row xs={1} md={2} className="g-2">
                {[place.image, ...place.images].map((x) => (
                  <Col key={x}>
                    <Card>
                      <Button
                        className="thumbnail"
                        type="button"
                        variant="light"
                        onClick={() => setSelectedImage(x)}
                      >
                        <Card.Img variant="top" src={x} alt="place" />
                      </Button>
                    </Card>
                  </Col>
                  
                ))}
              </Row>
            </ListGroup.Item>
            <ListGroup.Item >
          <h3 style={{color:"black"}}>District :</h3>
              <p>{place.dist}</p>
            </ListGroup.Item>
            <ListGroup.Item >
          <h3 style={{color:"black"}}>City :</h3>
              <p>{place.city}</p>
            </ListGroup.Item>
            <ListGroup.Item >
          <h3 style={{color:"black"}}>category :</h3>
              <p>{place.category}</p>
            </ListGroup.Item>
          </ListGroup>
        
        </Col>
      </Row>
      <ListGroup>
          <ListGroup.Item style={{width:"100%"}}>
          <h3 style={{color:"black"}}>Description:</h3>
              <p>{place.description}</p>
            </ListGroup.Item>
            </ListGroup>
           <div>
           <div>
      <h1>Nearby Resorts</h1>
      <div className="resorts">
        {loading ? (
          <LoadingBox />
        ) : error ? (
          <MessageBox variant="danger">{error}</MessageBox>
        ) : (
          <Row>
            {resorts.map((resort) => {
              if(resort.city === place.city){
                return(
                <Col key={resort.slug} sm={6} md={4} lg={3} className="mb-3">
                <Resort resort={resort}></Resort>
              </Col>)
              }
              
            })}
          </Row>
        )}
      </div>
    </div></div> 
      <div className="my-3">
        <h2 ref={reviewsRef}>Reviews</h2>
        <div className="mb-3">
          {place.reviews.length === 0 && (
            <MessageBox>There is no review</MessageBox>
          )}
        </div>
        <ListGroup>
          {place.reviews.map((review) => (
            <ListGroup.Item key={review._id}>
              <strong>{review.name}</strong>
              <Rating rating={review.rating} caption=" "></Rating>
              <p>{review.createdAt.substring(0, 10)}</p>
              <p>{review.comment}</p>
            </ListGroup.Item>
          ))}
        </ListGroup>
        <div className="my-3">
          {userInfo ? (
            <form onSubmit={submitHandler}>
              <h2>Write a customer review</h2>
              <Form.Group className="mb-3" controlId="rating">
                <Form.Label>Rating</Form.Label>
                <Form.Select
                  aria-label="Rating"
                  value={rating}
                  onChange={(e) => setRating(e.target.value)}
                >
                  <option value="">Select...</option>
                  <option value="1">1- Poor</option>
                  <option value="2">2- Fair</option>
                  <option value="3">3- Good</option>
                  <option value="4">4- Very good</option>
                  <option value="5">5- Excelent</option>
                </Form.Select>
              </Form.Group>
              <FloatingLabel
                controlId="floatingTextarea"
                label="Comments"
                className="mb-3"
              >
                <Form.Control
                  as="textarea"
                  placeholder="Leave a comment here"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                />
              </FloatingLabel>

              <div className="mb-3">
                <Button disabled={loadingCreateReview} type="submit">
                  Submit
                </Button>
                {loadingCreateReview && <LoadingBox></LoadingBox>}
              </div>
            </form>
          ) : (
            <MessageBox>
              Please{' '}
              <Link to={`/signin?redirect=/place/${place.slug}`}>
                Sign In
              </Link>{' '}
              to write a review
            </MessageBox>
          )}
        </div>
      </div>
    </div>
  );
}
export default PlaceScreen;
