import React from 'react';
import PropTypes from 'prop-types';
import '../styles/NFTAttributesStats.css'; // Stelle sicher, dass du die entsprechenden CSS-Klassen definierst

const NFTAttributesStats = ({ attributes, stats }) => {
  const hasStats = stats && Array.isArray(stats) && stats.length > 0;

  return (
    <div className="nft-attributes-stats">
      <h3>Attributes</h3>
      <div className="attributes">
        {attributes && attributes.length > 0 ? (
          attributes.map((attr, index) => (
            <div key={index} className="attribute">
              <span className="trait-type">{attr.trait_type}</span>
              <span className="value">{attr.value}</span>
            </div>
          ))
        ) : (
          <p>No Attributes available.</p>
        )}
      </div>

      {hasStats && (
        <>
          <h3>Stats</h3>
          <div className="stats">
            {stats.map((stat, index) => (
              <div key={index} className="stat">
                <span className="stat-key s18">{stat.name}</span>
                <span className="stat-value">{stat.value}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

NFTAttributesStats.propTypes = {
  attributes: PropTypes.arrayOf(
    PropTypes.shape({
      trait_type: PropTypes.string.isRequired,
      value: PropTypes.string.isRequired,
    })
  ),
  stats: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      value: PropTypes.string.isRequired,
    })
  ),
};

NFTAttributesStats.defaultProps = {
  attributes: [],
  stats: [],
};

export default NFTAttributesStats;
