import React, { useState } from 'react';
import '../styles/FAQ.css';

const Platinumbenefits = () => {
    const [activeIndex, setActiveIndex] = useState(0); // Ändere null zu 0, um das erste Element standardmäßig geöffnet zu haben

    const toggleAccordion = (index) => {
        setActiveIndex(activeIndex === index ? null : index);
    };

    const faqItems = [
        {
            question: 'Crown Icon Next to Username',
            answer: 'Stand out in the community with a distinctive crown icon displayed alongside your username or address, symbolizing your prestigious Platinum status.'
        },
        {
            question: 'Customizable User Profiles',
            answer: 'Platinum members enjoy enhanced personalization by adding a bio and linking their social media accounts to their profiles. This exclusive feature allows Platinum members to view each other’s bios and social media links, fostering a network of elite connections.'
        },
        {
            question: 'Platinum Wishlist',
            answer: 'Create and manage your Platinum Wishlist by adding favorite NFTs for quick access. Additionally, Platinum members can see how many wishlists each NFT is featured on, providing insights into the popularity and trending status of various collections and their individual NFTs.'
        },
        {
            question: 'Customizable Results Per Page',
            answer: 'By default, Tanglespace paginates NFT collections to optimize speed and user experience. As a Platinum member, you have the exclusive ability to customize the number of results displayed per page, ranging from 10 to 1,000. This powerful feature allows you to maintain a comprehensive overview of all NFTs within a collection, enhancing your browsing efficiency and overall user experience.'
        },
        {
            question: 'Platinum Voting Rights',
            answer: 'Have a direct influence on the future of Tanglespace. Platinum members are granted voting rights, enabling you to participate in key decisions and shape the platform’s development.'
        },
        {
            question: 'Token-Gated Platinum Chats',
            answer: 'Gain exclusive access to token-gated chat groups where you can engage in meaningful conversations, receive insider insights, and stay informed with premium information reserved for Platinum members.'
        },
        {
            question: 'Early Access to New Features',
            answer: 'Be the first to explore and test new features within Tanglespace. Platinum members receive priority access, ensuring you stay ahead with the latest advancements and enhancements.'
        }
    ];
    

    return (
        <div className='w100 centered mt15'>
            <div className="accordion-container-drop">
                {faqItems.map((item, index) => (
                    <div className="accordion-item" key={index}>
                        <button
                            className={`accordion-header accordionPadding ${activeIndex === index ? 'active' : ''}`}
                            onClick={() => toggleAccordion(index)}
                        >
                            {item.question} <span className="icon">{activeIndex === index ? '-' : '+'}</span>
                        </button>
                        <div className="accordion-content text-align-left opacity-70" style={{ maxHeight: activeIndex === index ? '1000px' : '0' }}>
                            <p>{item.answer}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Platinumbenefits;
