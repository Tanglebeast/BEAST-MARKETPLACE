import React, { useState, useEffect, useRef } from 'react';
import '../styles/CollectionFilter.css';

const CollectionDetailFilter = ({ onFilterChange, allAttributes, totalNFTsCount }) => {
    const contentRef = useRef([]);

    // Initialisieren von activeIndices mit Indizes 0 und 1 (PRICE und AVAILABILITY)
    const [activeIndices, setActiveIndices] = useState(() => {
        if (typeof window !== 'undefined' && window.innerWidth > 768) {
            return [0, 1]; // PRICE und AVAILABILITY geöffnet
        } else {
            return []; // Alle Filter eingeklappt
        }
    });

    const [selectedWords, setSelectedWords] = useState({ price: [], availability: [], attributes: {} });

    const toggleAccordion = (index) => {
        setActiveIndices(prevState =>
            prevState.includes(index)
                ? prevState.filter(i => i !== index)
                : [...prevState, index]
        );
    };

    const handleWordToggle = (type, word, traitType) => {
        setSelectedWords(prevState => {
            let updatedWords;
            if (type === 'attributes') {
                const currentTraitValues = prevState.attributes[traitType] || [];
                updatedWords = currentTraitValues.includes(word)
                    ? currentTraitValues.filter(w => w !== word)
                    : [...currentTraitValues, word];

                const newSelectedWords = {
                    ...prevState,
                    attributes: {
                        ...prevState.attributes,
                        [traitType]: updatedWords,
                    },
                };
                onFilterChange(newSelectedWords);
                return newSelectedWords;
            } else {
                updatedWords = prevState[type].includes(word)
                    ? prevState[type].filter(w => w !== word)
                    : [...prevState[type], word];

                const newSelectedWords = { ...prevState, [type]: updatedWords };
                onFilterChange(newSelectedWords);
                return newSelectedWords;
            }
        });
    };

    // FAQ-Items für PRICE und AVAILABILITY
    const faqItems = [
        {
            question: 'PRICE',
            words: ['LOW TO HIGH', 'HIGH TO LOW'],
            type: 'price'
        },
        {
            question: 'AVAILABILITY',
            words: ['LISTED', 'MY NFTS'],
            type: 'availability'
        }
    ];

    // Dynamisch Attribute hinzufügen mit Zählungen
    const attributeItems = Object.keys(allAttributes).map(traitType => ({
        question: traitType.toUpperCase(),
        words: Object.keys(allAttributes[traitType]),
        counts: allAttributes[traitType], // Map von Wert zu Anzahl
        type: 'attributes',
        traitType: traitType,
    }));

    const allFaqItems = [
        ...faqItems,
        ...attributeItems
    ];

    useEffect(() => {
        const handleResize = () => {
            setActiveIndices(prevActiveIndices => {
                if (window.innerWidth <= 768) {
                    // Auf mobilen Geräten alle Filter einklappen
                    return [];
                } else {
                    // Auf Desktop: PRICE und AVAILABILITY offen lassen, ohne Benutzerinteraktionen zu überschreiben
                    const indicesToKeepOpen = [0, 1];
                    const combinedIndices = Array.from(new Set([...prevActiveIndices, ...indicesToKeepOpen]));
                    return combinedIndices;
                }
            });
        };

        window.addEventListener('resize', handleResize);

        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        // Wenn neue Attribute geladen werden, nicht die activeIndices überschreiben
        // Benutzerinteraktionen bleiben erhalten
    }, [allFaqItems.length]);

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
                {allFaqItems.map((item, index) => (
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
                            {item.words.map((word, i) => {
                                let isChecked = false;
                                if (item.type === 'attributes') {
                                    isChecked = selectedWords.attributes[item.traitType]?.includes(word);
                                } else {
                                    isChecked = selectedWords[item.type].includes(word);
                                }
                                let percentage = '';
                                if (item.type === 'attributes' && item.counts[word]) {
                                    const count = item.counts[word];
                                    const percent = ((count / totalNFTsCount) * 100).toFixed(2);
                                    percentage = `(${percent}%)`;
                                }
                                return (
                                    <label key={i} className="checkbox-label">
                                        <input
                                            type="checkbox"
                                            checked={isChecked}
                                            onChange={() => handleWordToggle(item.type, word, item.traitType)}
                                        />
                                        <span className="custom-checkbox"></span>
                                        {word} <span className='grey s16 ml5'>{percentage}</span>
                                    </label>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CollectionDetailFilter;
