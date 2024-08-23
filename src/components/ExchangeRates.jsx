// ExchangeRates.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';

const ExchangeRates = () => {

  useEffect(() => {
    const fetchExchangeRates = async () => {
      try {
        const response = await axios.get('https://api.coingecko.com/api/v3/simple/price', {
          params: {
            ids: 'shimmer,matic-network,binancecoin,ethereum',
            vs_currencies: 'usd'
          }
        });
        setRates(response.data);
      } catch (err) {
        setError('Fehler beim Abrufen der Wechselkurse.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchExchangeRates();
  }, []);

};

export default ExchangeRates;
