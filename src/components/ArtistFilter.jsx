import React, { useState, useRef, useEffect } from 'react';
import '../styles/CollectionFilter.css'; // Verwende dieselbe CSS-Datei für das Styling

const ArtistFilter = ({ sortOrder, onSortChange, showFollowing, onFollowingChange }) => {
    const [activeIndices, setActiveIndices] = useState([0, 1]); // Index 0: Filter, Index 1: Sort
    const contentRefs = useRef([]);

    const toggleAccordion = (index) => {
        setActiveIndices(prevState =>
            prevState.includes(index)
                ? prevState.filter(i => i !== index)
                : [...prevState, index]
        );
    };

    useEffect(() => {
        contentRefs.current.forEach((el, index) => {
            if (activeIndices.includes(index)) {
                el.style.maxHeight = `${el.scrollHeight}px`;
            } else {
                el.style.maxHeight = '0px';
            }
        });
    }, [activeIndices]);

    const handleSortChangeInternal = (event) => {
        const value = event.target.value;
        onSortChange(value); // Sortieränderung an die übergeordnete Komponente weitergeben
    };

    const handleFollowingToggle = (event) => {
        const checked = event.target.checked;
        onFollowingChange(checked); // Filteränderung an die übergeordnete Komponente weitergeben
    };

    return (
        <div className='artist-filter-container centered'>
            <div className="accordion-container">
                {/* Filter Section */}
                <div className="accordion-item">
                    <button
                        className={`accordion-header ${activeIndices.includes(0) ? 'active' : ''}`}
                        onClick={() => toggleAccordion(0)}
                    >
                        FILTERS <span className="icon">{activeIndices.includes(0) ? '-' : '+'}</span>
                    </button>
                    <div
                        ref={el => contentRefs.current[0] = el}
                        className="accordion-filterContent"
                    >
                        {/* Following-Filter */}
                        <div className="filter-options">
                            <label className="checkbox-label">
                                <input
                                    type="checkbox"
                                    name="showFollowing"
                                    checked={showFollowing}
                                    onChange={handleFollowingToggle}
                                />
                                <span className="custom-checkbox"></span>
                                Following
                            </label>
                            {/* Weitere Filteroptionen können hier hinzugefügt werden */}
                        </div>
                    </div>
                </div>

                {/* Sort Section */}
                <div className="accordion-item">
                    <button
                        className={`accordion-header ${activeIndices.includes(1) ? 'active' : ''}`}
                        onClick={() => toggleAccordion(1)}
                    >
                        SORT BY <span className="icon">{activeIndices.includes(1) ? '-' : '+'}</span>
                    </button>
                    <div
                        ref={el => contentRefs.current[1] = el}
                        className="accordion-filterContent"
                    >
                        {/* Sortieroptionen */}
                        <div className="sort-options column flex">
                            <label className="radio-label">
                                <input
                                    type="radio"
                                    name="sortOrder"
                                    value="communityRank"
                                    checked={sortOrder === 'communityRank'}
                                    onChange={handleSortChangeInternal}
                                />
                                <span className="custom-radio"></span>
                                Community Rank
                            </label>
                            <label className="radio-label">
                                <input
                                    type="radio"
                                    name="sortOrder"
                                    value="newest"
                                    checked={sortOrder === 'newest'}
                                    onChange={handleSortChangeInternal}
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
                                    onChange={handleSortChangeInternal}
                                />
                                <span className="custom-radio"></span>
                                Oldest
                            </label>
                            {/* Weitere Sortieroptionen können hier hinzugefügt werden */}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ArtistFilter;