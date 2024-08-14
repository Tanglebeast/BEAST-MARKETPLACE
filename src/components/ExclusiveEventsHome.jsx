import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/NetworkHome.css';

const EventsHome = () => {
  return (
    <div className="container">
      <div className="image-section">
        <img src="/fractalz-ticket.png" alt="networks" />
      </div>
      <div className="text-section">
        <div className='text-align-right'>
        <h1>Your Ticket to exclusive Events</h1>
        <p className=''>Each NFT grants you access to exclusive events, showcasing the physical assets. This is your opportunity to meet and connect with artists, community members, and the Fractalz team, while experiencing your investments in real life.</p>
        </div>
      </div>
    </div>
  );
};

export default EventsHome;
