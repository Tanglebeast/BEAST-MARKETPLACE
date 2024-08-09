import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/HomeBanner.css'

const HomeBanner = () => {
  return (
    <div className="BannerMainDiv">
      <div className="text-container">
        <h1>DISCOVER,</h1>
        <h2>COLLECT AND SELL</h2>
        <h2 className='blue ts'>REAL WORLD NFT ART</h2>
        <p>We are merging the digital and physical art worlds, enabling everyone to discover and collect physical art NFTs.</p>
        <Link to={`/collections`}>
        <button className="bannerbutton">Explore</button>
        </Link>
        <Link to={`/about`}>
        <button className="bannerbutton2">Learn More</button>
        </Link>

      </div>
      <div className="imagebanner-container">
        <div className="image-item-left">
          <img src="./fractalz-card3.png" alt="Image 1" />
        </div>
        <div className="image-item-large">
          <img src="./fractalz-card1.png" alt="Image 2" />
        </div>
        <div className="image-item-right">
          <img src="./fractalz-card2.png" alt="Image 3" />
        </div>
      </div>
    </div>
  );
};

export default HomeBanner;