import React, { useEffect, useState } from 'react';
import '../styles/ListingPopup.css';
import { getArtistWalletsAndFees } from './utils';

const ArtistWalletDefinitionPopup = ({ closePopup }) => {
  const [artistData, setArtistData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState(''); // State für die Suchanfrage

  useEffect(() => {
    const fetchArtistData = async () => {
      try {
        const data = await getArtistWalletsAndFees();
        // Konvertiere artistFee von BigInt zu Number
        const formattedData = data.map(artist => ({
          ...artist,
          artistFee: Number(artist.artistFee)
        }));
        setArtistData(formattedData);
      } catch (error) {
        setError('Error fetching artist data.');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchArtistData();
  }, []);

  // Filter-Funktion basierend auf der Suchanfrage
  const filteredArtistData = artistData.filter(artist => 
    artist.collectionName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    artist.collectionAddress.toLowerCase().includes(searchQuery.toLowerCase()) ||
    artist.artistWallet.toLowerCase().includes(searchQuery.toLowerCase()) ||
    artist.artistFee.toString().includes(searchQuery)
  );

  if (loading) {
    return (
      <div className="popup-overlay">
        <div className="popup-content">
          <button className="close-button" onClick={closePopup}>
            &times;
          </button>
          <h2>Loading...</h2>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="popup-overlay">
        <div className="popup-content">
          <button className="close-button" onClick={closePopup}>
            &times;
          </button>
          <h2>{error}</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="popup-overlay">
      <div className="popup-content">
        <button className="close-button" onClick={closePopup}>
          &times;
        </button>
        <div className="artist-data overflow-auto w100">
          <h2 className='text-align-center'>Artist Wallets</h2>
          {/* Suchleiste hinzufügen */}
          <input 
            className='Artistwalletsearchbar'
            type="text"
            placeholder="Search by collection name, address, wallet, or fee"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            />

          {filteredArtistData.map((artist, index) => (
            <div key={index} className="artist-info text-align-left">
              <div className='flex column'>
                <span className='blue'><strong>{artist.collectionName}</strong></span>
                <span className='grey'>{artist.collectionAddress}</span>
              </div>
              <div className='flex column mt15'>
                <span>Artist Wallet</span>
                <span className='grey'>{artist.artistWallet}</span>
              </div>
              <div className='flex column mt15 mb30'>
                <span>Fees</span>
                <span className='grey'>{artist.artistFee}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ArtistWalletDefinitionPopup;
