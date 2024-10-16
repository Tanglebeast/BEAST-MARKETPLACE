// ArtistProfile.jsx

import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import '../styles/ArtistProfile.css';
import { artistList } from '../ArtistList';
import ArtistCollectionCards from '../components/ArtistCollections';
import PollsList from '../UserGovernance/Pollslist';
import { nftCollections } from '../NFTCollections';
import PublicBlogPage from '../Blog/Publicblogpage';
import {
  followProject,
  unfollowProject,
  getFollowers,
  isFollowingProject,
  addProject,
  getMarketplaceInstance
} from '../components/utils'; // Import der Utils-Funktionen

const ArtistProfile = () => {
  const { artistname } = useParams();
  const [selectedComponent, setSelectedComponent] = useState('gallery');
  const [isFollowing, setIsFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [currentAccount, setCurrentAccount] = useState(null);
  const [projectName, setProjectName] = useState('');
  const [isOwner, setIsOwner] = useState(false);
  const [addProjectLoading, setAddProjectLoading] = useState(false);
  const [addProjectError, setAddProjectError] = useState('');

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

  // Funktion zum Abrufen des aktuellen Accounts aus localStorage und Setzen des Zustands
  const fetchAccount = () => {
    const account = localStorage.getItem('account'); // Annahme: Der Account wird unter 'account' gespeichert
    if (account) {
      setCurrentAccount(account);
    } else {
      setCurrentAccount(null);
    }
  };

  // Funktion zum Abrufen der Follower-Daten
  const fetchFollowerData = async () => {
    try {
      const followers = await getFollowers(artistname.toLowerCase());
      setFollowerCount(followers.length);

      if (currentAccount) {
        const following = await isFollowingProject(artistname.toLowerCase(), currentAccount);
        setIsFollowing(following);
      }
    } catch (error) {
      console.error('Fehler beim Abrufen der Follower-Daten:', error);
    }
  };

  // Funktion zum Folgen/Entfolgen des Projekts
  const toggleFollow = async () => {
    try {
      let success;
      if (isFollowing) {
        // Entfolgen
        success = await unfollowProject(artistname.toLowerCase());
      } else {
        // Folgen
        success = await followProject(artistname.toLowerCase());
      }

      if (success) {
        setIsFollowing(!isFollowing);
        setFollowerCount(prevCount => (isFollowing ? prevCount - 1 : prevCount + 1));
      }
    } catch (error) {
      console.error('Fehler beim Ändern des Follower-Status:', error);
    }
  };

  // Funktion zum Hinzufügen eines Projekts
  const handleAddProject = async (e) => {
    e.preventDefault();
    setAddProjectLoading(true);
    setAddProjectError('');

    try {
      const success = await addProject(projectName.trim());
      if (success) {
        alert('Projekt erfolgreich hinzugefügt!');
        setProjectName('');
      }
    } catch (error) {
      setAddProjectError('Fehler beim Hinzufügen des Projekts.');
    }

    setAddProjectLoading(false);
  };

  // Funktion zum Überprüfen, ob der aktuelle Benutzer der Owner ist
  const checkIfOwner = async () => {
    try {
      const marketplace = await getMarketplaceInstance();
      const owner = await marketplace.methods.owner().call();
      if (currentAccount && owner.toLowerCase() === currentAccount.toLowerCase()) {
        setIsOwner(true);
      } else {
        setIsOwner(false);
      }
    } catch (error) {
      console.error('Fehler beim Überprüfen des Besitzers:', error);
    }
  };

  useEffect(() => {
    fetchAccount();
  }, []);

  useEffect(() => {
    if (currentAccount) {
      fetchFollowerData();
      checkIfOwner();
    } else {
      // Wenn kein Account vorhanden ist, können wir trotzdem die Follower-Zahl anzeigen
      // Je nach Implementierung der getFollowers-Funktion könnten Sie die Follower-Zahl auch ohne Account abrufen
      fetchFollowerData();
      setIsFollowing(false);
      setIsOwner(false);
    }
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
            {/* Follower-Anzahl immer anzeigen */}
            <div>
            <h3 className='mb15'>{followerCount} FOLLOWER{followerCount !== 1 ? 'S' : ''}</h3>

            {/* Follow/Unfollow Button nur anzeigen, wenn ein Account vorhanden ist */}
            {currentAccount && (
              <button onClick={toggleFollow} className="button mb15 w90">
                <h3 className='margin0'>{isFollowing ? 'UNFOLLOW' : 'FOLLOW'}</h3>
              </button>
            )}
            </div>

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

      {/* Anzeige der Add Project Sektion nur für den Owner */}
      {/* {isOwner && (
        <div className="add-project-section">
          <h3>Neues Projekt hinzufügen</h3>
          <form onSubmit={handleAddProject}>
            <input
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="Projektname"
              required
            />
            <button type="submit" className="button" disabled={addProjectLoading}>
              {addProjectLoading ? 'Hinzufügen...' : 'Projekt Hinzufügen'}
            </button>
          </form>
          {addProjectError && <p className="error">{addProjectError}</p>}
        </div>
      )} */}

      <div className="toggle-buttons flex centered mt15 VisibleLink gap15">
        {/* <button
          onClick={() => setSelectedComponent('gallery')}
          className={selectedComponent === 'gallery' ? 'active' : ''}
        >
          <a>COLLECTIONS</a>
        </button> */}
        {/* <button
          onClick={() => setSelectedComponent('polls')}
          className={selectedComponent === 'polls' ? 'active' : ''}
        >
          <a>POLLS</a>
        </button> */}
      </div>
      <div className="component-display">
        {selectedComponent === 'gallery' && <ArtistCollectionCards />}
        {/* {selectedComponent === 'polls' && (
          <PollsList artistName={artist.name} />
        )} */}
      </div>
    </div>
  );
};

export default ArtistProfile;
