// src/PlatinumFunctions/platinumUtils.js

import Web3 from 'web3';
import PlatinumABI from '../Platinum-ABI.json';

// Initialisiere Web3 mit MetaMask
let web3;

// Prüfe, ob MetaMask (window.ethereum) verfügbar ist
if (typeof window !== 'undefined' && typeof window.ethereum !== 'undefined') {
  // Erstelle eine neue Web3-Instanz mit dem MetaMask-Provider
  web3 = new Web3(window.ethereum);

  // Fordere Kontozugriff an, falls erforderlich
  window.ethereum.request({ method: 'eth_requestAccounts' });
} else {
  // MetaMask ist nicht installiert
  alert('MetaMask ist nicht installiert. Bitte installieren Sie MetaMask, um diese Anwendung zu nutzen.');
  throw new Error('MetaMask nicht installiert');
}

// Smart-Contract-Adresse (special functions social media contract)
const contractAddress = '0x17379bC597C942023c446F55c3AaBCfB69bFe7c3';

// Erstelle eine Instanz des Vertrags
const contract = new web3.eth.Contract(PlatinumABI.abi, contractAddress);

// Funktion zur Gasabschätzung
export const getGasEstimate = async (method, params, fromAddress) => {
  try {
    // Versuche, die Gasabschätzung mit der Methode durchzuführen
    const gasEstimate = await method.estimateGas({ ...params, from: fromAddress });
    const gasPrice = await web3.eth.getGasPrice();

    // Konvertiere Gaspreis zu einer Zahl und füge 15% Sicherheitsaufschlag hinzu
    const gasPriceInWei = parseFloat(gasPrice);
    const gasPriceWithMarkup = Math.round(gasPriceInWei * 1.15); // 15% Aufschlag

    return { gasEstimate, gasPrice: gasPriceWithMarkup.toString() };
  } catch (error) {
    console.error('Fehler bei der Gasabschätzung:', error);

    try {
      // Hole den aktuellen Gaspreis, auch wenn die ursprüngliche Abschätzung fehlgeschlagen ist
      const gasPrice = await web3.eth.getGasPrice();
      const gasPriceInWei = parseFloat(gasPrice);
      const gasPriceWithMarkup = Math.round(gasPriceInWei * 1.15); // 15% Aufschlag

      // Verwende einen manuellen Gasbetrag von 300000
      const manualGasEstimate = 300000;

      return { gasEstimate: manualGasEstimate, gasPrice: gasPriceWithMarkup.toString() };
    } catch (innerError) {
      console.error('Fehler beim Abrufen des Gaspreises für die manuelle Abschätzung:', innerError);
      throw innerError; // Optional: Du kannst hier auch einen spezifischen Fehler werfen
    }
  }
};

// Funktion zum Aktualisieren des Profils
export const updateProfile = async (twitter, instagram, discord, bio) => {
  try {
    const accounts = await web3.eth.getAccounts();
    const fromAddress = accounts[0];

    // Hole die Methode des Vertrags
    const method = contract.methods.updateProfile(twitter, instagram, discord, bio);

    // Holen Sie die Gasabschätzung und den Gaspreis
    const { gasEstimate, gasPrice } = await getGasEstimate(method, {}, fromAddress);

    // Sende Transaktion mit Gas und Gaspreis
    const result = await method.send({ from: fromAddress, gas: gasEstimate, gasPrice });

    return result;
  } catch (error) {
    console.error('Fehler beim Aktualisieren des Profils:', error);
    throw error;
  }
};

// Funktion zum Entfernen des Profils
export const removeProfile = async () => {
  try {
    const accounts = await web3.eth.getAccounts();
    const fromAddress = accounts[0];

    // Hole die Methode des Vertrags
    const method = contract.methods.removeProfile();

    // Holen Sie die Gasabschätzung und den Gaspreis
    const { gasEstimate, gasPrice } = await getGasEstimate(method, {}, fromAddress);

    // Sende Transaktion mit Gas und Gaspreis
    const result = await method.send({ from: fromAddress, gas: gasEstimate, gasPrice });

    return result;
  } catch (error) {
    console.error('Fehler beim Entfernen des Profils:', error);
    throw error;
  }
};

// Funktion zum Abrufen des Profils
export const getProfile = async (userAddress) => {
  try {
    const result = await contract.methods.getProfile(userAddress).call();
    return {
      twitter: result.twitter,
      instagram: result.instagram,
      discord: result.discord,
      bio: result.bio, // Bio zum zurückgegebenen Objekt hinzugefügt
    };
  } catch (error) {
    console.error('Fehler beim Abrufen des Profils:', error);
    throw error;
  }
};

