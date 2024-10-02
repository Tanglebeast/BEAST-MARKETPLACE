import React, { useState } from 'react';
import '../styles/FAQ.css';

const Accordion = () => {
    const [activeIndex, setActiveIndex] = useState(0); // Ändere null zu 0, um das erste Element standardmäßig geöffnet zu haben

    const toggleAccordion = (index) => {
        setActiveIndex(activeIndex === index ? null : index);
    };

    const faqItems = [
            {
                question: 'Can I list my Soonaverse collection?',
                answer: 'Yes, we can list Soonaverse collections. However, it is important to understand that this marketplace operates on the EVM. This means you cannot list the original Soonaverse collection. A new collection with the same NFTs needs to be created on the IOTA EVM, which removes the value of the original collection.'
            },
            {
                question: 'What is needed in order to submit a Soonaverse collection?',
                answer: 'To list your Soonaverse collection, we require the NFT images that have the same name or number as the NFT name, description, or metadata. We need a connection between each image and its corresponding NFT. Unfortunately, this is the only way since Soonaverse does not provide image data.'
            },
            {
                question: 'Where can I submit my collection?',
                answer: 'You can find the project registration form in the footer of our website. After reviewing your submission, we will contact you.'
            },
            {
                question: 'Can I submit an EVM collection?',
                answer: 'Yes, you can easily submit your EVM collection. Simply fill out the project registration form in the footer, and we will contact you.'
            },
            {
                question: 'Which currency is used to purchase NFTs?',
                answer: 'You can pay with IOTA and BEAST Token.'
            },
            {
                question: 'Why are there fees, and how much are they?',
                answer: 'Currently, for every sale on the platform, the seller must pay a 6% fee. Of this fee, 3% goes to the TANGLESPACE Treasury to fund the project, and 3% goes to the owner of the NFT collection. NFT sales paid with BEAST Token are feeless.'
            },
            {
                question: 'How can I avoid the artist and service fees?',
                answer: 'NFT transfers paid with BEAST Token are 100% feeless.'
            },
            {
                question: 'Is there a central storage of user data?',
                answer: 'No, all user data such as profile images, usernames, etc., are stored in the smart contract.'
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
