import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import '../styles/ArtistProfile.css';
import { artistList } from '../ArtistList';
import ArtistCollectionCards from '../components/ArtistCollections';
import PollsList from '../UserGovernance/Pollslist';
import { nftCollections } from '../NFTCollections';
import PublicBlogPage from '../Blog/Publicblogpage';
import Web3 from 'web3'; // Import von web3.js

// Definieren der ABI direkt im Code
const contractABI = [ { "inputs": [ { "internalType": "string", "name": "_name", "type": "string" } ], "name": "addProject", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "string", "name": "_name", "type": "string" } ], "name": "followProject", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "stateMutability": "nonpayable", "type": "constructor" }, { "inputs": [ { "internalType": "string", "name": "_name", "type": "string" } ], "name": "unfollowProject", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "string", "name": "_name", "type": "string" } ], "name": "getFollowers", "outputs": [ { "internalType": "address[]", "name": "", "type": "address[]" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "owner", "outputs": [ { "internalType": "address", "name": "", "type": "address" } ], "stateMutability": "view", "type": "function" } ];

// Importieren der getGasEstimate Funktion
import { getGasEstimate } from '../components/utils'; // Passen Sie den Pfad entsprechend an

const ArtistProfile = () => {
  const { artistname } = useParams();
  const [selectedComponent, setSelectedComponent] = useState('gallery');
  const [isFollowing, setIsFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [currentAccount, setCurrentAccount] = useState(null);

  const contractAddress = '0x01d7D562A905A53f5855C0FEa2a1C00aAF0Fc4dC'; // Ihre Contract-Adresse

  const artist = artistList.find(
    artist => artist.name.toLowerCase() === artistname.toLowerCase()
  );

  if (!artist) {
    return <div>Artist not found</div>;
  }

  const artistCollections = nftCollections.filter(
    collection => collection.artist.toLowerCase() === artistname.toLowerCase()
  );

  const currencyIcons = Array.from(
    new Set(artistCollections.map(collection => collection.currency))
  );

  // Funktion zur Initialisierung von web3
  const initWeb3 = async () => {
    if (window.ethereum) {
      const web3 = new Web3(window.ethereum);
      return web3;
    } else if (window.web3) {
      const web3 = new Web3(window.web3.currentProvider);
      return web3;
    } else {
      alert('Bitte installieren Sie MetaMask!');
      return null;
    }
  };

  // Funktion zum Abrufen des aktuellen Accounts aus dem lokalen Speicher
  const getCurrentAccount = () => {
    const account = localStorage.getItem('account');
    if (account) {
      setCurrentAccount(account);
    } else {
      // Setze currentAccount auf null, wenn kein Account im lokalen Speicher gefunden wird
      setCurrentAccount(null);
    }
  };

  // Funktion zum Abrufen der Follower-Daten
  const fetchFollowerData = async () => {
    const web3 = await initWeb3();
    if (!web3) return;

    const contract = new web3.eth.Contract(contractABI, contractAddress);

    try {
      // Abrufen der Follower-Adressen
      const followers = await contract.methods
        .getFollowers(artistname.toLowerCase())
        .call();

      setFollowerCount(followers.length);

      // Prüfen, ob der aktuelle Benutzer folgt
      if (currentAccount) {
        const isUserFollowing = followers.some(
          address => address.toLowerCase() === currentAccount.toLowerCase()
        );
        setIsFollowing(isUserFollowing);
      }
    } catch (error) {
      console.error('Fehler beim Abrufen der Follower-Daten:', error);
    }
  };

  // Funktion zum Folgen/Entfolgen des Projekts mit getGasEstimate
  const toggleFollow = async () => {
    const web3 = await initWeb3();
    if (!web3 || !currentAccount) {
      // Wenn kein Account vorhanden ist, sollte der Button nicht sichtbar sein
      return;
    }

    const contract = new web3.eth.Contract(contractABI, contractAddress);

    try {
      let method;
      if (isFollowing) {
        // Entfolgen
        method = contract.methods.unfollowProject(artistname.toLowerCase());
      } else {
        // Folgen
        method = contract.methods.followProject(artistname.toLowerCase());
      }

      // Schätzen des Gasverbrauchs mit getGasEstimate
      const { gasEstimate, gasPrice } = await getGasEstimate(
        method,
        {},
        currentAccount,
        web3 // Übergabe von web3 an die Funktion
      );

      // Senden der Transaktion mit den geschätzten Gaswerten
      await method.send({
        from: currentAccount,
        gas: gasEstimate,
        gasPrice: gasPrice,
      });

      // Aktualisieren des Zustands
      setIsFollowing(!isFollowing);
      setFollowerCount(prevCount => (isFollowing ? prevCount - 1 : prevCount + 1));
    } catch (error) {
      console.error('Fehler beim Ändern des Follower-Status:', error);
    }
  };

  useEffect(() => {
    getCurrentAccount();
  }, []);

  useEffect(() => {
    fetchFollowerData();
  }, [currentAccount]);

  return (
    <div className="artist-profile">
      <div
        className="banner"
        style={{ backgroundImage: `url(${artist.banner})` }}
      >
        {/* Banner-Inhalt falls benötigt */}
      </div>
      <div className="content">
        <div className="profile-content">
          <img src={artist.profilepicture} alt={artist.name} />
          <div className="profile-info">
            <h4>PROJECT</h4>
            <h1 className="blue">{artist.name}</h1>
            <h4>ABOUT</h4>
            <p>{artist.description}</p>
          </div>
          <div className="social-links">
            {/* Follow/Unfollow Button und Follower-Anzahl */}
            {currentAccount ? (
              <div>
                <p className='mb15'>{followerCount} Follower</p>
                <button onClick={toggleFollow} className="button mb15 w90">
                  <h3 className='margin0'>{isFollowing ? 'UNFOLLOW' : 'FOLLOW'}</h3>
                </button>
              </div>
            ) : (
              <p className='mb5'>{followerCount} Follower</p>
            )}

            {/* Ihre bestehenden Social Links */}
            <div>
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
              <a
                href={artist.instagram}
                target="_blank"
                rel="noopener noreferrer"
              >
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
      </div>
      <div className="toggle-buttons flex centered mt15 VisibleLink gap15">
        <button
          onClick={() => setSelectedComponent('gallery')}
          className={selectedComponent === 'gallery' ? 'active' : ''}
        >
          <a>COLLECTIONS</a>
        </button>
        <button
          onClick={() => setSelectedComponent('polls')}
          className={selectedComponent === 'polls' ? 'active' : ''}
        >
          <a>POLLS</a>
        </button>
      </div>
      <div className="component-display">
        {selectedComponent === 'gallery' && <ArtistCollectionCards />}
        {selectedComponent === 'polls' && (
          <PollsList artistName={artist.name} />
        )}
      </div>
    </div>
  );
};

export default ArtistProfile;
