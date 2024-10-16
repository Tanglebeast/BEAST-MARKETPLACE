// src/PlatinumFunctions/platinumUtils.js

import Web3 from 'web3';
import PlatinumABI from '../Platinum-ABI.json';
import { web3OnlyRead } from '../components/utils'; // Importieren von web3OnlyRead

// Funktion zum Abrufen des Web3-Providers
const getWeb3 = () => {
  if (typeof window !== 'undefined' && window.ethereum) {
    return new Web3(window.ethereum);
  } else {
    console.warn('MetaMask nicht gefunden. Verwende web3OnlyRead für read-only Operationen.');
    return web3OnlyRead;
  }
};

const web3 = getWeb3();

// Smart-Contract-Adresse (special functions social media contract)
const contractAddress = '0xf7C5B2E7924C1018aa750D64280Bd3335f373590';

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

// Hilfsfunktion zum Überprüfen, ob MetaMask verfügbar ist
const isMetaMaskAvailable = () => {
  return typeof window !== 'undefined' && window.ethereum;
};

// Funktion zum Aktualisieren des Profils
export const updateProfile = async (twitter, instagram, discord, bio) => {
  if (!isMetaMaskAvailable()) {
    throw new Error('MetaMask ist nicht verfügbar. Bitte installieren Sie MetaMask, um Profile zu aktualisieren.');
  }

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
  if (!isMetaMaskAvailable()) {
    throw new Error('MetaMask ist nicht verfügbar. Bitte installieren Sie MetaMask, um Profile zu entfernen.');
  }

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
// Funktion zum Überprüfen, ob der Benutzer NFT-Besitzer ist
export const isNFTHolder = async (userAddress) => {
    try {
      // Überprüfen, ob eine Benutzeradresse übergeben wurde
      if (!userAddress) {
        console.error('Keine Benutzeradresse angegeben.');
        return false;
      }
  
      // Sicherstellen, dass die Adresse im Checksum-Format vorliegt
      const checksumAddress = web3.utils.toChecksumAddress(userAddress);
      console.log('Überprüfe NFT-Besitz für Adresse:', checksumAddress);
  
      // Hole die NFT-Vertragsadresse aus dem Social-Media-Vertrag
      const nftContractAddress = await contract.methods.nftContract().call();
      console.log('NFT Contract Address:', nftContractAddress);
  
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
      console.log('NFT Contract Instanz erstellt.');
  
      // Hole den Saldo des Benutzers
      const balance = await nftContract.methods.balanceOf(checksumAddress).call();
      console.log(`Adresse ${checksumAddress} besitzt ${balance} NFTs.`);
  
      // Überprüfen, ob der Benutzer mindestens ein NFT besitzt
      return parseInt(balance) > 0;
    } catch (error) {
      console.error('Fehler bei der Überprüfung des NFT-Besitzes:', error);
      return false; // Optional: Rückgabe von false statt Fehler werfen
    }
  };
  

// NEUE FUNKTIONEN FÜR DIE WATCHLIST

// Funktion zum Hinzufügen eines NFTs zur Watchlist
export const addToWatchlist = async (contractAddressToAdd, tokenId) => {
  if (!isMetaMaskAvailable()) {
    throw new Error('MetaMask ist nicht verfügbar. Bitte installieren Sie MetaMask, um zur Watchlist hinzuzufügen.');
  }

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
  if (!isMetaMaskAvailable()) {
    throw new Error('MetaMask ist nicht verfügbar. Bitte installieren Sie MetaMask, um aus der Watchlist zu entfernen.');
  }

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
