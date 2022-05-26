import React, { useContext, useEffect, useReducer, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import { Store } from '../Store';
import { getError } from '../utils';
import Container from 'react-bootstrap/Container';
import ListGroup from 'react-bootstrap/ListGroup';
import Form from 'react-bootstrap/Form';
import Select from 'react-bootstrap/FormSelect';
import { Helmet } from 'react-helmet-async';
import LoadingBox from '../components/LoadingBox';
import MessageBox from '../components/MessageBox';
import Button from 'react-bootstrap/Button';
import FormGroup from 'react-bootstrap/esm/FormGroup';

const districtData = [
  {
    name:"Select"

  },
  {
    name:"Idukki",
    citys:["Idukki","Kattappana","Thodupuzha","kumily"]
  },
  {
    name:"Kottayam",
    citys:["Kottayam","Changanassery","Pala","Erattupetta","Ettumanoor","Vaikom"]
  }
];
const reducer = (state, action) => {
  switch (action.type) {
    case 'FETCH_REQUEST':
      return { ...state, loading: true };
    case 'FETCH_SUCCESS':
      return { ...state, loading: false };
    case 'FETCH_FAIL':
      return { ...state, loading: false, error: action.payload };
    case 'UPDATE_REQUEST':
      return { ...state, loadingUpdate: true };
    case 'UPDATE_SUCCESS':
      return { ...state, loadingUpdate: false };
    case 'UPDATE_FAIL':
      return { ...state, loadingUpdate: false };
    case 'UPLOAD_REQUEST':
      return { ...state, loadingUpload: true, errorUpload: '' };
    case 'UPLOAD_SUCCESS':
      return {
        ...state,
        loadingUpload: false,
        errorUpload: '',
      };
    case 'UPLOAD_FAIL':
      return { ...state, loadingUpload: false, errorUpload: action.payload };

    default:
      return state;
  }
};
export default function PlaceEditScreen() {
  const navigate = useNavigate();
  const params = useParams(); // /Place/:id
  const { id: placeId } = params;

  const { state } = useContext(Store);
  const { userInfo } = state;
  const [{ loading, error, loadingUpdate, loadingUpload }, dispatch] =
    useReducer(reducer, {
      loading: true,
      error: '',
    });

  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [{dist,city},setDistData] = useState({
    dist:"",
    city:""
  });
  const district = districtData.map((dist) => (
    <option key={dist.name} value={dist.name}>
      {dist.name}
    </option>
  ));
  const citys = districtData.find(item => item.name === dist)?.citys.map((city) =>(
    <option key={city} value={city}>
      {city}
      </option>
  ))
  const [image, setImage] = useState('');
  const [images, setImages] = useState([]);
  const [category, setCategory] = useState('');
  const [location, setLocation]= useState('');
  const [description, setDescription] = useState('');
  function handleDistrictChange(event) {
    setDistData(data => ({ city: '', dist: event.target.value }));
  }

  function handleCityChange(event) {
    // alert(event.target.value);
    setDistData(data => ({ ...data, city: event.target.value }));
  }
  useEffect(() => {
    const fetchData = async () => {
      try {
        dispatch({ type: 'FETCH_REQUEST' });
        const { data } = await axios.get(`/api/places/${placeId}`);
        setName(data.name);
        setSlug(data.slug);
        setDistData(data.dist);
        setDistData(data.city);
        setImage(data.image);
        setImages(data.images);
        setCategory(data.category);
        setLocation(data.location);
        setDescription(data.description);
        dispatch({ type: 'FETCH_SUCCESS' });
      } catch (err) {
        dispatch({
          type: 'FETCH_FAIL',
          payload: getError(err),
        });
      }
    };
    fetchData();
  }, [placeId]);

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      dispatch({ type: 'UPDATE_REQUEST' });
      await axios.put(
        `/api/places/${placeId}`,
        {
          _id: placeId,
          name,
          slug,
          dist,
          city,
          image,
          images,
          category,
          location,
          description,
        },
        {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        }
      );
      dispatch({
        type: 'UPDATE_SUCCESS',
      });
      toast.success('Place updated successfully');
      navigate('/admin/places');
    } catch (err) {
      toast.error(getError(err));
      dispatch({ type: 'UPDATE_FAIL' });
    }
  };
  const uploadFileHandler = async (e, forImages) => {
    const file = e.target.files[0];
    const bodyFormData = new FormData();
    bodyFormData.append('file', file);
    try {
      dispatch({ type: 'UPLOAD_REQUEST' });
      const { data } = await axios.post('/api/upload', bodyFormData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          authorization: `Bearer ${userInfo.token}`,
        },
      });
      dispatch({ type: 'UPLOAD_SUCCESS' });

      if (forImages) {
        setImages([...images, data.secure_url]);
      } else {
        setImage(data.secure_url);
      }
      toast.success('Image uploaded successfully. click Update to apply it');
    } catch (err) {
      toast.error(getError(err));
      dispatch({ type: 'UPLOAD_FAIL', payload: getError(err) });
    }
  };
  const deleteFileHandler = async (fileName, f) => {
    console.log(fileName, f);
    console.log(images);
    console.log(images.filter((x) => x !== fileName));
    setImages(images.filter((x) => x !== fileName));
    toast.success('Image removed successfully. click Update to apply it');
  };
  return (
    <Container className="small-container">
      <Helmet>
        <title>Edit Place ${placeId}</title>
      </Helmet>
      <h1>Edit Place {placeId}</h1>

      {loading ? (
        <LoadingBox></LoadingBox>
      ) : error ? (
        <MessageBox variant="danger">{error}</MessageBox>
      ) : (
        <Form onSubmit={submitHandler}>
           <FormGroup>
          <div className="mb-3">
            <Button
              id="chooseOnMap"
              type="button"
              variant="light"
              onClick={() => navigate(`/map/${placeId}`)}
            >
              Choose Location On Map
            </Button>
            <label>latitude: {localStorage.getItem('lat')}</label><br/>
            <label>longitude: {localStorage.getItem('lng')}</label><br/>
            {/* {shippingAddress.location && shippingAddress.location.lat ? (
              <div>
                LAT: {shippingAddress.location.lat}
                LNG:{shippingAddress.location.lng}
              </div>
            ) : (
              <div>No location</div>
            )} */}
          </div>
          </FormGroup>
          <Form.Group className="mb-3" controlId="name">
            <Form.Label>Name</Form.Label>
            <Form.Control
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="category">
            <Form.Label>District</Form.Label>
                  Sort by{' '}
                  <Select
                    value={dist}
                    onChange={handleDistrictChange}
                  >{district}
                  <option >Select</option>
                  </Select>
                
          </Form.Group>
          <Form.Group className="mb-3" controlId="category">
          <Form.Label>City</Form.Label>
                  <Select
                    value={city}
                    onChange={handleCityChange}
                  >{citys}
                  <option >Select</option>
                  </Select>
          </Form.Group>
          <Form.Group className="mb-3" controlId="category">
            <Form.Label>Category</Form.Label>
            <Select
                    value={category}
                    onChange={(e) => setCategory(e.target.value )}
                  >
                    <option >Select</option>
                    <option >Beach areas</option>
                    <option >Natural areas</option>
                    <option >Towns and cities</option>
                    <option >Winter sport areas</option>
                    <option >Areas known for culture and heritage</option>
                    <option >Hill Stations</option>
                  </Select>
          </Form.Group>
          {/* <Form.Group className="mb-3" controlId="slug">
            <Form.Label>Slug</Form.Label>
            <Form.Control
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              required
            />
          </Form.Group> */}
          <Form.Group className="mb-3" controlId="image">
            <Form.Label>Image File</Form.Label>
            <Form.Control
              value={image}
              onChange={(e) => setImage(e.target.value)}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="imageFile">
            <Form.Label>Upload Image</Form.Label>
            <Form.Control type="file" onChange={uploadFileHandler} />
            {loadingUpload && <LoadingBox></LoadingBox>}
          </Form.Group>

          <Form.Group className="mb-3" controlId="additionalImage">
            <Form.Label>Additional Images</Form.Label>
            {images.length === 0 && <MessageBox>No image</MessageBox>}
            <ListGroup variant="flush">
              {images.map((x) => (
                <ListGroup.Item key={x}>
                  {x}
                  <Button variant="light" onClick={() => deleteFileHandler(x)}>
                    <i className="fa fa-times-circle"></i>
                  </Button>
                </ListGroup.Item>
              ))}
            </ListGroup>
          </Form.Group>
          <Form.Group className="mb-3" controlId="additionalImageFile">
            <Form.Label>Upload Aditional Image</Form.Label>
            <Form.Control
              type="file"
              onChange={(e) => uploadFileHandler(e, true)}
            />
            {loadingUpload && <LoadingBox></LoadingBox>}
          </Form.Group>
          <Form.Group className="mb-3" controlId="description">
            <Form.Label>Description</Form.Label>
            <Form.Control
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </Form.Group>
          <div className="mb-3">
            <Button disabled={loadingUpdate} type="submit">
              Update
            </Button>
            {loadingUpdate && <LoadingBox></LoadingBox>}
          </div>
        </Form>
      )}
    </Container>
  );
}
