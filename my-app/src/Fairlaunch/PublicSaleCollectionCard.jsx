import React from 'react';
import ShortenAddress from '../components/ShortenAddress';
import '../styles/CollectionDetailCard.css';

const PublicSaleCollectionDetailCard = ({ nft, account, currencyIcon }) => {
  return (
    <div className="collection-detail-card">
      <div className="nft-image-container">
        <img src={nft.image} alt={nft.name} className="nft-image" />
        {/* Conditionally render the "listed" badge */}
        {parseFloat(nft.price) !== 0 && (
          <div className="forsalebadge">Listed</div>
        )}
      </div>
      <div className="card-details">
        <h3>{nft.name}</h3>
        {nft.owner.toLowerCase() === account.toLowerCase() ? (
          <p className="owner-note">YOUR NFT</p>
        ) : (
          <p>Owner: <ShortenAddress address={nft.owner} /></p>
        )}
        <p>Token ID: <ShortenAddress address={nft.tokenId.toString()} /></p>
        
      </div>
    </div>
  );
};

export default PublicSaleCollectionDetailCard;
