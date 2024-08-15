import React, { useState } from 'react';
import CollectionCards from './Collections';
import ArtistPage from './ArtistPage';
import '../styles/Home.css';
import Banner from '../components/Banner';
import AllNFTs from './AllNFTs';
import ArtworkGrid from '../components/ArtworkGrid';
import { ArtworkGridItems } from '../components/ArtworkGridItems';
import HomeBanner from '../components/HomeBanner';
import FaqHome from '../components/FaqHome';
import AboutHome from '../components/AboutHome';
import NetworkselectionDropdown from '../components/NetworkselectionDropdown'; // Importieren Sie die Dropdown-Komponente
import NetworkHome from '../components/NetworkHome';
import EventsHome from '../components/ExclusiveEventsHome';
import SupportArtistsHome from '../components/SupportArtistsHome';
import CrosschainHome from '../components/CrosschainHome';

export function Homepage() {
  const [selectedNetwork, setSelectedNetwork] = useState(localStorage.getItem('selectedNetwork') || 'shimmerevm');

  return (
    <div className="HomeDiv centered column">
      <div className='w100 centered'>
        <HomeBanner />
      </div>
      <div className='w100 centered'>
        <SupportArtistsHome />
      </div>
      <div className='w100 centered'>
        <CrosschainHome />
      </div>
      <div className='w100 centered'>
        <EventsHome />
      </div>
      <div className='w100 centered column bghome pb30'>
        <ArtistPage limit={4} />
      </div>
      <div className='w100 centered column FaqHome OnlyDesktop'>
        <AboutHome />
      </div>
    </div>
  );
}
