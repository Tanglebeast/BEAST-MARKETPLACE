import React, { useState, useEffect, useRef } from 'react';
import '../styles/CollectionFilter.css';

const UsersFilter = ({ onFilterChange }) => {
    const [activeIndices, setActiveIndices] = useState([]);
    const [selectedWords, setSelectedWords] = useState({ nftcount: [], availability: [] });

    const toggleAccordion = (index) => {
        setActiveIndices(prevState =>
            prevState.includes(index)
                ? prevState.filter(i => i !== index)
                : [...prevState, index]
        );
    };

    const handleWordToggle = (type, word) => {
        setSelectedWords(prevState => {
            const updatedWords = prevState[type].includes(word)
                ? prevState[type].filter(w => w !== word)
                : [...prevState[type], word];

            const newSelectedWords = { ...prevState, [type]: updatedWords };
            onFilterChange(newSelectedWords);
            return newSelectedWords;
        });
    };

    const faqItems = [
        {
            question: 'NFT COUNT',
            words: ['LOW TO HIGH', 'HIGH TO LOW'],
            type: 'nftcount'
        },
        {
            question: 'AVAILABILITY',
            words: ['NAMES', 'PFPS'],
            type: 'availability'
        }
    ];

    const contentRef = useRef([]);

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth <= 768) {
                setActiveIndices([]); // Standardmäßig alle Akkordeons schließen
            } else {
                setActiveIndices([0, 1]); // Beide Felder standardmäßig geöffnet
            }
        };

        handleResize(); // Initiale Überprüfung
        window.addEventListener('resize', handleResize);

        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        contentRef.current.forEach((el, index) => {
            if (activeIndices.includes(index)) {
                el.style.maxHeight = `${el.scrollHeight}px`;
            } else {
                el.style.maxHeight = '0px';
            }
        });
    }, [activeIndices]);

    return (
        <div className='accordion-filterContainer centered'>
            <div className="accordion-container">
                {faqItems.map((item, index) => (
                    <div className="accordion-item" key={index}>
                        <button
                            className={`accordion-header ${activeIndices.includes(index) ? 'active' : ''}`}
                            onClick={() => toggleAccordion(index)}
                        >
                            {item.question} <span className="icon">{activeIndices.includes(index) ? '-' : '+'}</span>
                        </button>
                        <div
                            ref={el => contentRef.current[index] = el}
                            className="accordion-filterContent"
                        >
                            {item.words.map((word, i) => (
                                <label key={i} className="checkbox-label">
                                    <input
                                        type="checkbox"
                                        checked={selectedWords[item.type].includes(word)}
                                        onChange={() => handleWordToggle(item.type, word)}
                                    />
                                    <span className="custom-checkbox"></span>
                                    {word}
                                </label>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default UsersFilter;
