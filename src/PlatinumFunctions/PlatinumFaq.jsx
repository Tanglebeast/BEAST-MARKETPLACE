import React, { useState } from 'react';
import '../styles/FAQ.css';

const PlatinumFaq = () => {
    const [activeIndex, setActiveIndex] = useState(0); // Ändere null zu 0, um das erste Element standardmäßig geöffnet zu haben

    const toggleAccordion = (index) => {
        setActiveIndex(activeIndex === index ? null : index);
    };

    const faqItems = [
        {
            question: 'What is the purpose of the Platinum Card?',
            answer: 'The Platinum Card unlocks a wide array of exclusive opportunities and serves as a long-term revenue generator for Tanglespace. By becoming a Platinum member, you directly support the development and growth of Tanglespace, ensuring a thriving and dynamic marketplace for all users.'
        },
        {
            question: 'Are there any additional benefits to holding more than one Platinum Card?',
            answer: 'Holding more than one Platinum Card does not grant any additional benefits. The primary motivation for acquiring multiple cards is to further support Tanglespace’s expansion and success, contributing to the platform’s ongoing growth.'
        },
        {
            question: 'What else is important to know about the Platinum Card?',
            answer: 'The supply of Platinum Cards is intentionally kept high to ensure long-term availability for new members as Tanglespace continues to grow. This strategy is designed to support substantial expansion while maintaining access for new community members. Unlike tradable assets, the Platinum Card serves as a utility membership, allowing members to consistently acquire and retain their benefits without the constraints of limited availability. This ensures that as Tanglespace evolves, the Platinum Card remains a reliable and enduring symbol of membership and utility.'
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

export default PlatinumFaq;
