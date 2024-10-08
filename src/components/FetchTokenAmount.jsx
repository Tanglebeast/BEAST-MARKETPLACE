// src/components/FetchTokenAmount.jsx
import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import PropTypes from 'prop-types';
import BN from 'bn.js'; // Importieren von BN aus bn.js
import LoadingSpinner from '../Assets/loading-spinner';
import CurrencyBeastIcon from '../Assets/currency-beast';
import CurrencyIotaIcon from '../Assets/currency-iota';

const FetchTokenAmount = ({ account }) => {
  const [nativeBalance, setNativeBalance] = useState(null);
  const [tokenBalance, setTokenBalance] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true); // Neuer Zustand für das Laden

  // Adresse des ERC-20 Tokens
  const tokenContractAddress = '0x6852f7B4ba44667F2Db80E6f3A9f8A173b03cD15';

  // Minimaler ERC-20 ABI zum Abrufen der Balance, Dezimalstellen und Symbol
  const ERC20_ABI = [
    {
      constant: true,
      inputs: [{ name: 'account', type: 'address' }],
      name: 'balanceOf',
      outputs: [{ name: '', type: 'uint256' }],
      type: 'function',
    },
    {
      constant: true,
      inputs: [],
      name: 'decimals',
      outputs: [{ name: '', type: 'uint8' }],
      type: 'function',
    },
    {
      constant: true,
      inputs: [],
      name: 'symbol',
      outputs: [{ name: '', type: 'string' }],
      type: 'function',
    },
  ];

  useEffect(() => {
    const fetchBalances = async () => {
      setLoading(true); // Start des Ladevorgangs
      try {
        if (!window.ethereum || !account) {
          setError('Wallet nicht verbunden');
          return;
        }

        // Initialisieren von Web3
        const web3 = new Web3(window.ethereum);

        // Abrufen des nativen Token-Guthabens (z.B. ETH für Ethereum)
        const balanceWei = await web3.eth.getBalance(account);
        const formattedBalance = parseFloat(web3.utils.fromWei(balanceWei, 'ether')).toFixed(2);
        setNativeBalance(formattedBalance);

        // Instanz des ERC-20 Contracts
        const tokenContract = new web3.eth.Contract(ERC20_ABI, tokenContractAddress);

        // Abrufen der Token-Balance
        const rawTokenBalance = await tokenContract.methods.balanceOf(account).call();
        const decimalsStr = await tokenContract.methods.decimals().call();
        const symbol = await tokenContract.methods.symbol().call();

        const decimals = parseInt(decimalsStr, 10); // Convert decimals to number

        // Formatieren der Token-Balance basierend auf Dezimalstellen
        let formattedTokenBalance;
        if (decimals === 18) {
          formattedTokenBalance = parseFloat(web3.utils.fromWei(rawTokenBalance, 'ether')).toFixed(2);
        } else {
          // Verwendung von BN aus bn.js
          const balanceBN = new BN(rawTokenBalance);
          const decimalsBN = new BN(10).pow(new BN(decimals));
          const integerPart = balanceBN.div(decimalsBN).toString();
          const fractionalPart = balanceBN.mod(decimalsBN).toString().padStart(decimals, '0'); // decimals ist eine Zahl
          
          // Kombiniere Integer- und Bruchteilsanteil und runde auf 2 Dezimalstellen
          const fullBalance = `${integerPart}.${fractionalPart}`;
          formattedTokenBalance = parseFloat(fullBalance).toFixed(2);
        }

        setTokenBalance(`${formattedTokenBalance}`);
      } catch (err) {
        console.error('Fehler beim Abrufen der Token-Balances:', err);
        setError('Fehler beim Abrufen der Balances');
      } finally {
        setLoading(false); // Ende des Ladevorgangs, unabhängig vom Ergebnis
      }
    };

    fetchBalances();
  }, [account]);

  if (loading) {
    return (
      <div className="token-amount-loading">
        <LoadingSpinner
                                        filled={false} 
                                                        textColor="currentColor" 
                                                        size={22} 
                                                        className="loading-gif"
                                        />
      </div>
    );
  }

  if (error) {
    return <div className="token-amount-error">{error}</div>;
  }

  return (
    <div className="token-amount">
      {nativeBalance !== null && (
        <div className="native-balance flex center-ho">
          <CurrencyIotaIcon
                                    filled={false} 
                                    textColor="currentColor" 
                                    size={24} 
                                    className="currency-icon"
                                    />
          <span className="ml5 s16">{nativeBalance}</span>
        </div>
      )}
      {tokenBalance !== null && (
        <div className="erc20-balance flex center-ho">
          <CurrencyBeastIcon
                filled={false} 
                textColor="currentColor" 
                size={24} 
                className="currency-icon"
                />
          <span className="ml5 s16">{tokenBalance}</span>
        </div>
      )}
    </div>
  );
};

FetchTokenAmount.propTypes = {
  account: PropTypes.string.isRequired,
};

export default FetchTokenAmount;
