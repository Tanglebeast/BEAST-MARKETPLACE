import React from 'react';
import { useParams } from 'react-router-dom';
import '../styles/ArtistProfile.css'; // Import the corresponding CSS file
import { artistList } from '../ArtistList';
import ArtistCollectionCards from '../components/ArtistCollections';
import { nftCollections } from '../NFTCollections';

const ArtistProfile = () => {
  const { artistname } = useParams();

  // Find the artist object based on artistname from the URL
  const artist = artistList.find(artist => artist.name.toLowerCase() === artistname.toLowerCase());

  if (!artist) {
    return <div>Artist not found</div>;
  }

   // Find collections belonging to this artist
   const artistCollections = nftCollections.filter(collection => collection.artist.toLowerCase() === artistname.toLowerCase());

   // Extract unique currency icons for the artist's collections
   const currencyIcons = Array.from(new Set(artistCollections.map(collection => collection.currency)));

  return (
    <div className="artist-profile">
      <div className="banner" style={{ backgroundImage: `url(${artist.banner})` }}>
        {/* Banner content if needed */}
      </div>
      <div className="content">
        <div className="profile-content">
          <img src={artist.profilepicture} alt={artist.name} />
            <div className='profile-info'>
              <h4>ARTIST</h4>
              <h1 className='blue'>{artist.name}</h1>
              <h4>ABOUT</h4>
              <p>{artist.description}</p>
            </div>
          <div className="social-links">
            <div className='ArtistNetworks'>
            <h4>NETWORKS</h4>
            {currencyIcons.map((icon, index) => (
                <img key={index} src={icon} alt="currency icon" className="network-icon mr5" />
              ))}
            </div>
          <h4>SOCIALS</h4>
            {artist.twitter && (
              <a href={artist.twitter} target="_blank" rel="noopener noreferrer">
                <img src="/x.png" alt="Twitter Icon" />
              </a>
            )}
            {artist.discord && (
              <a href={artist.discord} target="_blank" rel="noopener noreferrer">
                <img src="/discord.png" alt="Discord Icon" />
              </a>
            )}
            {artist.instagram && (
              <a href={artist.instagram} target="_blank" rel="noopener noreferrer">
                <img src="/instagram.png" alt="Instagram Icon" />
              </a>
            )}
            {artist.website && (
              <a href={artist.website} target="_blank" rel="noopener noreferrer">
                <img src="/website.png" alt="Website Icon" />
              </a>
            )}
          </div>
          </div>
      </div>
      <ArtistCollectionCards />
    </div>
  );
};

export default ArtistProfile;
