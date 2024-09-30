import React, { useEffect, useState } from 'react';

const BeastToIotaPrice = ({ listingPrice, onConversion }) => {
//   const [beastPrice, setBeastPrice] = useState(null);
  const [beastPrice, setBeastPrice] = useState(0.002);
  const [iotaPrice, setIotaPrice] = useState(null);
  const [convertedPrice, setConvertedPrice] = useState(null);
  const [error, setError] = useState(null);

  // Fetch BEAST price in USD
  useEffect(() => {
    async function fetchBeastPrice() {
      try {
        const response = await fetch(
          'https://api.geckoterminal.com/api/v2/simple/networks/shimmerevm/token_price/0x4198fe32ebf3a7de5274c3c570531c2fcb09c634'
        );
        const data = await response.json();
        const beastTokenPrice = parseFloat(data.data.attributes.token_prices['0x4198fe32ebf3a7de5274c3c570531c2fcb09c634']);
        setBeastPrice(beastTokenPrice);
      } catch (error) {
        console.error('Error fetching BEAST price:', error);
        setError('Error fetching BEAST price');
      }
    }

    async function fetchIotaPrice() {
      try {
        const response = await fetch(
          'https://api.coingecko.com/api/v3/simple/price?ids=iota&vs_currencies=usd'
        );
        const data = await response.json();
        const iotaTokenPrice = data.iota.usd;
        setIotaPrice(iotaTokenPrice);
      } catch (error) {
        console.error('Error fetching IOTA price:', error);
        setError('Error fetching IOTA price');
      }
    }

    fetchBeastPrice();
    fetchIotaPrice();
  }, []);

  // Convert BEAST price to IOTA based on listingPrice
  useEffect(() => {
    if (beastPrice && iotaPrice && listingPrice) {
      const beastToIota = (beastPrice / iotaPrice) * listingPrice;
      setConvertedPrice(beastToIota.toFixed(2));
      onConversion(beastToIota.toFixed(2)); // Send conversion result to parent component
    }
  }, [beastPrice, iotaPrice, listingPrice]);

};

export default BeastToIotaPrice;
