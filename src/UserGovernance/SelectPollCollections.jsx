import React, { useEffect, useState } from 'react';
import Web3 from 'web3';
import { nftCollections } from '../NFTCollections'; // Importiere die NFT Kollektionen
import { artistList } from '../ArtistList'; // Importiere die Künstlerliste
import { CONTRACT_OWNER_ADDRESS } from '../components/utils';

const web3 = new Web3(window.ethereum);

const NftCollectionSelector = ({ onClose, onSelect, selectedAddresses }) => {
  const [currentNetwork, setCurrentNetwork] = useState('');
  const [filteredCollections, setFilteredCollections] = useState([]);
  const [selected, setSelected] = useState(new Set(selectedAddresses));
  const [artistWallet, setArtistWallet] = useState('');

  useEffect(() => {
    const getNetworkId = async () => {
      const networkId = await web3.eth.net.getId();
      setCurrentNetwork(networkId.toString());
    };

    getNetworkId();
  }, []);

  useEffect(() => {
    const storedWallet = localStorage.getItem('account');
    setArtistWallet(storedWallet ? storedWallet.toLowerCase() : '');

    if (currentNetwork) {
      const collections = nftCollections.filter((collection) => {
        const networkIdDecimal = parseInt(collection.networkid, 16);
        return networkIdDecimal.toString() === currentNetwork;
      });

      // Filter collections based on the artist wallet
      if (artistWallet === CONTRACT_OWNER_ADDRESS.toLowerCase()) {
        setFilteredCollections(collections); // Alle Kollektionen anzeigen
      } else {
        const artist = artistList.find(artist => artist.walletaddress.toLowerCase() === artistWallet);
        if (artist) {
          const artistCollections = collections.filter(collection => collection.artist.toLowerCase() === artist.name.toLowerCase());
          setFilteredCollections(artistCollections);
        } else {
          setFilteredCollections([]);
        }
      }
    }
  }, [currentNetwork, artistWallet]);

  const handleCheckboxChange = (address) => {
    const newSelected = new Set(selected);
    if (newSelected.has(address)) {
      newSelected.delete(address);
    } else {
      newSelected.add(address);
    }
    setSelected(newSelected);
    onSelect([...newSelected]);
  };

  return (
    <div className="popup-overlay">
      <div className="popup-content">
        <button className="close-button" onClick={onClose}>X</button>
        <h2 className='mt100'>Add Collections</h2>
        <ul className='text-align-left'>
          {filteredCollections.length > 0 ? (
            filteredCollections.map((collection) => (
              <div key={collection.address}>
                <label>
                  <input
                    type="checkbox"
                    checked={selected.has(collection.address)}
                    onChange={() => handleCheckboxChange(collection.address)}
                  />
                  {collection.name}
                </label>
              </div>
            ))
          ) : (
            <li>Keine Kollektionen gefunden</li>
          )}
        </ul>
        <button className='actionbutton' onClick={onClose}>Add to Poll</button>
      </div>
    </div>
  );
};

export default NftCollectionSelector;
