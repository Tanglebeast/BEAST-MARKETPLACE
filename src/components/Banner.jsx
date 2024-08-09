import React from 'react';
import '../styles/Banner.css'

const Banner = () => {
  return (
    <div className="banner-container">
      <div className="card-container">
        <div className="card small left2">
          <img src="/ape.webp" alt="Image 1" />
        </div>
        <div className="card medium left">
          <img src="/duck.webp" alt="Image 2" />
        </div>
        <div className="card large center">
          <img src="/bull.webp" alt="Image 3" />
        </div>
        <div className="card medium right">
          <img src="/duck.webp" alt="Image 4" />
        </div>
        <div className="card small right2">
          <img src="/ape.webp" alt="Image 5" />
        </div>
      </div>
      <div>
        <h1>DISCOVER, COLLECT, AND SELL RWA ART <span className='AssetsSpan'>ASSETS.</span></h1>
      </div>
      <div className='DescriptionBanner'>
        <h2>Beast Art offers a transparent solution to merge the digital and physical world and opens up new possibilities to invest, trade, and enjoy NFTs.</h2>
      </div>
      <div>
        <button>Explore</button>
        <button>Explore</button>
      </div>
    </div>
  );
};

export default Banner;