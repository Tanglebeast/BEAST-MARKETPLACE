import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/HomeBanner.css'

const HomeBanner = () => {
  return (
    <div class="BannerMainDiv">
  <div class="OverlayContainer">
  <h1 className='w50 widthmedia'>INVEST, OWN, AND TRADE PHYSICAL ASSETS AROUND THE GLOBE</h1>
  <p className='w50 widthmedia'>Adopting blockchain technology into the real world makes ownership easier than ever. Anywhere, right at your fingertips.</p>
  <div className='gifsize'>
  <img src="/arrow-down.gif" alt="More Info" class="banner-image" />
  </div>
  </div>

  <div class="lines">
    <div class="line"></div>
    <div class="line"></div>
    <div class="line"></div>
  </div>
</div>
  );
};

export default HomeBanner;
