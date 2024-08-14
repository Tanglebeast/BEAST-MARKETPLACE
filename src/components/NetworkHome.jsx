import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/NetworkHome.css';

const NetworkHome = () => {
  return (
    <div className="container">
      <div className="text-section">
        <div className='text-align-left'>
        <h1>One Platform, Multiple Networks</h1>
        <p className=''>Fractalz as a multichain platform provides a range of benefits for both the community and artists. Users have the flexibility to select their preferred network, as Fractalz supports the leading networks available in the crypto space.</p>
        </div>
      </div>
      <div className="image-section">
        <img src="/networks.png" alt="networks" />
      </div>
    </div>
  );
};

export default NetworkHome;
