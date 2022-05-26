import axios from 'axios';
import React, { useContext, useEffect, useReducer } from 'react';
import { usePayPalScriptReducer } from '@paypal/react-paypal-js';
import { Helmet } from 'react-helmet-async';
import { useNavigate, useParams } from 'react-router-dom';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import ListGroup from 'react-bootstrap/ListGroup';
import Card from 'react-bootstrap/Card';
import { Link } from 'react-router-dom';
import LoadingBox from '../components/LoadingBox';
import MessageBox from '../components/MessageBox';
import { Store } from '../Store';
import { getError } from '../utils';
import { toast } from 'react-toastify';
import GooglePayButton from '@google-pay/button-react';

function reducer(state, action) {
  switch (action.type) {
    case 'FETCH_REQUEST':
      return { ...state, loading: true, error: '' };
    case 'FETCH_SUCCESS':
      return { ...state, loading: false, booking: action.payload, error: '' };
    case 'FETCH_FAIL':
      return { ...state, loading: false, error: action.payload };
    case 'PAY_REQUEST':
      return { ...state, loadingPay: true };
    case 'PAY_SUCCESS':
      return { ...state, loadingPay: false, successPay: true };
    case 'PAY_FAIL':
      return { ...state, loadingPay: false };
    case 'PAY_RESET':
      return { ...state, loadingPay: false, successPay: false };

    case 'CHECKIN_REQUEST':
      return { ...state, loadingCheckin: true };
    case 'CHECKIN_SUCCESS':
      return { ...state, loadingCheckin: false, successCheckin: true };
    case 'CHECKIN_FAIL':
      return { ...state, loadingCheckin: false };
    case 'CHECKIN_RESET':
      return {
        ...state,
        loadingCheckin: false,
        successCheckin: false,
      };
    default:
      return state;
  }
}
export default function BookingScreen() {
  const { state } = useContext(Store);
  const { userInfo } = state;

  const params = useParams();
  const { id: bookingId } = params;
  const navigate = useNavigate();

  const [
    {
      loading,
      error,
      booking,
      successPay,
      loadingPay,
      loadingCheckin,
      successCheckin,
    },
    dispatch,
  ] = useReducer(reducer, {
    loading: true,
    booking: {},
    error: '',
    successPay: false,
    loadingPay: false,
  });

  const [{ isPending }, paypalDispatch] = usePayPalScriptReducer(); 

  function onApprove () {
    console.log("approve called");
    console.log("email" + userInfo.email)
    const email =userInfo.email;
    const id = userInfo._id;
      try {
        dispatch({ type: 'PAY_REQUEST' });
        const  data  = axios.put(
          `/api/bookings/${booking._id}/pay`,
          {id:id,status:'Success',update_time:String(Date()),email:email,},
          {
            headers: { authorization: `Bearer ${userInfo.token}` },
          }
        );
        dispatch({ type: 'PAY_SUCCESS'});
        toast.success('Booking is paid');
        window.location.reload(false);
      } catch (err) {
        dispatch({ type: 'PAY_FAIL', payload: getError(err) });
        toast.error(getError(err));
      }
    
  }
  function onError(err) {
    toast.error(getError(err));
  }

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        dispatch({ type: 'FETCH_REQUEST' });
        const { data } = await axios.get(`/api/bookings/${bookingId}`, {
          headers: { authorization: `Bearer ${userInfo.token}` },
        });
        dispatch({ type: 'FETCH_SUCCESS', payload: data });
      } catch (err) {
        dispatch({ type: 'FETCH_FAIL', payload: getError(err) });
      }
    };

    if (!userInfo) {
      return navigate('/login');
    }
    if (
      !booking._id ||
      successPay ||
      successCheckin ||
      (booking._id && booking._id !== bookingId)
    ) {
      fetchBooking();
      if (successPay) {
        dispatch({ type: 'PAY_RESET' });
      }
      if (successCheckin) {
        dispatch({ type: 'CHECKIN_RESET' });
      }
    } else {
      
    }
  }, [
    booking,
    userInfo,
    bookingId,
    navigate,
    paypalDispatch,
    successPay,
    successCheckin,
  ]);

  async function checkinBookingHandler() {
    try {
      dispatch({ type: 'CHECKIN_REQUEST' });
      const { data } = await axios.put(
        `/api/bookings/${booking._id}/checkin`,
        {},
        {
          headers: { authorization: `Bearer ${userInfo.token}` },
        }
      );
      dispatch({ type: 'CHECKIN_SUCCESS', payload: data });
      toast.success('Booking is Checkined');
    } catch (err) {
      toast.error(getError(err));
      dispatch({ type: 'CHECKIN_FAIL' });
    }
  }

  return loading ? (
    <LoadingBox></LoadingBox>
  ) : error ? (
    <MessageBox variant="danger">{error}</MessageBox>
  ) : (
    <div>
      <Helmet>
        <title>Booking {bookingId}</title>
      </Helmet>
      <h1 className="my-3">Booking {bookingId}</h1>
      <Row>
        <Col md={8}>
          <Card className="mb-3">
            <Card.Body>
              <Card.Title>Booking Address</Card.Title>
              <Card.Text>
                <strong>Name:</strong> {booking.bookingAddress.fullName} <br />
                <strong>Address: </strong> {booking.bookingAddress.address},
                {booking.bookingAddress.city}, {booking.bookingAddress.postalCode}
              </Card.Text>
              {booking.isCheckedIn ? (
                <MessageBox variant="success">
                  Check In at {booking.checkedAt}
                </MessageBox>
              ) : (
                <MessageBox variant="danger">Not Checkined</MessageBox>
              )}
            </Card.Body>
          </Card>
          <Card className="mb-3">
            <Card.Body>
              <Card.Title>Payment</Card.Title>
              <Card.Text>
                <strong>Method:</strong> {booking.paymentMethod}
              </Card.Text>
              {booking.isPaid ? (
                <MessageBox variant="success">
                  Paid at {booking.paidAt}
                </MessageBox>
              ) : (
                <MessageBox variant="danger">Not Paid</MessageBox>
              )}
            </Card.Body>
          </Card>

          <Card className="mb-3">
            <Card.Body>
              <Card.Title>Room</Card.Title>
              <ListGroup variant="flush">
                {booking.bookingItems.map((item) => (
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
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="mb-3">
            <Card.Body>
              <Card.Title>Booking Summary</Card.Title>
              <ListGroup variant="flush">
                <ListGroup.Item>
                  <Row>
                    <Col>Items</Col>
                    <Col>₹{booking.bookingPrice}</Col>
                  </Row>
                </ListGroup.Item>

                <ListGroup.Item>
                  <Row>
                    <Col>Tax</Col>
                    <Col>₹{booking.taxPrice}</Col>
                  </Row>
                </ListGroup.Item>
                <ListGroup.Item>
                  <Row>
                    <Col>
                      <strong> Booking Total</strong>
                    </Col>
                    <Col>
                      <strong>₹{booking.totalPrice}</strong>
                    </Col>
                  </Row>
                </ListGroup.Item>
                {(!booking.isPaid && (booking.user ===userInfo._id)) && (
                  <ListGroup.Item>
                    {isPending ? (
                      <LoadingBox />
                    ) : (
                      <div>
                        <div className="App">
                          <GooglePayButton
                            environment="TEST"
                            paymentRequest={{
                              apiVersion: 2,
                              apiVersionMinor: 0,
                              allowedPaymentMethods: [
                                {
                                  type: 'CARD',
                                  parameters: {
                                    allowedAuthMethods: [
                                      'PAN_ONLY',
                                      'CRYPTOGRAM_3DS',
                                    ],
                                    allowedCardNetworks: ['MASTERCARD', 'VISA'],
                                  },
                                  tokenizationSpecification: {
                                    type: 'PAYMENT_GATEWAY',
                                    parameters: {
                                      gateway: 'example',
                                      gatewayMerchantId:
                                        'exampleGatewayMerchantId',
                                    },
                                  },
                                },
                              ],
                              merchantInfo: {
                                merchantId: '12345678901234567890',
                                merchantName: 'Hidden Tales Resorts',
                              },
                              transactionInfo: {
                                totalPriceStatus: 'FINAL',
                                totalPriceLabel: 'Total',
                                totalPrice: String(booking.totalPrice),
                                currencyCode: 'INR',
                                countryCode: 'IN',
                              },
                              callbackIntents: [
                                
                                'PAYMENT_AUTHORIZATION',
                              ],
                            }}
                            onLoadPaymentData={(paymentRequest) => {
                                onApprove();

                              console.log('Success', paymentRequest);
                            }}
                            onPaymentAuthorized={(paymentData) => {
                              console.log(
                                'Payment Authorised Success',
                                paymentData
                              );
                              return { transactionState: 'SUCCESS' };
                            }}
                            
                            existingPaymentMethodRequired="false"
                            buttonColor="black"
                            buttonType="Buy"
                          />
                        </div>
                      </div>
                    )}
                    {loadingPay && <LoadingBox></LoadingBox>}
                  </ListGroup.Item>
                )}
                {userInfo.isResort && booking.isPaid && !booking.isCheckedIn && (
                  <ListGroup.Item>
                    {loadingCheckin && <LoadingBox></LoadingBox>}
                    <div className="d-grid">
                      <Button type="button" onClick={checkinBookingHandler}>
                        Check-In Booking
                      </Button>
                    </div>
                  </ListGroup.Item>
                )}
              </ListGroup>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
}