// loading-spinner.jsx
import React from 'react';
import PropTypes from 'prop-types';

const LoadingSpinner = ({ textColor = 'currentColor', size = 24 }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        style={{
            color: textColor,
            display: 'inline-block',
            verticalAlign: 'middle',
        }}
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label="Lade-Spinner"
    >
        <g fill={textColor} style={{ opacity: 1 }}>
            <path
                d="M12,23a9.63,9.63,0,0,1-8-9.5,9.51,9.51,0,0,1,6.79-9.1A1.66,1.66,0,0,0,12,2.81h0a1.67,1.67,0,0,0-1.94-1.64A11,11,0,0,0,12,23Z"
            >
                <animateTransform
                    attributeName="transform"
                    dur="0.75s"
                    repeatCount="indefinite"
                    type="rotate"
                    values="0 12 12;360 12 12"
                />
            </path>
        </g>
    </svg>
);

LoadingSpinner.propTypes = {
    /** Die Farbe des Spinners. Standardmäßig wird die aktuelle Textfarbe verwendet. */
    textColor: PropTypes.string,
    /** Die Größe des Spinners in Pixeln. Standardwert ist 24px. */
    size: PropTypes.number,
};

export default LoadingSpinner;
