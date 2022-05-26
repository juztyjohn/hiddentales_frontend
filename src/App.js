import { BrowserRouter, Link, Route, Routes } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import HomeScreen from './screens/HomeScreen';
import PlaceScreen from './screens/PlaceScreen';
import Navbar from 'react-bootstrap/Navbar';
import Badge from 'react-bootstrap/Badge';
import Nav from 'react-bootstrap/Nav';
import NavDropdown from 'react-bootstrap/NavDropdown';
import Container from 'react-bootstrap/Container';
import { LinkContainer } from 'react-router-bootstrap';
import { useContext, useEffect, useState } from 'react';
import { Store } from './Store';
import SigninScreen from './screens/SigninScreen';
import SignupScreen from './screens/SignupScreen';
// import PlaceViewScreen from './screens/PlaceViewScreen';
import ProfileScreen from './screens/ProfileScreen';
import Button from 'react-bootstrap/Button';
import { getError } from './utils';
import axios from 'axios';
import SearchBox from './components/SearchBox';
import SearchScreen from './screens/SearchScreen';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import PlaceListScreen from './screens/PlaceListScreen';
import PlaceEditScreen from './screens/PlaceEditScreen';
import UserListScreen from './screens/UserListScreen';
import UserEditScreen from './screens/UserEditScreen';
import MapScreen from './screens/MapScreen';
import PlaceBookingScreen from './screens/PlaceBookingScreen';
import ResortListScreen from './screens/ResortListScreen';
import ResortEditScreen from './screens/ResortEditScreen';
import DashboardScreen from './screens/DashboardScreen';
import PaymentMethodScreen from './screens/PaymentMethodScreen';
import BookingScreen from './screens/BookingScreen';
import BookingHistoryScreen from './screens/BookingHistoryScreen';
import BookingAddressScreen from './screens/BookingAddressScreen';
import CartScreen from './screens/CartScreen';
import ResortScreen from './screens/ResortScreen';
import BookingListScreen from './screens/BookingListScreen';
import ResortHome from './screens/ResortHome';
import ResortRegScreen from './screens/ResortRegScreen';
import ForgotPasswordScreen from './screens/ForgetPasswordScreen';

// import Map from './Map';


