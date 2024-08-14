import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/SupportArtistsHome.css';

const SupportArtistsHome = () => {
  return (
    <div className="containerSupport flex column">
      {/* <div className="image-section">
        <img src="/fractalz-ticket.png" alt="networks" />
      </div> */}
      <div className="text-sectionSupport">
        <div className='text-align-center flex centered column'>
        <h1 className='w80'>Support Artists Around the Globe</h1>
        <p className='w80 wnone'>Art has always been a popular and stable investment throughout human history. With our diverse selection of artists, you can choose your personal favorites to minimize risk or invest in emerging talents, speculating on their growth and the potential increase in the Artworks values. Each NFT transfer contributes 3% to the artists, providing them with crucial support and motivation to advance their careers.</p>
        </div>
      </div>
    </div>
  );
};

export default SupportArtistsHome;
