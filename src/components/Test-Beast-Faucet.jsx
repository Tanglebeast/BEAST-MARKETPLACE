// ../components/BEASTFaucet.js
import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import { getGasEstimate } from '../components/utils';
import CustomPopup from '../components/AlertPopup'; // Importiere die CustomPopup-Komponente
import '../styles/BEASTFaucet.css'; // Optional: Eigene CSS für BEASTFaucet

const BEASTFaucet = () => {
  const [isMinting, setIsMinting] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [popupVisible, setPopupVisible] = useState(false);
  const [popupMessage, setPopupMessage] = useState('');
  
  // Neuer State für das Account
  const [account, setAccount] = useState(null);

  useEffect(() => {
    // Beim Laden der Komponente das Account aus dem lokalen Speicher lesen
    const storedAccount = localStorage.getItem('account');
    if (storedAccount) {
      setAccount(storedAccount);
    }

    // Event Listener für Änderungen im lokalen Speicher
    const handleStorageChange = (event) => {
      if (event.key === 'account') {
        setAccount(event.newValue);
      }
    };

    window.addEventListener('storage', handleStorageChange);

    // Event Listener für Kontoänderungen in der Wallet
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length > 0) {
          localStorage.setItem('account', accounts[0]);
          setAccount(accounts[0]);
        } else {
          localStorage.removeItem('account');
          setAccount(null);
        }
      });
    }

    // Aufräumen der Event Listener
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      if (window.ethereum) {
        window.ethereum.removeAllListeners('accountsChanged');
      }
    };
  }, []);

  const contractABI = [ { "inputs": [ { "internalType": "address", "name": "initialOwner", "type": "address" } ], "stateMutability": "nonpayable", "type": "constructor" }, { "inputs": [], "name": "ECDSAInvalidSignature", "type": "error" }, { "inputs": [ { "internalType": "uint256", "name": "length", "type": "uint256" } ], "name": "ECDSAInvalidSignatureLength", "type": "error" }, { "inputs": [ { "internalType": "bytes32", "name": "s", "type": "bytes32" } ], "name": "ECDSAInvalidSignatureS", "type": "error" }, { "inputs": [ { "internalType": "address", "name": "spender", "type": "address" }, { "internalType": "uint256", "name": "allowance", "type": "uint256" }, { "internalType": "uint256", "name": "needed", "type": "uint256" } ], "name": "ERC20InsufficientAllowance", "type": "error" }, { "inputs": [ { "internalType": "address", "name": "sender", "type": "address" }, { "internalType": "uint256", "name": "balance", "type": "uint256" }, { "internalType": "uint256", "name": "needed", "type": "uint256" } ], "name": "ERC20InsufficientBalance", "type": "error" }, { "inputs": [ { "internalType": "address", "name": "approver", "type": "address" } ], "name": "ERC20InvalidApprover", "type": "error" }, { "inputs": [ { "internalType": "address", "name": "receiver", "type": "address" } ], "name": "ERC20InvalidReceiver", "type": "error" }, { "inputs": [ { "internalType": "address", "name": "sender", "type": "address" } ], "name": "ERC20InvalidSender", "type": "error" }, { "inputs": [ { "internalType": "address", "name": "spender", "type": "address" } ], "name": "ERC20InvalidSpender", "type": "error" }, { "inputs": [ { "internalType": "uint256", "name": "deadline", "type": "uint256" } ], "name": "ERC2612ExpiredSignature", "type": "error" }, { "inputs": [ { "internalType": "address", "name": "signer", "type": "address" }, { "internalType": "address", "name": "owner", "type": "address" } ], "name": "ERC2612InvalidSigner", "type": "error" }, { "inputs": [], "name": "EnforcedPause", "type": "error" }, { "inputs": [], "name": "ExpectedPause", "type": "error" }, { "inputs": [ { "internalType": "address", "name": "account", "type": "address" }, { "internalType": "uint256", "name": "currentNonce", "type": "uint256" } ], "name": "InvalidAccountNonce", "type": "error" }, { "inputs": [], "name": "InvalidShortString", "type": "error" }, { "inputs": [ { "internalType": "address", "name": "owner", "type": "address" } ], "name": "OwnableInvalidOwner", "type": "error" }, { "inputs": [ { "internalType": "address", "name": "account", "type": "address" } ], "name": "OwnableUnauthorizedAccount", "type": "error" }, { "inputs": [ { "internalType": "string", "name": "str", "type": "string" } ], "name": "StringTooLong", "type": "error" }, { "anonymous": false, "inputs": [ { "indexed": true, "internalType": "address", "name": "owner", "type": "address" }, { "indexed": true, "internalType": "address", "name": "spender", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "value", "type": "uint256" } ], "name": "Approval", "type": "event" }, { "anonymous": false, "inputs": [], "name": "EIP712DomainChanged", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": true, "internalType": "address", "name": "previousOwner", "type": "address" }, { "indexed": true, "internalType": "address", "name": "newOwner", "type": "address" } ], "name": "OwnershipTransferred", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": false, "internalType": "address", "name": "account", "type": "address" } ], "name": "Paused", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": true, "internalType": "address", "name": "from", "type": "address" }, { "indexed": true, "internalType": "address", "name": "to", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "value", "type": "uint256" } ], "name": "Transfer", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": false, "internalType": "address", "name": "account", "type": "address" } ], "name": "Unpaused", "type": "event" }, { "inputs": [], "name": "DOMAIN_SEPARATOR", "outputs": [ { "internalType": "bytes32", "name": "", "type": "bytes32" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "MINT_AMOUNT", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "owner", "type": "address" }, { "internalType": "address", "name": "spender", "type": "address" } ], "name": "allowance", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "spender", "type": "address" }, { "internalType": "uint256", "name": "value", "type": "uint256" } ], "name": "approve", "outputs": [ { "internalType": "bool", "name": "", "type": "bool" } ], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "account", "type": "address" } ], "name": "balanceOf", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "uint256", "name": "value", "type": "uint256" } ], "name": "burn", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "account", "type": "address" }, { "internalType": "uint256", "name": "value", "type": "uint256" } ], "name": "burnFrom", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "decimals", "outputs": [ { "internalType": "uint8", "name": "", "type": "uint8" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "eip712Domain", "outputs": [ { "internalType": "bytes1", "name": "fields", "type": "bytes1" }, { "internalType": "string", "name": "name", "type": "string" }, { "internalType": "string", "name": "version", "type": "string" }, { "internalType": "uint256", "name": "chainId", "type": "uint256" }, { "internalType": "address", "name": "verifyingContract", "type": "address" }, { "internalType": "bytes32", "name": "salt", "type": "bytes32" }, { "internalType": "uint256[]", "name": "extensions", "type": "uint256[]" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "mint", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "name", "outputs": [ { "internalType": "string", "name": "", "type": "string" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "owner", "type": "address" } ], "name": "nonces", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "owner", "outputs": [ { "internalType": "address", "name": "", "type": "address" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "pause", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "paused", "outputs": [ { "internalType": "bool", "name": "", "type": "bool" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "owner", "type": "address" }, { "internalType": "address", "name": "spender", "type": "address" }, { "internalType": "uint256", "name": "value", "type": "uint256" }, { "internalType": "uint256", "name": "deadline", "type": "uint256" }, { "internalType": "uint8", "name": "v", "type": "uint8" }, { "internalType": "bytes32", "name": "r", "type": "bytes32" }, { "internalType": "bytes32", "name": "s", "type": "bytes32" } ], "name": "permit", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "renounceOwnership", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "symbol", "outputs": [ { "internalType": "string", "name": "", "type": "string" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "totalSupply", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "to", "type": "address" }, { "internalType": "uint256", "name": "value", "type": "uint256" } ], "name": "transfer", "outputs": [ { "internalType": "bool", "name": "", "type": "bool" } ], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "from", "type": "address" }, { "internalType": "address", "name": "to", "type": "address" }, { "internalType": "uint256", "name": "value", "type": "uint256" } ], "name": "transferFrom", "outputs": [ { "internalType": "bool", "name": "", "type": "bool" } ], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "newOwner", "type": "address" } ], "name": "transferOwnership", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "unpause", "outputs": [], "stateMutability": "nonpayable", "type": "function" } ];

  const contractAddress = "0x6852f7B4ba44667F2Db80E6f3A9f8A173b03cD15"; // Adresse Ihres deployten Contracts

  const mintTokens = async () => {
    setIsMinting(true);
    setError(null);
    setSuccessMessage(null);

    try {
      if (window.ethereum) {
        // Anfrage nach Konten
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        const web3 = new Web3(window.ethereum);
        const accounts = await web3.eth.getAccounts();
        const currentAccount = accounts[0];
        
        // Speichern des Accounts im lokalen Speicher
        localStorage.setItem('account', currentAccount);
        setAccount(currentAccount);

        const contract = new web3.eth.Contract(contractABI, contractAddress);

        // Verwende die getGasEstimate-Funktion aus utils.js
        const method = contract.methods.mint();
        const params = {}; // Zusätzliche Parameter, falls erforderlich
        const { gasEstimate, gasPrice } = await getGasEstimate(method, params, currentAccount);

        // Senden der Transaktion mit geschätztem Gas und Gaspreis
        const tx = await method.send({ from: currentAccount, gas: gasEstimate, gasPrice });

        console.log('Transaction:', tx);
        const message = "5000 Tokens minted successfully!";
        setPopupMessage(message);
        setPopupVisible(true);
      } else {
        throw new Error("No wallet found");
      }
    } catch (err) {
      console.error(err);
      setError(err.message);
      setPopupMessage(`Error: ${err.message}`);
      setPopupVisible(true);
    } finally {
      setIsMinting(false);
    }
  };

  const closePopup = () => {
    setPopupVisible(false);
    setPopupMessage('');
  };

  return (
    <div className="beast-faucet-container">
      <h1>BEAST FAUCET</h1>
      <div className="info-section">
        <p className='grey'>Grab your test BEAST Tokens now and pay 0 fees!</p>
        <img className='wh100px mt10' src='/currency-beast.webp' alt="Beast Token" />
      </div>
      <button 
        onClick={mintTokens} 
        disabled={isMinting || !account} // Button deaktivieren, wenn isMinting oder kein Account vorhanden
        className={`mint-button mt35 ${!account ? 'disabled' : ''}`} // Optional: CSS-Klasse für deaktivierten Zustand
      >
        {isMinting 
          ? 'Minting...' 
          : (!account 
              ? 'Please connect your wallet' 
              : 'MINT 5000 BEASTT')}
      </button>
      

      {/* Anzeige von Fehlermeldungen */}
      {error && <p className="error-message">Fehler: {error}</p>}

      {/* Custom Popup für Success und Error Nachrichten */}
      {popupVisible && (
        <CustomPopup message={popupMessage} onClose={closePopup} />
      )}


        <div className='mt50 centered column VisibleLinkiota'>
            <h2>IOTA FAUCET</h2>
            <p className='grey'>Click on the link below to grab some Test IOTAs.</p>
          <h3 className='mb5'>
            <img src="/currency-iota.png" alt="IOTA" className="icon h40" /> IOTA
          </h3>
          <p className='grey s14 mt0'>IOTA EVM Testnet</p>
          <a href="https://evm-toolkit.evm.testnet.iotaledger.net/" target="_blank" rel="noopener noreferrer">
            IOTA Faucet
          </a>
        </div>


    </div>
  );
};

export default BEASTFaucet;
