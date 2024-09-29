// src/components/PollFilter.jsx
import React, { useState, useEffect, useRef } from 'react';
import '../styles/CollectionFilter.css';

const PollFilter = ({ onFilterChange, artists }) => { // artists als Prop hinzufügen
    const contentRef = useRef([]);

    // Initialisieren von activeIndices mit Indizes 0, 1, 2 und 3 (SORT, AVAILABILITY, ARTIST und POLL TYPE)
    const [activeIndices, setActiveIndices] = useState(() => {
        if (typeof window !== 'undefined' && window.innerWidth > 768) {
            return [0, 1, 2, 3]; // SORT, AVAILABILITY, ARTIST und POLL TYPE geöffnet
        } else {
            return []; // Alle Filter eingeklappt
        }
    });

    const [selectedSort, setSelectedSort] = useState('desc'); // 'asc' oder 'desc'
    const [selectedAvailability, setSelectedAvailability] = useState(['Live']); // Standardmäßig 'Live' ausgewählt
    const [selectedArtists, setSelectedArtists] = useState([]); // Künstlerfilter
    const [selectedPollTypes, setSelectedPollTypes] = useState([]); // Neuer Zustand für Poll Type

    const toggleAccordion = (index) => {
        setActiveIndices(prevState =>
            prevState.includes(index)
                ? prevState.filter(i => i !== index)
                : [...prevState, index]
        );
    };

    const handleSortChange = (sortOption) => {
        setSelectedSort(prevSort => {
            const newSort = prevSort === sortOption ? '' : sortOption;
            onFilterChange({
                sort: newSort,
                availability: selectedAvailability,
                artists: selectedArtists,
                pollTypes: selectedPollTypes
            });
            return newSort;
        });
    };

    const handleAvailabilityToggle = (availabilityOption) => {
        setSelectedAvailability(prevState => {
            let updatedAvailability;
            if (prevState.includes(availabilityOption)) {
                updatedAvailability = prevState.filter(a => a !== availabilityOption);
            } else {
                updatedAvailability = [...prevState, availabilityOption];
            }
            onFilterChange({
                sort: selectedSort,
                availability: updatedAvailability,
                artists: selectedArtists,
                pollTypes: selectedPollTypes
            });
            return updatedAvailability;
        });
    };

    const handleArtistToggle = (artistOption) => {
        setSelectedArtists(prevState => {
            let updatedArtists;
            if (prevState.includes(artistOption)) {
                updatedArtists = prevState.filter(a => a !== artistOption);
            } else {
                updatedArtists = [...prevState, artistOption];
            }
            onFilterChange({
                sort: selectedSort,
                availability: selectedAvailability,
                artists: updatedArtists,
                pollTypes: selectedPollTypes
            });
            return updatedArtists;
        });
    };

    const handlePollTypeToggle = (pollTypeOption) => {
        setSelectedPollTypes(prevState => {
            let updatedPollTypes;
            if (prevState.includes(pollTypeOption)) {
                updatedPollTypes = prevState.filter(pt => pt !== pollTypeOption);
            } else {
                updatedPollTypes = [...prevState, pollTypeOption];
            }
            onFilterChange({
                sort: selectedSort,
                availability: selectedAvailability,
                artists: selectedArtists,
                pollTypes: updatedPollTypes
            });
            return updatedPollTypes;
        });
    };

    const filterItems = [
        {
            question: 'SORT',
            words: ['Sort by newest', 'Sort by oldest'],
            type: 'sort',
            values: ['desc', 'asc']
        },
        {
            question: 'AVAILABILITY',
            words: ['Live', 'Expired'],
            type: 'availability',
            values: ['Live', 'Expired']
        },
        {
            question: 'ARTIST',
            words: artists, // Künstlerliste dynamisch einfügen
            type: 'artist',
            values: artists
        },
        {
            question: 'TYPE',
            words: ['PROJECTS', 'BEAST'],
            type: 'pollType',
            values: ['PROJECTS', 'BEAST']
        }
    ];

    useEffect(() => {
        const handleResize = () => {
            setActiveIndices(prevActiveIndices => {
                if (window.innerWidth <= 768) {
                    // Auf mobilen Geräten alle Filter einklappen
                    return [];
                } else {
                    // Auf Desktop: SORT, AVAILABILITY, ARTIST und POLL TYPE offen lassen, ohne Benutzerinteraktionen zu überschreiben
                    const indicesToKeepOpen = [0, 1, 2, 3];
                    const combinedIndices = Array.from(new Set([...prevActiveIndices, ...indicesToKeepOpen]));
                    return combinedIndices;
                }
            });
        };

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

    // Initiale Filteränderung an die Elternkomponente senden
    useEffect(() => {
        onFilterChange({
            sort: selectedSort,
            availability: selectedAvailability,
            artists: selectedArtists,
            pollTypes: selectedPollTypes
        });
    }, []); // Leeres Abhängigkeitsarray, um nur beim Mounten auszuführen

    return (
        <div className='accordion-filterContainer centered'>
            <div className="accordion-container">
                {filterItems.map((item, index) => (
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
                                if (item.type === 'sort') {
                                    isChecked = selectedSort === item.values[i];
                                } else if (item.type === 'availability') {
                                    isChecked = selectedAvailability.includes(word);
                                } else if (item.type === 'artist') {
                                    isChecked = selectedArtists.includes(word);
                                } else if (item.type === 'pollType') {
                                    isChecked = selectedPollTypes.includes(word);
                                }
                                return (
                                    <label key={i} className="checkbox-label">
                                        <input
                                            type="checkbox"
                                            name={item.type === 'sort' ? 'sort' : item.type === 'availability' ? `availability-${i}` : item.type === 'artist' ? `artist-${i}` : `pollType-${i}`}
                                            value={item.values[i]}
                                            checked={isChecked}
                                            onChange={() => {
                                                if (item.type === 'sort') {
                                                    handleSortChange(item.values[i]);
                                                } else if (item.type === 'availability') {
                                                    handleAvailabilityToggle(word);
                                                } else if (item.type === 'artist') {
                                                    handleArtistToggle(word);
                                                } else if (item.type === 'pollType') {
                                                    handlePollTypeToggle(word);
                                                }
                                            }}
                                        />
                                        <span className="custom-checkbox"></span>
                                        {word}
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

export default PollFilter;