function App() {
  const { state, dispatch: ctxDispatch } = useContext(Store);
  const { fullBox, cart ,userInfo } = state;

  const signoutHandler = () => {
    ctxDispatch({ type: 'USER_SIGNOUT' });
    localStorage.removeItem('userInfo');
    localStorage.removeItem('bookingAddress');
    localStorage.removeItem('paymentMethod');
    window.location.href = '/signin';
  };
  const [sidebarIsOpen, setSidebarIsOpen] = useState(false);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await axios.get(`/api/resorts/categories`);
        setCategories(data);
      } catch (err) {
        toast.error(getError(err));
      }
    };
    fetchCategories();
  }, []);
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await axios.get(`/api/places/categories`);
        setCategories(data);
      } catch (err) {
        toast.error(getError(err));
      }
    };
    fetchCategories();
  }, []);
  return (
    <BrowserRouter>
      <div
        className={
          sidebarIsOpen
            ? fullBox
              ? 'site-container active-cont d-flex flex-column full-box'
              : 'site-container active-cont d-flex flex-column'
            : fullBox
            ? 'site-container d-flex flex-column full-box'
            : 'site-container d-flex flex-column'
        }
      >
        <ToastContainer position="bottom-center" limit={1} />
        <header>
          <Navbar bg="transparent" variant="dark" expand="lg">
            <Container>
              <Button
                variant="transparent"
                onClick={() => setSidebarIsOpen(!sidebarIsOpen)}
              >
                <i className="fas fa-bars"></i>
              </Button>

              <LinkContainer to="/">
                <Navbar.Brand>Hidden Tales</Navbar.Brand>
              </LinkContainer>
              <Navbar.Toggle aria-controls="basic-navbar-nav" />
              <Navbar.Collapse id="basic-navbar-nav">
                <SearchBox />
                <Nav className="me-auto  w-100  justify-content-end">
                  <Link to='/pro' className="nav-link">
                    Resorts
                  </Link>
                  {userInfo && !userInfo.isResort &&(
                <Link to="/wishlist" className="nav-link">
                    wishlist
                    {cart.cartItems.length > 0 && (
                      <Badge pill bg="danger">
                        {cart.cartItems.reduce((a, c) => a + c.quantity, 0)}
                      </Badge>
                    )}
                  </Link>
                  )}
                  {userInfo ? (
                    <NavDropdown title={userInfo.name} id="basic-nav-dropdown">
                      <LinkContainer to="/profile">
                        <NavDropdown.Item>User Profile</NavDropdown.Item>
                      </LinkContainer>
                      <LinkContainer to="/bookinghistory">
                        <NavDropdown.Item>Booking History</NavDropdown.Item>
                      </LinkContainer>
                      <NavDropdown.Divider />
                      <Link
                        className="dropdown-item"
                        to="#signout"
                        onClick={signoutHandler}
                      >
                        Sign Out
                      </Link>
                    </NavDropdown>
                  ) : (
                    <Link className="nav-link" to="/signin">
                      Sign In
                    </Link>
                  ) }
                  {userInfo && userInfo.isAdmin && (
                    <NavDropdown title="Admin" id="admin-nav-dropdown">
                      <LinkContainer to="/admin/dashboard">
                        <NavDropdown.Item>Dashboard</NavDropdown.Item>
                      </LinkContainer>
                      <LinkContainer to="/admin/resorts">
                        <NavDropdown.Item>Resorts</NavDropdown.Item>
                      </LinkContainer>
                      <LinkContainer to="/admin/bookings">
                        <NavDropdown.Item>Bookings</NavDropdown.Item>
                      </LinkContainer>
                      <LinkContainer to="/admin/places">
                        <NavDropdown.Item>Places</NavDropdown.Item>
                      </LinkContainer>
                      <LinkContainer to="/admin/users">
                        <NavDropdown.Item>Users</NavDropdown.Item>
                      </LinkContainer>
                    </NavDropdown>
                  )}
                  {userInfo && userInfo.isResort &&(
                    <NavDropdown title="Resort" id="admin-nav-dropdown">
                     <LinkContainer to="/admin/resorts">
                     <NavDropdown.Item>Resorts</NavDropdown.Item>
                   </LinkContainer>
                   <LinkContainer to="/admin/bookings">
                     <NavDropdown.Item>Bookings</NavDropdown.Item>
                   </LinkContainer>
                   </NavDropdown>
                  )}
                  
                </Nav>
              </Navbar.Collapse>
            </Container>
          </Navbar>
        </header>
        <div
          className={
            sidebarIsOpen
              ? 'active-nav side-navbar d-flex justify-content-between flex-wrap flex-column'
              : 'side-navbar d-flex justify-content-between flex-wrap flex-column'
          }
        >
          <Nav className="flex-column text-white w-100 p-2">
            <Nav.Item>
              <strong>Categories</strong>
            </Nav.Item>
            {categories.map((category) => (
              <Nav.Item key={category}>
                <LinkContainer
                  to={`/search?category=${category}`}
                  onClick={() => setSidebarIsOpen(false)}
                >
                  <Nav.Link>{category}</Nav.Link>
                </LinkContainer>
              </Nav.Item>
            ))}
          </Nav>
        </div>
        <main>
          <Container className="mt-3">
            <Routes>
              <Route path="/place/:slug" element={<PlaceScreen />} />
              <Route path="/resort/:slug" element={<ResortScreen />} />
              <Route path="/wishlist" element={<CartScreen />} />
              <Route path="/search" element={<SearchScreen />} />
              <Route path="/signin" element={<SigninScreen />} />
              <Route path="/signup" element={<SignupScreen />} />  
              <Route path="/forgetpassword" element={<ForgotPasswordScreen />} />

              <Route path="/resortsignup" element={<ResortRegScreen />} />

              {/* <Route path="/map" element={<Map />} /> */}

              {/* <Route path="/resortreg" element={<ResortReg />} /> */}

              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <ProfileScreen />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/map"
                element={
                  <ProtectedRoute>
                    <MapScreen />
                  </ProtectedRoute>
                }
              />
              <Route path="/placebooking" element={<PlaceBookingScreen />} />
              <Route
                path="/map/:pid"
                element={
                  <ProtectedRoute>
                    <MapScreen />
                  </ProtectedRoute>
                }
              />
             <Route
                path="/booking/:id"
                element={
                  <ProtectedRoute>
                    <BookingScreen />
                  </ProtectedRoute>
                }
              ></Route>
              <Route
                path="/bookinghistory"
                element={
                  <ProtectedRoute>
                    <BookingHistoryScreen />
                  </ProtectedRoute>
                }
              ></Route>
              <Route
                path="/bookings"
                element={<BookingAddressScreen />}
              ></Route>
              <Route path="/payment" element={<PaymentMethodScreen />}></Route>
              {/* Admin Routes */}
              <Route
                path="/admin/dashboard"
                element={
                  <AdminRoute>
                    <DashboardScreen />
                  </AdminRoute>
                }
              ></Route>
              <Route
                path="/admin/bookings"
                element={
                  <AdminRoute>
                    <BookingListScreen />
                  </AdminRoute>
                }
              ></Route>
             
             
              <Route
                path="/admin/users"
                element={
                  <AdminRoute>
                    <UserListScreen />
                  </AdminRoute>
                }
              ></Route>
              <Route
                path="/admin/resorts"
                element={
                  <AdminRoute>
                    <ResortListScreen />
                  </AdminRoute>
                }
              ></Route>
              <Route
                path="/admin/resort/:id"
                element={
                  <AdminRoute>
                    <ResortEditScreen />
                  </AdminRoute>
                }
              ></Route>
              <Route
                path="/admin/places"
                element={
                  <AdminRoute>
                    <PlaceListScreen />
                  </AdminRoute>
                }
              ></Route>
              <Route
                path="/admin/place/:id"
                element={
                  <AdminRoute>
                    <PlaceEditScreen />
                  </AdminRoute>
                }
              ></Route>
              <Route
                path="/admin/user/:id"
                element={
                  <AdminRoute>
                    <UserEditScreen />
                  </AdminRoute>
                }
              ></Route>

              <Route path="/pro" element={<ResortHome />} />
              
              <Route path="/" element={<HomeScreen />} />
            </Routes>
          </Container>
        </main>
        <footer>
          <div className="text-center">All rights reserved</div>
        </footer>
      </div>
    </BrowserRouter>
  );
}

export default App;
