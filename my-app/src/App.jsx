//App.jsx
import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import nftMarketplaceAbi from './ABI.json';
import { nftCollections } from './NFTCollections';
import CollectionCards from './pages/Collections';
import Header from './components/Header'; // Importiere die Header-Komponente
import CollectionDetail from './pages/CollectionDetail';
import { Homepage } from './pages/Home';
import Footer from './components/Footer';
import ArtistProfile from './pages/ArtistProfile';
import AllNFTs from './pages/AllNFTs';
import FairlauchCollection from './Fairlaunch/PublicCollectionDetail';
import PublicNFTDetail from './Fairlaunch/PublicCollectionNFTDetails';
import About from './pages/About';


import { 
  connectWallet, 
  disconnectWallet, 
  initializeMarketplace, 
  fetchAllNFTs, 
  refreshData 
} from './components/utils';
import NFTDetail from './pages/NFTDetail';
import MyNFTs from './pages/MyNFTs';
import ArtistPage from './pages/ArtistPage';
import UserNFTs from './pages/UserNFTs';
import PublicCollectionCards from './Fairlaunch/PublicSaleCollections';
import PublicCollectionNFTs from './Fairlaunch/PublicCollectionDetail';
import PublicCollectionDetail from './Fairlaunch/PublicCollectionDetail';
import Accordion from './components/FAQ';
import AllUsers from './pages/AllUsers';

const App = () => {
  const [account, setAccount] = useState(localStorage.getItem('account') || '');
  const [marketplace, setMarketplace] = useState(null);
  const [nftsForSale, setNftsForSale] = useState([]);
  const [allNFTs, setAllNFTs] = useState([]);
  const [isConnected, setIsConnected] = useState(false);

  const web3 = new Web3(window.ethereum);

  useEffect(() => {
    if (account !== '') {
      setIsConnected(true);
      initializeMarketplace(setMarketplace, (marketplaceInstance) => refreshData(marketplaceInstance, nftCollections[0].address, setNftsForSale, setAllNFTs, fetchAllNFTs));
    }
  }, [account]);

  return (
    <div>
      <Header
        isConnected={isConnected}
        account={account}
        connectWallet={() => connectWallet(setAccount)}
        disconnectWallet={() => disconnectWallet(setAccount, setIsConnected)}
      />

      <Router>
        <div className="MainDiv">
          <Routes>
            <Route path="/" element={<Homepage />} />
            <Route path="/collections" element={<CollectionCards showSearchBar={true} showFilter={true}/>} />
            <Route path="/wallet" element={<MyNFTs />} />
            <Route path="/artists" element={<ArtistPage />} />
            <Route path="/nfts" element={<AllNFTs />} />
            <Route path="/fairlaunch" element={<PublicCollectionCards />} />
            <Route path="/users" element={<AllUsers />} />
            <Route path="/faq" element={<Accordion />} />
            <Route path="/about" element={<About />} />
            <Route path="/fairlaunch/:collectionaddress" element={<PublicCollectionNFTs />} />
            <Route path="/fairlaunch/:collectionaddress/:tokenid" element={<PublicNFTDetail />} />
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
