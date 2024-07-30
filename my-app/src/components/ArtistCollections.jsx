import React from 'react';
import { useParams } from 'react-router-dom';
import { nftCollections } from '../NFTCollections';
import '../styles/Collections.css';
import ShortenAddress from '../components/ShortenAddress';

const ArtistCollectionCards = () => {
  const { artistname } = useParams();

  const artistCollections = nftCollections.filter(
    (collection) => collection.artist.toLowerCase() === artistname.toLowerCase()
  );

  return (
    <div className='CollectionDiv'>
      <h2>{artistname.toUpperCase()}'S GALLERY</h2>
      <div className={`collection-cards ${artistCollections.length < 5 ? 'centered-cards' : ''}`}>
        {artistCollections.map((collection, index) => (
          <a href={`/collections/${collection.address}`} key={index} className="collection-card">
            <div className='collectionbannerDiv'>
              <img src={collection.banner} alt={`${collection.name}`} className="collection-banner" />
            </div>
            <h3>{collection.name}</h3>
            <p>Address: <ShortenAddress address={collection.address} /></p>
            <p>Artist: {collection.artist}</p>
            {/* Hier kannst du weitere Details oder Aktionen hinzufügen, z.B. Links zu den NFTs */}
          </a>
        ))}
      </div>
    </div>
  );
};

export default ArtistCollectionCards;
