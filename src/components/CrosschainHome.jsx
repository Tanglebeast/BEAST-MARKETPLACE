import React from 'react';
import '../styles/CrosschainHome.css';

// Beispiel für benutzerdefinierte Icons
import CustomIcon1 from '/currency-eth.png';
import CustomIcon2 from '/currency-iota.png';
import CustomIcon3 from '/currency-bnb.png';
import CustomIcon4 from '/currency-matic.png';

const Card = ({ icon, title, borderColor, bgColor, link, hoverColor }) => {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        border: `2px solid ${borderColor}`,
        backgroundColor: `${bgColor}`,
        borderRadius: '8px',
        height: '175px',
        width: '300px',
        padding: '16px 25px',
        boxSizing: 'border-box',
        justifyContent: 'space-between'
      }}>
        <div style={{ width: '50px', marginRight: '16px' }}>
          <img src={icon} alt={title} style={{ maxWidth: '100%' }} />
        </div>
        <div>
          <h3>{title}</h3>
          <a href={link} className="card-button" style={{ borderColor, '--hoverColor': hoverColor }}>
            EXPLORE
          </a>
        </div>
      </div>
    );
  };
  
  const MainContainer = () => {
    const cardsData = [
      { icon: CustomIcon1, title: 'Ethereum', borderColor: '#898989', bgColor: 'rgba(137, 137, 137, 0.5)', link: 'https://ethereum.org', hoverColor: '#898989' },
      { icon: CustomIcon2, title: 'IOTA', borderColor: '#6abeb6', bgColor: 'rgba(106, 190, 182, 0.5)', link: 'https://iota.org', hoverColor: '#6abeb6' },
      { icon: CustomIcon3, title: 'BNB Chain', borderColor: '#f2dc6d', bgColor: 'rgba(242, 220, 109, 0.5)', link: 'https://www.binance.org', hoverColor: '#f2dc6d' },
      { icon: CustomIcon4, title: 'Polygon', borderColor: '#814cef', bgColor: 'rgba(129, 76, 239, 0.5)', link: 'https://polygon.technology', hoverColor: '#814cef' }
    ];
  
    return (
      <div className="main-container flex column centered">
        <h1>One Platform, Multiple Networks</h1>
        <p className='w80 mt0 mb30'>Fractalz as a crosschain platform provides a range of benefits for both the community and artists. Users have the flexibility to select their preferred network, as Fractalz supports the leading networks available in the crypto space.</p>
        <div className='flex gap15 columnmedia'>
        {cardsData.map((card, index) => (
          <Card
            key={index}
            icon={card.icon}
            title={card.title}
            borderColor={card.borderColor}
            bgColor={card.bgColor}
            link={card.link}
            hoverColor={card.hoverColor}
          />
        ))}
      </div>
      </div>
    );
  };
  

export default MainContainer;
