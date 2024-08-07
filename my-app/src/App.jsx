import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Web3 from 'web3';
import nftMarketplaceAbi from './ABI.json';
import CollectionCards from './pages/Collections';
import Header from './components/Header'; 
import CollectionDetail from './pages/CollectionDetail';
import { Homepage } from './pages/Home';
import Footer from './components/Footer';
import ArtistProfile from './pages/ArtistProfile';
import AllNFTs from './pages/AllNFTs';
import About from './pages/About';
import NetworkselectionDropdown from './components/NetworkselectionDropdown'; // Importieren Sie die Dropdown-Komponente
import { 
  connectWallet, 
  disconnectWallet, 
  initializeMarketplace, 
  fetchAllNFTs, 
  refreshData,
  checkAccountInLocalStorage
} from './components/utils';
import NFTDetail from './pages/NFTDetail';
import MyNFTs from './pages/MyNFTs';
import ArtistPage from './pages/ArtistPage';
import UserNFTs from './pages/UserNFTs';
import Accordion from './components/FAQ';
import AllUsers from './pages/AllUsers';
import MintNFT from './Fairlaunch/MintNFT';
import FairMintCollections from './Fairlaunch/PublicSaleCollections';
import ChangeTheme from './components/ChangeTheme';
import { nftCollections } from './NFTCollections';

const App = () => {
  const [account, setAccount] = useState(localStorage.getItem('account') || '');
  const [marketplace, setMarketplace] = useState(null);
  const [nftsForSale, setNftsForSale] = useState([]);
  const [allNFTs, setAllNFTs] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [selectedNetwork, setSelectedNetwork] = useState(localStorage.getItem('selectedNetwork') || 'shimmerevm');

  const web3 = new Web3(window.ethereum);
  checkAccountInLocalStorage();

  useEffect(() => {
    if (account !== '') {
      console.log('Wallet connected');
      setIsConnected(true);
      initializeMarketplace(setMarketplace, (marketplaceInstance) => {
        refreshData(marketplaceInstance, nftCollections[0].address, setNftsForSale, setAllNFTs, fetchAllNFTs);
      });
    } else {
      console.log('Wallet disconnected');
      setIsConnected(false);
    }
  }, [account]);

  return (
    <div>
      <Header
        isConnected={isConnected}
        account={account}
        connectWallet={() => {
          console.log('Connecting wallet...');
          connectWallet(setAccount);
        }}
        disconnectWallet={() => {
          console.log('Disconnecting wallet...');
          disconnectWallet(setAccount, setIsConnected);
        }}
      />
      <ChangeTheme />
      <Router>
        <div className="MainDiv">
          <Routes>
            <Route path="/" element={<Homepage />} />
            <Route path="/collections" element={<CollectionCards showSearchBar={true} showFilter={true} selectedNetwork={selectedNetwork} />} />
            <Route path="/wallet" element={<MyNFTs />} />
            <Route path="/artists" element={<ArtistPage />} />
            <Route path="/nfts" element={<AllNFTs />} />
            <Route path="/fairmint" element={<FairMintCollections />} />
            <Route path="/fairmint/:collectionaddress" element={<MintNFT />} />
            <Route path="/users" element={<AllUsers />} />
            <Route path="/faq" element={<Accordion />} />
            <Route path="/about" element={<About />} />
            <Route path="/artists/:artistname" element={<ArtistProfile />} />
            <Route path="/users/:walletAddress" element={<UserNFTs />} />
            <Route path="/collections/:collectionaddress" element={<CollectionDetail />} />
            <Route path="/collections/:collectionaddress/:tokenid" element={<NFTDetail />} />
          </Routes>
        </div>
      </Router>
      <Footer />
    </div>
  );
};

export default App;
