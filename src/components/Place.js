import Card from 'react-bootstrap/Card';
import { Link } from 'react-router-dom';
import Rating from './Rating';
// import axios from 'axios';
// import { useContext } from 'react';
// import { Store } from '../Store';

function Place(props) {
  const { place } = props;

  // const { state, dispatch: ctxDispatch } = useContext(Store);
  // const {
  //   cart: { cartItems },
  // } = state;

  // const addToCartHandler = async (item) => {
  //   const existItem = cartItems.find((x) => x._id === place._id);
  //   const quantity = existItem ? existItem.quantity + 1 : 1;
  //   const { data } = await axios.get(`/api/places/${item._id}`);
  //   if (data.countInStock < quantity) {
  //     window.alert('Sorry. Place is not available');
  //     return;
  //   }
  //   ctxDispatch({
  //     type: 'CART_ADD_ITEM',
  //     payload: { ...item, quantity },
  //   });
  // };

  return (
    <Card className='Card'>
      <Link to={`/place/${place.slug}`}>
        <img src={place.image} className="card-img-top" alt={place.name} />
      </Link>
      <Card.Body>
        <Link to={`/place/${place.slug}`}>
          <Card.Title>{place.name}</Card.Title>
          <Card.Title>{place.dist}</Card.Title> 
        </Link>
        <Rating rating={place.rating} numReviews={place.numReviews} />
      </Card.Body>
    </Card>
  );
}
export default Place;
