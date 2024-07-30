//Home.jsx
import React from 'react';
import CollectionCards from './Collections';
import ArtistPage from './ArtistPage';
import '../styles/Home.css'
import Banner from '../components/Banner';
import AllNFTs from './AllNFTs';
import ArtworkGrid from '../components/ArtworkGrid';
import { ArtworkGridItems } from '../components/ArtworkGridItems';
import HomeBanner from '../components/HomeBanner';
import FaqHome from '../components/FaqHome';
import AboutHome from '../components/AboutHome';

// Komponente für die gesamte Homepage
export function Homepage() {
  return (
    <div className="HomeDiv centered column">
      <div className='w100 centered'>
        <HomeBanner />
      </div>
      <div className='centered column w100'>
      <div className='centered-collection-cards'>
        <CollectionCards limit={4} showSearchBar={false} showFilter={false} />
      </div>
      </div>
      <div className='HomeGridBackDiv'>
        <h2>TRENDING ARTWORK</h2>
      {ArtworkGridItems.map((item, index) => (
        <ArtworkGrid
          key={index}
          cols={item.cols}
          rows={item.rows}
          width={item.width}
          height={item.height}
          images={item.images}
        />
      ))}
    </div>
    <div className='w100 centered column FaqHome'>
      <AboutHome />
    </div>
    <div className='w100 centered column'>
      <ArtistPage limit={4} />
    </div>
  </div>
  );
}
