import React, { useContext, useEffect, useReducer } from 'react';
import axios from 'axios';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import { toast } from 'react-toastify';
import { Store } from '../Store';
import LoadingBox from '../components/LoadingBox';
import MessageBox from '../components/MessageBox';
import { getError } from '../utils';

const reducer = (state, action) => {
  switch (action.type) {
    case 'FETCH_REQUEST':
      return { ...state, loading: true };
    case 'FETCH_SUCCESS':
      return {
        ...state,
        resorts: action.payload.resorts,
        page: action.payload.page,
        pages: action.payload.pages,
        loading: false,
      };
    case 'FETCH_FAIL':
      return { ...state, loading: false, error: action.payload };
    case 'CREATE_REQUEST':
      return { ...state, loadingCreate: true };
    case 'CREATE_SUCCESS':
      return {
        ...state,
        loadingCreate: false,
      };
    case 'CREATE_FAIL':
      return { ...state, loadingCreate: false };

    case 'DELETE_REQUEST':
      return { ...state, loadingDelete: true, successDelete: false };
    case 'DELETE_SUCCESS':
      return {
        ...state,
        loadingDelete: false,
        successDelete: true,
      };
    case 'DELETE_FAIL':
      return { ...state, loadingDelete: false, successDelete: false };

    case 'DELETE_RESET':
      return { ...state, loadingDelete: false, successDelete: false };
    default:
      return state;
  }
};

export default function ResortListScreen() {
  const [
    {
      loading,
      error,
      resorts,
      pages,
      loadingCreate,
      loadingDelete,
      successDelete,
    },
    dispatch,
  ] = useReducer(reducer, {
    loading: true,
    error: '',
  });

  const navigate = useNavigate();
  const { search } = useLocation();
  const sp = new URLSearchParams(search);
  const page = sp.get('page') || 1;

  const { state } = useContext(Store);
  const { userInfo } = state;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await axios.get(`/api/resorts/admin?page=${page} `, {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        });

        dispatch({ type: 'FETCH_SUCCESS', payload: data });
      } catch (err) {}
    };

    if (successDelete) {
      dispatch({ type: 'DELETE_RESET' });
    } else {
      fetchData();
    }
  }, [page, userInfo, successDelete]);

  const createHandler = async () => {
    if (window.confirm('Are you sure to create?')) {
      try {
        dispatch({ type: 'CREATE_REQUEST' });
        const { data } = await axios.post(
          '/api/resorts',
          {},
          {
            headers: { Authorization: `Bearer ${userInfo.token}` },
          }
        );
        toast.success('resort created successfully');
        dispatch({ type: 'CREATE_SUCCESS' });
       // console.log(data);
      navigate(`/admin/resort/${data.resort._id}`);
      } catch (err) {
        toast.error(getError(error));
        dispatch({
          type: 'CREATE_FAIL',
        });
      }
    }
  };

  const deleteHandler = async (resort) => {
    if (window.confirm('Are you sure to delete?')) {
      try {
        await axios.delete(`/api/resorts/${resort._id}`, {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        });
        toast.success('resort deleted successfully');
        dispatch({ type: 'DELETE_SUCCESS' });
      } catch (err) {
        toast.error(getError(error));
        dispatch({
          type: 'DELETE_FAIL',
        });
      }
    }
  };

  return (
    <div>
      {userInfo && userInfo.isResort &&(
      <Row>
        <Col>
          <h1>Resorts</h1>
        </Col>
        <Col className="col text-end">
          <div>
            <Button type="button" onClick={createHandler}>
              Create Resort
            </Button>
          </div>
        </Col>
      </Row>
)}
      {loadingCreate && <LoadingBox></LoadingBox>}
      {loadingDelete && <LoadingBox></LoadingBox>}

      {loading ? (
        <LoadingBox></LoadingBox>
      ) : error ? (
        <MessageBox variant="danger">{error}</MessageBox>
      ) : (
        <>
        
          <table className="table" style={{background:"white"}}>
            <thead>
              <tr>
                <th>NAME</th>
                <th>PRICE</th>
                <th>AVAILABILITY</th>
                <th>CATEGORY</th>
                {
                    userInfo && userInfo.isResort &&(
                <th>ACTIONS</th>
                    )}
              </tr>
            </thead>
            <tbody>
              {resorts.map((resort) =>{
                if(resort.email===userInfo.email || userInfo.isAdmin){
                return ( 
                <tr key={resort._id}>
                  <td>{resort.name}</td>
                  <td>{resort.price}</td>
                  <td>{resort.availability}</td>
                  <td>{resort.category}</td>
                  <td>
                    {
                    userInfo && userInfo.isResort &&(
                    <Button
                      type="button"
                      variant="dark"
                      onClick={() => navigate(`/admin/resort/${resort._id}`)}
                    >
                      Edit
                    </Button>
                   )}
                    {userInfo && userInfo.isResort &&(
                    <Button
                      type="button"
                      variant="dark"
                      onClick={() => deleteHandler(resort)}
                    >
                      Delete
                    </Button>
              )}
                  </td>
                </tr>
                )}
              })}
            </tbody>
          </table>
          <div>
            {[...Array(pages).keys()].map((x) => (
              <Link
                className={x + 1 === Number(page) ? 'btn text-bold' : 'btn'}
                key={x + 1}
                to={`/admin/resorts?page=${x + 1}`}
              >
                {x + 1}
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
