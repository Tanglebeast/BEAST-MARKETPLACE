import React from 'react';
import { artistList } from '../ArtistList';
import { Link } from 'react-router-dom';
import '../styles/ArtistPage.css';

const ArtistPage = ({ limit }) => {
  const artistsToShow = limit ? artistList.slice(0, limit) : artistList;

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
            <h3 className="artist-name text-align-left">{artist.name}</h3>
            </div>
          </Link>
        ))}
      </div>
    </div>
    </div>
  );
};

export default ArtistPage;
