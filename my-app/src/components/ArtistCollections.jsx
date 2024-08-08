import React from 'react';
import { useParams } from 'react-router-dom';
import { nftCollections } from '../NFTCollections';
import { getCurrentNetwork } from '../components/networkConfig';
import '../styles/Collections.css';
import ShortenAddress from '../components/ShortenAddress';

const ArtistCollectionCards = () => {
  const { artistname } = useParams();
  const currentNetwork = getCurrentNetwork(); // Das aktuelle Netzwerk abrufen

  // Filtern der Kollektionen nach Künstler und Netzwerk
  const artistCollections = nftCollections.filter(
    (collection) => 
      collection.artist.toLowerCase() === artistname.toLowerCase() &&
      collection.network === currentNetwork // Sicherstellen, dass das Netzwerk übereinstimmt
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
            <div className='text-align-left'>
            <h3 className='mb5'>{collection.name}</h3>
            <span className='grey mb10'>{collection.artist}</span>
            <div className='img25 flex center-ho text-uppercase mt15'>
            <img src={collection.currency} alt={`currency icon`} className="network-icon mr5" />
            <span className=''>{collection.network}</span>
            </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
};

export default ArtistCollectionCards;
