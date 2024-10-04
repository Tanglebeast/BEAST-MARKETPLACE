// src/components/ArtistFilter.js
import React, { useState, useRef, useEffect } from 'react';
import '../styles/CollectionFilter.css'; // Verwende dieselbe CSS-Datei für das Styling

const ArtistFilter = ({ onSortChange }) => { // onSortChange als Prop hinzufügen
    const [isOpen, setIsOpen] = useState(true); // Standardmäßig geöffnet
    const [sortOrder, setSortOrder] = useState(''); // Sortierzustand
    const contentRef = useRef(null);

    const toggleAccordion = () => {
        setIsOpen(prevState => !prevState);
    };

    useEffect(() => {
        const content = contentRef.current;
        if (isOpen) {
            content.style.maxHeight = `${content.scrollHeight}px`;
        } else {
            content.style.maxHeight = '0px';
        }
    }, [isOpen]);

    const handleSortChange = (event) => {
        const value = event.target.value;
        setSortOrder(value);
        onSortChange(value); // Sortieränderung an die übergeordnete Komponente weitergeben
    };

    return (
        <div className='accordion-filterContainer centered'>
            <div className="accordion-container">
                <div className="accordion-item">
                    <button
                        className={`accordion-header ${isOpen ? 'active' : ''}`}
                        onClick={toggleAccordion}
                    >
                        SORT<span className="icon">{isOpen ? '-' : '+'}</span>
                    </button>
                    <div
                        ref={contentRef}
                        className="accordion-filterContent"
                    >
                        <label className="radio-label">
                            <input
                                type="radio"
                                name="sortOrder"
                                value="newest"
                                checked={sortOrder === 'newest'}
                                onChange={handleSortChange}
                            />
                            <span className="custom-radio"></span>
                            Newest
                        </label>
                        <label className="radio-label">
                            <input
                                type="radio"
                                name="sortOrder"
                                value="oldest"
                                checked={sortOrder === 'oldest'}
                                onChange={handleSortChange}
                            />
                            <span className="custom-radio"></span>
                            Oldest
                        </label>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ArtistFilter;
