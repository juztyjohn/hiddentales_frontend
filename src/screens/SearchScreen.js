import React, { useEffect, useReducer, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { getError } from '../utils';
import { Helmet } from 'react-helmet-async';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Rating from '../components/Rating';
import LoadingBox from '../components/LoadingBox';
import MessageBox from '../components/MessageBox';
import Button from 'react-bootstrap/Button';
import Place from '../components/Place';
import LinkContainer from 'react-router-bootstrap/LinkContainer';

const reducer = (state, action) => {
  switch (action.type) {
    case 'FETCH_REQUEST':
      return { ...state, loading: true };
    case 'FETCH_SUCCESS':
      return {
        ...state,
        places: action.payload.places,
        page: action.payload.page,
        pages: action.payload.pages,
        countPlaces: action.payload.countPlaces,
        loading: false,
      };
    case 'FETCH_FAIL':
      return { ...state, loading: false, error: action.payload };

    default:
      return state;
  }
};

// const prices = [
//   {
//     name: '$1 to $50',
//     value: '1-50',
//   },
//   {
//     name: '$51 to $200',
//     value: '51-200',
//   },
//   {
//     name: '$201 to $1000',
//     value: '201-1000',
//   },
// ];

export const ratings = [
  {
    name: '4stars & up',
    rating: 4,
  },

  {
    name: '3stars & up',
    rating: 3,
  },

  {
    name: '2stars & up',
    rating: 2,
  },

  {
    name: '1stars & up',
    rating: 1,
  },
];

export default function SearchScreen() {
  const navigate = useNavigate();
  const { search } = useLocation();
  const sp = new URLSearchParams(search); // /search?category=Shirts
  const category = sp.get('category') || 'all';
  const query = sp.get('query') || 'all';
  const dist = sp.get('dist') || 'all';
  const city = sp.get('city') || 'all';
  const rating = sp.get('rating') || 'all';
  const order = sp.get('order') || 'newest';
  const page = sp.get('page') || 1;

  const [{ loading, error, places, pages, countPlaces }, dispatch] =
    useReducer(reducer, {
      loading: true,
      error: '',
    });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await axios.get(
          `/api/places/search?page=${page}&query=${query}&category=${category}&dist=${dist}&city=${city}&rating=${rating}&order=${order}`
        );
        dispatch({ type: 'FETCH_SUCCESS', payload: data });
      } catch (err) {
        dispatch({
          type: 'FETCH_FAIL',
          payload: getError(error),
        });
      }
    };
    fetchData();
  }, [category, error, order, page, query, dist, city, rating]);

  const [categories, setCategories] = useState([]);
  const [dists, setDists]=useState([]);
  const [citys, setCitys]=useState([]);

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
  }, [dispatch]);
  useEffect(() => {
    const fetchDists = async () => {
      try {
        const { data } = await axios.get(`/api/places/dists`);
        setDists(data);
      } catch (err) {
        toast.error(getError(err));
      }
    };
    fetchDists();
  }, [dispatch]);

  const getFilterUrl = (filter) => {
    const filterPage = filter.page || page;
    const filterCategory = filter.category || category;
    const filterQuery = filter.query || query;
    const filterDist = filter.dist || dist;
    const filterCity = filter.city || city;
    const filterRating = filter.rating || rating;
    // const filterPrice = filter.price || price;
    const sortOrder = filter.order || order;
    return `/search?category=${filterCategory}&query=${filterQuery}&rating=${filterRating}&dist=${filterDist}&city=${filterCity}&order=${sortOrder}&page=${filterPage}`;
  };
  return (
    <div>
      <Helmet>
        <title>Search Places</title>
      </Helmet>
      <Row>
        <Col md={3}>
          <h3>Category</h3>
          <div>
            <ul>
              <li>
                <Link
                  className={'all' === category ? 'text-bold' : ''}
                  to={getFilterUrl({ category: 'all' })}
                >
                  Any
                </Link>
              </li>
              {categories.map((c) => (
                <li key={c}>
                  <Link
                    className={c === category ? 'text-bold' : ''}
                    to={getFilterUrl({ category: c })}
                  >
                    {c}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <h3>District</h3>
          <div>
            <ul>
              <li>
                <Link
                  className={'all' === dist ? 'text-bold' : ''}
                  to={getFilterUrl({ dist: 'all' })}
                >
                  Any
                </Link>
              </li>
              {dists.map((d) => (
                <li key={d}>
                  <Link
                    className={d === dist ? 'text-bold' : ''}
                    to={getFilterUrl({ dist: d })}
                  >
                    {d}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3>Avg. Customer Review</h3>
            <ul>
              {ratings.map((r) => (
                <li key={r.name}>
                  <Link
                    to={getFilterUrl({ rating: r.rating })}
                    className={`${r.rating}` === `${rating}` ? 'text-bold' : ''}
                  >
                    <Rating caption={' & up'} rating={r.rating}></Rating>
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  to={getFilterUrl({ rating: 'all' })}
                  className={rating === 'all' ? 'text-bold' : ''}
                >
                  <Rating caption={' & up'} rating={0}></Rating>
                </Link>
              </li>
            </ul>
          </div>
        </Col>
        <Col md={9}>
          {loading ? (
            <LoadingBox></LoadingBox>
          ) : error ? (
            <MessageBox variant="danger">{error}</MessageBox>
          ) : (
            <>
              <Row className="justify-content-between mb-3" style={{color:"white"}}>
                <Col md={6}>
                  <div>
                    {countPlaces === 0 ? 'No' : countPlaces} Results
                    {query !== 'all' && ' : ' + query}
                    {category !== 'all' && ' : ' + category}
                    {dist !== 'all' && ' : ' + dist}
                    {city !== 'all' && ' : ' + city}
                    {rating !== 'all' && ' : Rating ' + rating + ' & up'}
                    {query !== 'all' ||
                    category !== 'all' ||
                    rating !== 'all' ? (
                      <Button
                        variant="light"
                        onClick={() => navigate('/search')}
                      >
                        <i className="fas fa-times-circle"></i>
                      </Button>
                    ) : null}
                  </div>
                </Col>
                <Col className="text-end">
                  Sort by{' '}
                  <select
                    value={order}
                    onChange={(e) => {
                      navigate(getFilterUrl({ order: e.target.value }));
                    }}
                  >
                    <option value="newest">Newest Places Added</option>
                    <option value="toprated">Avg. Customer Reviews</option>
                  </select>
                </Col>
              </Row>
              {places.length === 0 && (
                <MessageBox>No Place Found</MessageBox>
              )}

              <Row>
                {places.map((place) => (
                  <Col sm={6} lg={4} className="mb-3" key={place._id}>
                    <Place place={place}></Place>
                  </Col>
                ))}
              </Row>

              <div>
                {[...Array(pages).keys()].map((x) => (
                  <LinkContainer
                    key={x + 1}
                    className="mx-1"
                    to={getFilterUrl({ page: x + 1 })}
                  >
                    <Button
                      className={Number(page) === x + 1 ? 'text-bold' : ''}
                      variant="light"
                    >
                      {x + 1}
                    </Button>
                  </LinkContainer>
                ))}
              </div>
            </>
          )}
        </Col>
      </Row>
    </div>
  );
}
