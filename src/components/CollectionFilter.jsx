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
    const [likesSort, setLikesSort] = useState(''); // Zustand für Likes-Sortierung

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
            onFilterChange({ ...newSelectedWords, likes: likesSort, networks: prevState.networks });
            return newSelectedWords;
        });
    };

    const handleLikesToggle = (value) => {
        if (likesSort === value) {
            setLikesSort('');
            onFilterChange({ ...selectedWords, likes: '', networks: selectedWords.networks });
        } else {
            setLikesSort(value);
            onFilterChange({ ...selectedWords, likes: value, networks: selectedWords.networks });
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
            question: 'LIKES', // Neue Filterbox für Likes
            words: ['Most Likes', 'Low Likes'],
            type: 'likesSort'
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
                            {item.type !== 'likesSort' ? (
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
                                    const value = word === 'Most Likes' ? 'most_likes' : 'low_likes';
                                    return (
                                        <label key={i} className="checkbox-label">
                                            <input
                                                type="checkbox"
                                                checked={likesSort === value}
                                                onChange={() => handleLikesToggle(value)}
                                            />
                                            <span className={`custom-checkbox ${likesSort === value ? 'checked' : ''}`}></span>
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
