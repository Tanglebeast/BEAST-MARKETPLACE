// src/components/MyNFTsFilter.jsx
import React, { useState, useEffect, useRef } from 'react';
import '../styles/CollectionFilter.css';
import { nftCollections } from '../NFTCollections';

const MyNFTsFilter = ({ onFilterChange, ownedCollections }) => {
    // Initialisiere activeIndices mit [0], um den ersten Filter (AVAILABILITY) geöffnet zu haben
    const [activeIndices, setActiveIndices] = useState([0]);
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
            onFilterChange(newSelectedWords);
            return newSelectedWords;
        });
    };

    const faqItems = [
        {
            question: 'AVAILABILITY',
            words: ['LISTED', 'NOT LISTED'], // "NOT LISTED" hinzugefügt
            type: 'availability'
        },
        {
            question: 'ARTIST',
            words: [...new Set(nftCollections
                .filter(collection => ownedCollections.includes(collection.name))
                .map(collection => collection.artist))],
            type: 'artist'
        },
        {
            question: 'ARTWORK',
            words: ownedCollections,
            type: 'artwork'
        }
    ];

    const contentRef = useRef([]);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
        };

        window.addEventListener('resize', handleResize);
        handleResize();

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    useEffect(() => {
        // Behalte den ersten Filter (AVAILABILITY) geöffnet, unabhängig von der Bildschirmgröße
        setActiveIndices([0]);
    }, [isMobile]); // Optional: Wenn du möchtest, dass sich das Verhalten bei der Bildschirmgröße ändert, passe dies entsprechend an

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
                            {item.words.length === 0 ? (
                                <p className="no-options">Keine Optionen verfügbar</p>
                            ) : (
                                item.words.map((word, i) => (
                                    <label key={i} className="checkbox-label">
                                        <input
                                            type="checkbox"
                                            checked={selectedWords[item.type].includes(word)}
                                            onChange={() => handleWordToggle(item.type, word)}
                                        />
                                        <span className="custom-checkbox"></span>
                                        {word}
                                    </label>
                                ))
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default MyNFTsFilter;
