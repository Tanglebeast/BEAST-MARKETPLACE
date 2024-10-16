// src/components/PlatinumProfilePopup.jsx

import React, { useState } from 'react';
import '../styles/PlatinumProfilePopup.css';
import { updateProfile, removeProfile } from '../PlatinumFunctions/PlatinumUtils'; // Funktionen importieren

const PlatinumProfilePopup = ({ isOpen, onClose, socialMediaLinks, setSocialMediaLinks }) => {
  const [twitter, setTwitter] = useState(socialMediaLinks.twitter || '');
  const [instagram, setInstagram] = useState(socialMediaLinks.instagram || '');
  const [discord, setDiscord] = useState(socialMediaLinks.discord || '');
  const [bio, setBio] = useState(socialMediaLinks.bio || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSave = async () => {
    setLoading(true);
    setError(null);
    try {
      await updateProfile(twitter, instagram, discord, bio);
      setSocialMediaLinks({ twitter, instagram, discord, bio });
      onClose();
    } catch (error) {
      console.error('Fehler beim Aktualisieren des Profils:', error);
      setError('Fehler beim Aktualisieren des Profils.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    setError(null);
    try {
      await removeProfile();
      setSocialMediaLinks({ twitter: '', instagram: '', discord: '', bio: '' });
      onClose();
    } catch (error) {
      console.error('Fehler beim Löschen des Profils:', error);
      setError('Fehler beim Löschen des Profils.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="popup-overlay">
      <div className="popup-content-platinumProfile">
        <h2>Edit Profile</h2>
        {error && <p className="error-message">{error}</p>}
        <label className='w80 text-align-left'>
          X
          <input className='listinginput-list mt5 mb15' type="text" value={twitter} onChange={(e) => setTwitter(e.target.value)} placeholder='Enter X username ("tanglebeasts")' />
        </label>
        <label className='w80 text-align-left'>
          INSTAGRAM
          <input className='listinginput-list mt5 mb15' type="text" value={instagram} onChange={(e) => setInstagram(e.target.value)} placeholder='Enter Instagram username ("tanglebeasts")' />
        </label>
        <label className='w80 text-align-left'>
          DISCORD
          <input className='listinginput-list mt5 mb15' type="text" value={discord} onChange={(e) => setDiscord(e.target.value)} placeholder='Enter Discord username ("tanglebeasts")' />
        </label>
        <label className='w80 text-align-left'>
          BIO
          <textarea className='listinginput-list mt5 mb15 h100px' value={bio} onChange={(e) => setBio(e.target.value)} placeholder='Enter a Bio' />
        </label>
        <div className="button-group mt10">
          <button className='actionbutton mr10 white' onClick={handleSave} disabled={loading}>Save</button>
          <button className='actionbutton white' onClick={handleDelete} disabled={loading}>Reset Profile</button>
          <button className='actionbutton ml10 white' onClick={onClose} disabled={loading}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default PlatinumProfilePopup;
