import React, { useState } from 'react';
import '../styles/About.css';

const About = () => {
  const [activeSection, setActiveSection] = useState('ABOUT FRACTALZ');

  const sections = [
    {
      title: 'ABOUT FRACTALZ',
      content: 'At FRACTALZ, our mission is to make art accessible to everyone around the world. Through our tokenization process, we can divide physical artworks into thousands of smaller pieces, offering a unique opportunity to acquire shares in these masterpieces in the form of NFTs.'
    },
    {
      title: 'TOKENIZATION',
      content: 'The tokenization process involves splitting the artwork into thousands of little pieces, transforming it into multiple NFTs. Each NFT represents an equal share of the artworks pixels. The more NFTs you own, the larger your share and the greater the number of pixels of that artwork you possess.'
    },
    {
      title: 'AUTHENCITY',
      content: 'Each physical artwork is secured with a metaanchor label, which we call the digital fingerprint. This label employs a novel holographic technique that reflects light in a unique way, ensuring the authenticity and digital connections of the artwork.'
    },
    {
      title: 'STORAGE',
      content: 'All physical artworks are stored under optimal conditions to ensure their safety and integrity. We use state-of-the-art technology to ensure the long-term preservation of the artworks.'
    },
    {
      title: 'EXCLUSIVE EVENTS',
      content: 'Be part of exclusive events where the physical artworks are showcased, offering you the chance to experience and admire these masterpieces up close. Holding a FRACTAL NFT grants you free access to these unique and immersive events.'
    },
    {
      title: 'JOIN FRACTALZ',
      content: 'Immerse yourself in the captivating world of art and become a valued member of the FRACTALZ community, where we are revolutionizing the art market like never before. Uncover the boundless opportunities we can offer, and embark on an exhilarating journey into the realm of tokenized artworks. Own pieces of exquisite Artworks from any corner of the globe, all at your fingertips.'
    }
  ];

  return (
    <div className="about-container column">
        <h2 className='AboutUsText'>ABOUT US</h2>
        <div className='centered InfoContainerDiv'>
          <div className="sidebar">
            {sections.map((section, index) => (
              <button
                key={index}
                onClick={() => setActiveSection(section.title)}
                className={`sidebar-button ${section.title === activeSection ? 'active' : ''}`}
              >
                {section.title}
              </button>
            ))}
          </div>
          <div className="AboutContent">
            {sections.map(
              (section, index) =>
                section.title === activeSection && (
                  <section key={index}>
                    <h2>{section.title}</h2>
                    <p>{section.content}</p>
                  </section>
                )
            )}
          </div>
        </div>
    </div>
  );
};

export default About;
