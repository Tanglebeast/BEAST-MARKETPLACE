import React from 'react';
import { artistList } from '../ArtistList';
import { nftCollections } from '../NFTCollections';
import { Link } from 'react-router-dom';
import '../styles/ArtistPage.css';

const ArtistPage = ({ limit }) => {
  // Slice the artist list if a limit is provided
  const artistsToShow = limit ? artistList.slice(0, limit) : artistList;

  // Function to get unique chains for an artist
  const getArtistChains = (artistName) => {
    const collections = nftCollections.filter(collection => collection.artist === artistName);
    const uniqueChains = [...new Map(collections.map(collection => [collection.network, collection.currency])).values()];
    return uniqueChains;
  };

  return (
    <div className='w100 centered'>
      <div className='Artist-Maindiv'>
        <h2>ARTISTS</h2>
        <div className="artist-page">
          {artistsToShow.map((artist, index) => (
            <Link to={`/artists/${artist.name}`} key={index} className="artist-card flex column centered">
              <div className='artistCard-image'>
                <img src={artist.profilepicture} alt={`${artist.name} profile`} className="artist-profile-picture" />
              </div>
              <div className='w95'>
                <h3 className="artist-name text-align-left blue">{artist.name}</h3>
                <div className="artist-chains text-align-left opacity-50">
                  {getArtistChains(artist.name).map((currency, idx) => (
                    <img key={idx} src={currency} alt="currency" className="currency-icon" />
                  ))}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ArtistPage;
