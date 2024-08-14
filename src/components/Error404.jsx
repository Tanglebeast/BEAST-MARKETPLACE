// NotFound.js
import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/NotFound.css'

const NotFound = () => {
  return (
    <div className='ErrorDiv'>
      <h1>ERROR 404 - PAGE NOT FOUND</h1>
      <h3>It seems you've landed in another universe.</h3>
      <img src="/error-404.png" alt="Error-404" class="error-image" />
      <Link className='actionbutton backhomebutton' to="/">BACK TO HOME</Link>
    </div>
  );
};

export default NotFound;
