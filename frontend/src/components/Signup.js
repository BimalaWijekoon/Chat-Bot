import React, { useState } from 'react';
import './Signup.css'; // Ensure this CSS file exists and is styled properly
import Modal from './Modal'; // Ensure this component is implemented
import { useNavigate } from 'react-router-dom';
import Navbar from "./Navbar"; // Ensure this Navbar component is implemented

const Signup = () => {
  // States to manage form inputs
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [relative, setRelative] = useState('');
  const [relativeNum, setRelativeNum] = useState('');
  const [telephone, setTelephone] = useState('');
  const [relativeEmail, setRelativeEmail] = useState('');
  const [profilePicture, setProfilePicture] = useState(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState(null);

  // States to manage form validation and UI feedback
  const [errors, setErrors] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [modalType, setModalType] = useState('info');
  const [isSuccess, setIsSuccess] = useState(false);

  const navigate = useNavigate();

  // Validation function to check the form fields
  const validate = (name, value) => {
    let error = '';
    switch (name) {
      case 'firstName':
      case 'lastName':
      case 'relative':
      case 'relativeNum':
      case 'telephone':
        if (!value) {
          error = 'Please fill this field';
        }
        break;
      case 'email':
      case 'relativeEmail':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!value) {
          error = 'Please fill this field';
        } else if (!emailRegex.test(value)) {
          error = 'Invalid email address';
        }
        break;
      case 'password':
        if (!value) {
          error = 'Please fill this field';
        } else if (value.length < 6) {
          error = 'Password must be at least 6 characters long';
        }
        break;
      default:
        break;
    }
    setErrors((prevErrors) => ({
      ...prevErrors,
      [name]: error,
    }));
    return error === '';
  };

  // Handle input changes and validate fields
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'profilePicture') {
      const file = files[0];
      setProfilePicturePreview(URL.createObjectURL(file));

      // Convert the image to Base64
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result.split(',')[1];
        setProfilePicture(`data:image/png;base64,${base64String}`);
      };
      reader.readAsDataURL(file);
    } else {
      switch (name) {
        case 'firstName':
          setFirstName(value);
          break;
        case 'lastName':
          setLastName(value);
          break;
        case 'email':
          setEmail(value);
          break;
        case 'password':
          setPassword(value);
          break;
        case 'relative':
          setRelative(value);
          break;
        case 'relativeNum':
          setRelativeNum(value);
          break;
        case 'telephone':
          setTelephone(value);
          break;
        case 'relativeEmail':
          setRelativeEmail(value);
          break;
        default:
          break;
      }
      validate(name, value); // Validate the field on change
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check if the form is valid
    const formIsValid = Object.keys(errors).every((key) => errors[key] === '') &&
      [firstName, lastName, email, password, relative, relativeNum, telephone, relativeEmail].every((value) => value !== '');

    if (!formIsValid) {
      setModalMessage('Please check the form again.');
      setModalType('warning');
      setIsSuccess(false);
      setShowModal(true);
      return;
    }

    // Prepare form data to send to backend
    const formData = {
      firstName,
      lastName,
      email,
      password,
      relative,
      relativeNum,
      telephone,
      relativeEmail,
      profilePicture, // Send the Base64 encoded image string
    };

    try {
      const response = await fetch('http://localhost:5000/signup', {  // Use the correct API endpoint
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setModalMessage(errorData.error || 'Failed to sign up.');
        setModalType('error');
        setIsSuccess(false);
        setShowModal(true);
        return;
      }

      setModalMessage('Signup successful.');
      setModalType('success');
      setIsSuccess(true);
      setShowModal(true);

      // Delay the redirection for 1 second
      setTimeout(() => {
        navigate('/login'); // Redirect to login page after signup
      }, 1000);

    } catch (error) {
      console.error('Error signing up:', error.message);
      setModalMessage('Failed to sign up.');
      setModalType('error');
      setIsSuccess(false);
      setShowModal(true);
    }
  };

  // Handle closing the modal
  const handleCloseModal = () => {
    setShowModal(false);
    if (isSuccess) {
      navigate('/login'); // Redirect to login page if signup is successful
    }
  };

  return (
    <>
      <Navbar />
      <Modal show={showModal} handleClose={handleCloseModal} message={modalMessage} type={modalType} />
      <div className="signup-page">
        <div className="signup-outer-container">
          <div className="signup-container">
            <div className="signup-header">
              <div className="signup-title">
                <h2>Sign Up</h2>
              </div>
              <div className="signup-profile-picture-container">
                <input
                  type="file"
                  id="profilePicture"
                  name="profilePicture"
                  onChange={handleChange}
                  style={{ display: 'none' }}
                />
                <label htmlFor="profilePicture" className="signup-profile-picture-label">
                  {profilePicturePreview ? (
                    <img src={profilePicturePreview} alt="Profile" className="signup-profile-picture" />
                  ) : (
                    <div className="signup-profile-picture-placeholder">+</div>
                  )}
                </label>
              </div>
            </div>
            <form className="signup-form" onSubmit={handleSubmit}>
              <div className="signup-form-row">
                <div className="signup-form-group">
                  <label htmlFor="firstName">First Name</label>
                  <div className="signup-input-container">
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      placeholder="First Name"
                      value={firstName}
                      onChange={handleChange}
                      required
                    />
                    {errors.firstName && <span className="signup-tooltip">{errors.firstName}</span>}
                  </div>
                </div>
                <div className="signup-form-group">
                  <label htmlFor="lastName">Last Name</label>
                  <div className="signup-input-container">
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      placeholder="Last Name"
                      value={lastName}
                      onChange={handleChange}
                      required
                    />
                    {errors.lastName && <span className="signup-tooltip">{errors.lastName}</span>}
                  </div>
                </div>
              </div>
              <div className="signup-form-row">
                <div className="signup-form-group">
                  <label htmlFor="email">Email Address</label>
                  <div className="signup-input-container">
                    <input
                      type="email"
                      id="email"
                      name="email"
                      placeholder="Enter email"
                      value={email}
                      onChange={handleChange}
                      required
                    />
                    {errors.email && <span className="signup-tooltip">{errors.email}</span>}
                  </div>
                </div>
                <div className="signup-form-group">
                  <label htmlFor="password">Password</label>
                  <div className="signup-input-container">
                    <input
                      type="password"
                      id="password"
                      name="password"
                      placeholder="Enter password (min. 6 characters)"
                      value={password}
                      onChange={handleChange}
                      required
                    />
                    {errors.password && <span className="signup-tooltip">{errors.password}</span>}
                  </div>
                </div>
              </div>
              <div className="signup-form-row">
                <div className="signup-form-group">
                  <label htmlFor="telephone">Telephone Number</label>
                  <div className="signup-input-container">
                    <input
                      type="text"
                      id="telephone"
                      name="telephone"
                      placeholder="Enter telephone number"
                      value={telephone}
                      onChange={handleChange}
                      required
                    />
                    {errors.telephone && <span className="signup-tooltip">{errors.telephone}</span>}
                  </div>
                </div>
                <div className="signup-form-group">
                  <label htmlFor="relativeEmail">Relative Email</label>
                  <div className="signup-input-container">
                    <input
                      type="text"
                      id="relativeEmail"
                      name="relativeEmail"
                      placeholder="Enter Relative Email"
                      value={relativeEmail}
                      onChange={handleChange}
                      required
                    />
                    {errors.relativeEmail && <span className="signup-tooltip">{errors.relativeEmail}</span>}
                  </div>
                </div>
              </div>
              <div className="signup-form-row">
                <div className="signup-form-group">
                  <label htmlFor="relative">Relative Name</label>
                  <div className="signup-input-container">
                    <input
                        type="text"
                        id="relative"
                        name="relative"
                        placeholder="Enter Relative Name"
                        value={relative}
                        onChange={handleChange}
                        required
                    />
                    {errors.relative && <span className="signup-tooltip">{errors.relative}</span>}
                  </div>
                </div>
                <div className="signup-form-group">
                  <label htmlFor="relativeNum">Relative Telephone Number</label>
                  <div className="signup-input-container">
                    <input
                        type="text"
                        id="relativeNum"
                        name="relativeNum"
                        placeholder="Enter Relative Telephone Number"
                        value={relativeNum}
                        onChange={handleChange}
                        required
                    />
                    {errors.relativeNum && <span className="signup-tooltip">{errors.relativeNum}</span>}
                  </div>
                </div>
              </div>
              <button type="submit" className="signup-button">Sign Up</button>
              <div className="signup-already-registered">
                Already registered? <a href="/login">Sign in</a>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}

export default Signup;
