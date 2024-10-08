import React, { useEffect, useState } from 'react';
import CurrencyBeastIcon from '../Assets/currency-beast';

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

  const addTokenToMetaMask = async () => {
    const tokenAddress = '0x6852f7B4ba44667F2Db80E6f3A9f8A173b03cD15';
    const tokenSymbol = 'BEASTT'; // Ersetze dies durch das tatsächliche Symbol deines Tokens
    const tokenDecimals = 18; // Ersetze dies durch die tatsächliche Dezimalstellenanzahl deines Tokens
    const tokenImage = 'https://firebasestorage.googleapis.com/v0/b/fractalz-blog.appspot.com/o/banner_images%2Fcurrency-beast-black-white-2.png?alt=media&token=21000b64-92a0-4761-81f3-ee23f9535336'; // Ersetze dies durch die tatsächliche URL deines Token-Bildes

    if (window.ethereum) {
      try {
        // Anfrage an MetaMask, den Token hinzuzufügen
        const wasAdded = await window.ethereum.request({
          method: 'wallet_watchAsset',
          params: {
            type: 'ERC20', // Ändere dies, falls dein Token einen anderen Standard verwendet
            options: {
              address: tokenAddress,
              symbol: tokenSymbol,
              decimals: tokenDecimals,
              image: tokenImage,
            },
          },
        });

        if (wasAdded) {
          console.log('Token wurde zu MetaMask hinzugefügt!');
        } else {
          console.log('Token wurde nicht hinzugefügt.');
        }
      } catch (error) {
        console.error('Fehler beim Hinzufügen des Tokens zu MetaMask:', error);
      }
    } else {
      alert('MetaMask ist nicht installiert. Bitte installiere MetaMask und versuche es erneut.');
    }
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={addTokenToMetaMask}>
      <CurrencyBeastIcon
                filled={false} 
                textColor="currentColor" 
                size={24} 
                className="currency-icon"
                />
      <span
        id="price"
        style={{ fontSize: '17px', marginRight: '0px' }}
      >
        {/* {error || (price ? `$${price}` : 'Loading...')} */}
        {error || (price ? `$0.002` : 'Loading...')}
      </span>
    </div>
  );
};

export default BeastPrice;
