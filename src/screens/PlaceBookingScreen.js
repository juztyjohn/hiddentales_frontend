import Axios from 'axios';
import React, { useContext, useEffect, useReducer } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useNavigate } from 'react-router-dom';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import ListGroup from 'react-bootstrap/ListGroup';
import { toast } from 'react-toastify';
import { getError } from '../utils';
import { Store } from '../Store';
import CheckoutSteps from '../components/CheckoutSteps';
import LoadingBox from '../components/LoadingBox';

const reducer = (state, action) => {
  switch (action.type) {
    case 'CREATE_REQUEST':
      return { ...state, loading: true };
    case 'CREATE_SUCCESS':
      return { ...state, loading: false };
    case 'CREATE_FAIL':
      return { ...state, loading: false };
    default:
      return state;
  }
};

export default function PlaceBookingScreen() {
  const navigate = useNavigate();

  const [{ loading }, dispatch] = useReducer(reducer, {
    loading: false,
  });

  const { state, dispatch: ctxDispatch } = useContext(Store);
  const { cart, userInfo } = state;

  const round2 = (num) => Math.round(num * 100 + Number.EPSILON) / 100; // 123.2345 => 123.23
  cart.itemsPrice = round2(
    cart.cartItems.reduce((a, c) => a + c.quantity * c.price, 0)
  );

  cart.taxPrice = round2(0.15 * cart.itemsPrice);
  cart.totalPrice = cart.itemsPrice + cart.taxPrice;

  const placeBookingHandler = async () => {
    try {
      dispatch({ type: 'CREATE_REQUEST' });

      const { data } = await Axios.post(
        '/api/bookings',
        {
          bookingItems: cart.cartItems,
          bookingAddress: cart.bookingAddress,
          paymentMethod: cart.paymentMethod,
          bookingPrice: cart.itemsPrice,
          taxPrice: cart.taxPrice,
          totalPrice: cart.totalPrice,
        },
        {
          headers: {
            authorization: `Bearer ${userInfo.token}`,
          },
        }
      );
      ctxDispatch({ type: 'CART_CLEAR' });
      dispatch({ type: 'CREATE_SUCCESS' });
      localStorage.removeItem('cartItems');
      navigate(`/booking/${data.booking._id}`);
    } catch (err) {
      dispatch({ type: 'CREATE_FAIL' });
      toast.error(getError(err));
    }
  };

  useEffect(() => {
    if (!cart.paymentMethod) {
      
      navigate('/payment');
    }
  }, [cart, navigate]);

  return (
    <div>
      <CheckoutSteps step1 step2 step3 step4></CheckoutSteps>
      <Helmet>
        <title>Preview Booking</title>
      </Helmet>
      <h1 className="my-3">Preview Booking</h1>
      <Row>
        <Col md={8}>
          <Card className="mb-3">
            <Card.Body>
              <Card.Title>Booking</Card.Title>
              <Card.Text>
                <strong>Name:</strong> {cart.bookingAddress.fullName} <br />
                <strong>Address: </strong> {cart.bookingAddress.address},
                {cart.bookingAddress.city}, {cart.bookingAddress.postalCode}
              </Card.Text>
              <Link to="/bookings">Edit</Link>
            </Card.Body>
          </Card>

          <Card className="mb-3">
            <Card.Body>
              <Card.Title>Payment</Card.Title>
              <Card.Text>
                <strong>Method:</strong> {cart.paymentMethod}
              </Card.Text>
              <Link to="/payment">Edit</Link>
            </Card.Body>
          </Card>

          <Card className="mb-3">
            <Card.Body>
              <Card.Title>Room</Card.Title>
              <ListGroup variant="flush">
                {cart.cartItems.map((item) => (
                  <ListGroup.Item key={item._id}>
                    <Row className="align-items-center">
                      <Col md={6}>
                        <img
                          src={item.image}
                          alt={item.name}
                          className="img-fluid rounded img-thumbnail"
                        ></img>{' '}
                        <Link to={`/resort/${item.slug}`}>{item.name}</Link>
                      </Col>
                      <Col md={3}>
                        <span>{item.quantity}</span>
                      </Col>
                      <Col md={3}>₹{item.price}</Col>
                    </Row>
                    <h4 style={{color:"black"}}>Check-In</h4>
                    <Row>
                    <input type="date" id="checkin" name="checkin"/>
                    </Row>
                    <h4 style={{color:"black"}}>Check-Out</h4>
                    <Row>
                    <input type="date" id="checkout" name="checkout"/>
                    </Row>
                  </ListGroup.Item>
                ))}
              </ListGroup>
              <Link to="/wislist">Edit</Link>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card>
            <Card.Body>
              <Card.Title>Booking Summary</Card.Title>
              <ListGroup variant="flush">
                <ListGroup.Item>
                  <Row>
                    <Col>Room Price</Col>
                    <Col>₹{cart.itemsPrice.toFixed(2)}</Col>
                  </Row>
                </ListGroup.Item>

                <ListGroup.Item>
                  <Row>
                    <Col>Tax</Col>
                    <Col>₹{cart.taxPrice.toFixed(2)}</Col>
                  </Row>
                </ListGroup.Item>
                <ListGroup.Item>
                  <Row>
                    <Col>
                      <strong> Booking Total</strong>
                    </Col>
                    <Col>
                      <strong>₹{cart.totalPrice.toFixed(2)}</strong>
                    </Col>
                  </Row>
                </ListGroup.Item>
                <ListGroup.Item>
                  <div className="d-grid">
                    <Button
                      type="button"
                      onClick={placeBookingHandler}
                      disabled={cart.cartItems.length === 0}
                    >
                      Book Rooms
                    </Button>
                  </div>
                  {loading && <LoadingBox></LoadingBox>}
                </ListGroup.Item>
              </ListGroup>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
}