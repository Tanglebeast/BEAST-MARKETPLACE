import React, { useState, useEffect, useRef } from 'react';
import '../styles/CollectionFilter.css';
import { nftCollections } from '../NFTCollections';

const MyNFTsFilter = ({ onFilterChange }) => {
    const [activeIndices, setActiveIndices] = useState([]);
    const [selectedWords, setSelectedWords] = useState({ artist: [], availability: [], artwork: [] });
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

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
            onFilterChange(newSelectedWords); // Update filters in parent component
            return newSelectedWords;
        });
    };

    const faqItems = [
        {
            question: 'AVAILABILITY',
            words: ['LISTED'],
            type: 'availability'
        },
        {
            question: 'ARTIST',
            words: [...new Set(nftCollections.map(collection => collection.artist))],
            type: 'artist'
        },
        {
            question: 'ARTWORK',
            words: [...new Set(nftCollections.map(collection => collection.name))],
            type: 'artwork'
        }
    ];

    const contentRef = useRef([]);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
        };

        window.addEventListener('resize', handleResize);
        handleResize(); // Initial check

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    useEffect(() => {
        if (isMobile) {
            // Keep all items closed on mobile
            setActiveIndices([]);
        } else {
            // Open some items if not mobile
            setActiveIndices([0, 1, 2]); // Example: Open all by default
        }
    }, [isMobile]);

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
                    <div className="accordion-item" key={item.question}>
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

export default MyNFTsFilter;
