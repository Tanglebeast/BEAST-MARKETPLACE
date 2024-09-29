import React, { useEffect, useState } from 'react';

const BeastPrice = () => {
  const [price, setPrice] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchTokenPrice() {
      try {
        const response = await fetch(
          'https://api.geckoterminal.com/api/v2/simple/networks/shimmerevm/token_price/0x4198fe32ebf3a7de5274c3c570531c2fcb09c634'
        );
        const data = await response.json();
        const tokenPrice =
          data.data.attributes.token_prices['0x4198fe32ebf3a7de5274c3c570531c2fcb09c634'];
        const formattedPrice = parseFloat(tokenPrice).toFixed(3);
        setPrice(formattedPrice);
      } catch (error) {
        console.error('Error fetching token price:', error);
        setError('Error fetching token price');
      }
    }

    fetchTokenPrice();
  }, []);

  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      <img
        id="tokenimage"
        style={{ width: '25px', height: '25px', marginRight: '6px' }}
        src="/currency-beast.webp"
        alt="Token"
      />
      <a
        id="price"
        style={{ fontSize: '17px', marginRight: '-8px' }}
        href="https://explorer.evm.shimmer.network/token/0x4198FE32EbF3a7dE5274C3c570531c2fcB09C634"
      >
        {error || (price ? `$${price}` : 'Loading...')}
      </a>
    </div>
  );
};

export default BeastPrice;
