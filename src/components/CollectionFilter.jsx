// CollectionFilter.js
import React, { useState, useEffect, useRef } from 'react';
import { nftCollections } from '../NFTCollections';
import '../styles/CollectionFilter.css';

const CollectionFilter = ({ onFilterChange }) => {
    const [activeIndices, setActiveIndices] = useState([]);
    const [selectedWords, setSelectedWords] = useState({ 
        artists: [], 
        networks: [] // Behalte networks als leeres Array bei
    });
    const [sortOrder, setSortOrder] = useState('community_rank'); // Standardmäßig "Community rank" auswählen

    const toggleAccordion = (index) => {
        setActiveIndices(prevState =>
            prevState.includes(index)
                ? prevState.filter(i => i !== index)
                : [...prevState, index]
        );
    };

    const handleWordToggle = (type, word) => {
        if (type === 'networks') return; // Verhindere Änderungen an networks

        setSelectedWords(prevState => {
            const updatedWords = prevState[type].includes(word)
                ? prevState[type].filter(w => w !== word)
                : [...prevState[type], word];
        
            const newSelectedWords = { ...prevState, [type]: updatedWords };
            onFilterChange({ ...newSelectedWords, sortOrder, networks: prevState.networks });
            return newSelectedWords;
        });
    };

    const handleSortToggle = (value) => {
        if (sortOrder === value) {
            setSortOrder(''); // Optional: Keine Sortierung auswählen
            onFilterChange({ ...selectedWords, sortOrder: '', networks: selectedWords.networks });
        } else {
            setSortOrder(value);
            onFilterChange({ ...selectedWords, sortOrder: value, networks: selectedWords.networks });
        }
    };

    // Extrahieren der einzigartigen Artists aus nftCollections
    const uniqueArtists = [...new Set(nftCollections.map(collection => collection.artist))];
    // const uniqueNetworks = [...new Set(nftCollections.map(collection => collection.network))]; // Netzwerkfilter auskommentiert

    const faqItems = [
        {
            question: 'PROJECT',
            words: uniqueArtists,
            type: 'artists'
        },
        // {
        //     question: 'NETWORK',
        //     words: uniqueNetworks,
        //     type: 'networks'
        // }, // Netzwerkfilter-Item auskommentiert
        {
            question: 'SORT', // Neue Filterbox für Sortierung
            words: ['Community rank', 'Top Traded', 'Newest', 'Oldest'], // "Top Traded" hinzugefügt
            type: 'sortOrder'
        }
    ];
    
    const contentRef = useRef([]);

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth <= 768) {
                setActiveIndices([]);
            } else {
                setActiveIndices([0, /* 1, */ 1]); // Alle Felder standardmäßig geöffnet, Netzwerkfilter auskommentiert
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
                            {item.type !== 'sortOrder' ? (
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
                            ) : (
                                item.words.map((word, i) => {
                                    let value;
                                    if (word === 'Community rank') value = 'community_rank';
                                    else if (word === 'Newest') value = 'newest';
                                    else if (word === 'Oldest') value = 'oldest';
                                    else if (word === 'Top Traded') value = 'top_traded'; // "Top Traded" Wert zuweisen

                                    return (
                                        <label key={i} className="radio-label">
                                            <input
                                                type="radio"
                                                name="sortOrder"
                                                checked={sortOrder === value}
                                                onChange={() => handleSortToggle(value)}
                                            />
                                            <span className={`custom-radio ${sortOrder === value ? 'checked' : ''}`}></span>
                                            {word}
                                        </label>
                                    );
                                })
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CollectionFilter;
