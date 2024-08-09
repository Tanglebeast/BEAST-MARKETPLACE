import React, { useState } from 'react';
import '../styles/FAQ.css';

const Accordion = () => {
    const [activeIndex, setActiveIndex] = useState(0); // Ändere null zu 0, um das erste Element standardmäßig geöffnet zu haben

    const toggleAccordion = (index) => {
        setActiveIndex(activeIndex === index ? null : index);
    };

    const faqItems = [
        {
            question: 'What is a Fractal?',
            answer: 'A Fractal is a NFT, or Non-Fungible Token. It is a type of digital asset that represents ownership or proof of authenticity of a unique item or piece of content, stored on a blockchain. Unlike cryptocurrencies like Bitcoin, which are fungible and can be exchanged on a one-to-one basis, NFTs are unique and cannot be exchanged on a like-for-like basis.'
        },
        {
            question: 'What does it mean to own a Fractal?',
            answer: 'A Fractal is an NFT that serves as a digital, tamper-proof certificate of ownership for an artwork. Each artwork is divided into a fixed number of smaller pieces. Each piece represents a percentage of the artwork, meaning you can officially own a fraction of it.'
        },
        {
            question: 'Where is the Artwork stored?',
            answer: 'Each artwork is safely stored in a UV-protected, dark room, securely packed, and kept safe from high temperatures to guarantee its longevity.'
        },
        {
            question: 'Why Fees and how much?',
            answer: 'Currently, for every sale on the platform, the seller has to pay a 6% fee. Of this fee, 3% goes into the Fractals Treasury to fund the project and exhibitions, and 3% goes to the artist.'
        },
        {
            question: 'Can I see my Artwork?',
            answer: 'Yes, there will be regular exhibition events. All artworks will be exhibited for investors to see in real life. Your Fractal NFT also serves as a digital ticket to access these events.'
        }
    ];

    return (
        <div className='w100 centered mt35'>
            <div className="accordion-container">
                {faqItems.map((item, index) => (
                    <div className="accordion-item" key={index}>
                        <button
                            className={`accordion-header ${activeIndex === index ? 'active' : ''}`}
                            onClick={() => toggleAccordion(index)}
                        >
                            {item.question} <span className="icon">{activeIndex === index ? '-' : '+'}</span>
                        </button>
                        <div className="accordion-content" style={{ maxHeight: activeIndex === index ? '1000px' : '0' }}>
                            <p>{item.answer}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Accordion;
