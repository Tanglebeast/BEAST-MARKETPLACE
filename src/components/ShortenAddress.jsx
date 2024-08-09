//ShortenAddress.jsx
import React from 'react';

const ShortenAddress = ({ address }) => {
  if (!address || address.length <= 6) {
    return <span>{address}</span>;
  }

  const shortened = `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  return <span>{shortened}</span>;
};

export default ShortenAddress;