// Funktion zum Überprüfen, ob der Benutzer NFT-Besitzer ist
export const isNFTHolder = async (userAddress) => {
  try {
    // Hole die NFT-Vertragsadresse aus dem Social-Media-Vertrag
    const nftContractAddress = await contract.methods.nftContract().call();

    // Minimales ERC721 ABI zur Interaktion mit dem NFT-Vertrag
    const nftABI = [
      {
        constant: true,
        inputs: [{ name: 'owner', type: 'address' }],
        name: 'balanceOf',
        outputs: [{ name: 'balance', type: 'uint256' }],
        type: 'function',
      },
    ];

    // Erstelle NFT-Vertragsinstanz
    const nftContract = new web3.eth.Contract(nftABI, nftContractAddress);

    // Hole den Saldo des Benutzers
    const balance = await nftContract.methods.balanceOf(userAddress).call();

    return parseInt(balance) > 0;
  } catch (error) {
    console.error('Fehler bei der Überprüfung des NFT-Besitzes:', error);
    throw error;
  }
};

// NEUE FUNKTIONEN FÜR DIE WATCHLIST

// Funktion zum Hinzufügen eines NFTs zur Watchlist
export const addToWatchlist = async (contractAddressToAdd, tokenId) => {
  try {
    const accounts = await web3.eth.getAccounts();
    const fromAddress = accounts[0];

    // Hole die Methode des Vertrags
    const method = contract.methods.addToWatchlist(contractAddressToAdd, tokenId);

    // Holen Sie die Gasabschätzung und den Gaspreis
    const { gasEstimate, gasPrice } = await getGasEstimate(method, {}, fromAddress);

    // Sende Transaktion mit Gas und Gaspreis
    const result = await method.send({ from: fromAddress, gas: gasEstimate, gasPrice });

    return result;
  } catch (error) {
    console.error('Fehler beim Hinzufügen zur Watchlist:', error);
    throw error;
  }
};

// Funktion zum Entfernen eines NFTs aus der Watchlist
export const removeFromWatchlist = async (contractAddressToRemove, tokenId) => {
  try {
    const accounts = await web3.eth.getAccounts();
    const fromAddress = accounts[0];

    // Hole die Methode des Vertrags
    const method = contract.methods.removeFromWatchlist(contractAddressToRemove, tokenId);

    // Holen Sie die Gasabschätzung und den Gaspreis
    const { gasEstimate, gasPrice } = await getGasEstimate(method, {}, fromAddress);

    // Sende Transaktion mit Gas und Gaspreis
    const result = await method.send({ from: fromAddress, gas: gasEstimate, gasPrice });

    return result;
  } catch (error) {
    console.error('Fehler beim Entfernen aus der Watchlist:', error);
    throw error;
  }
};

// Funktion zum Abrufen der Watchlist eines Benutzers
export const getWatchlist = async (userAddress) => {
  try {
    const watchlist = await contract.methods.getWatchlist(userAddress).call();
    // Die Watchlist ist ein Array von Objekten mit contractAddress und tokenId
    // Wir können es direkt zurückgeben oder weiter verarbeiten, falls nötig
    return watchlist;
  } catch (error) {
    console.error('Fehler beim Abrufen der Watchlist:', error);
    throw error;
  }
};

// Funktion zum Abrufen der Anzahl der Watchlist-Hinzufügungen für ein NFT
export const getNFTWatchlistCount = async (contractAddressToCheck, tokenId) => {
    try {
      const count = await contract.methods.getNFTWatchlistCount(contractAddressToCheck, tokenId).call();
      return parseInt(count);
    } catch (error) {
      console.error('Fehler beim Abrufen der Watchlist-Anzahl:', error);
      throw error;
    }
  };

  export const isNFTInUserWatchlist = async (userAddress, contractAddressToCheck, tokenId) => {
    try {
      const isInWatchlist = await contract.methods.isNFTInWatchlist(userAddress, contractAddressToCheck, tokenId).call();
      return isInWatchlist;
    } catch (error) {
      console.error('Fehler beim Überprüfen, ob NFT in der Watchlist ist:', error);
      throw error;
    }
  };
  

// Exportiere die Web3-Instanz und den Vertrag für die Verwendung in anderen Komponenten
export { web3, contract };
