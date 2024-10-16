import React from 'react';
import '../styles/Giveaway.css';

const Giveaway = () => {
  return (
    <div 
    className='w100 flex centered PlatinumDropBanner pt0' 
    style={{ 
      backgroundImage: `url(/platinum-background.png)`,
      height: '100vh'
    }}
  >
    
    <div className="giveaway-container">
      <div className="giveaway-content">
        <h2>X-GIVEAWAY</h2>
        <p className="giveaway-description s16">
          Get a fair chance to be one of the first members holding a PLATINUM CARD NFT!<br></br>
          What it is and how it works will be announced soon.
        </p>
        <ol className="giveaway-steps bold">
          <li>Follow @tanglebeasts on X.</li>
          <br></br>
          <li>Create a post on X.
            <br></br>
            <br></br>
                - Talk about your experience with TANGLESPACE.
            <br></br>
            <br></br>
                - Tag @tanglebeasts and add #TANGLESPACE.
            <br></br>
            <br></br>
                - Add a screenshot from TANGLESPACE.
                <br></br>
            <br></br>
                - Add the domain "https://tanglespace.app".
          </li>
        </ol>
        <br></br>
        <p className="giveaway-description s16">
          5 Platinum Cards will be given away once TANGLESPACE is live on the mainnet.
        </p>
      </div>
      <div className="giveaway-video">
        <video src="/giveaway.mp4" loop autoPlay muted />
      </div>
    </div>
    </div>
  );
};

export default Giveaway;
