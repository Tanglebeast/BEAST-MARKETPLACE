import React, { useState, useEffect } from 'react';
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
import Imprint from './components/Imprint';
import Terms from './components/TermsofUse';
import PrivacyPolicy from './components/PrivacyPolicy';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'; // Importieren Sie BrowserRouter
import NotFound from './components/Error404';
import TestnetFaucets from './pages/TestnetFaucets';
// import BlogArticlePage from './components/BlogArticlePage';
import Voting from './UserGovernance/Voting';
import PollsList from './UserGovernance/Pollslist';
import PollDetails from './UserGovernance/Voting';
import BlogListPage from './Blog/Bloglistpage';
import BlogArticlePage from './Blog/BlogArticlepage';
import PublicBlogPage from './Blog/Publicblogpage';
import NFTCollectionForm from './components/UploadNFTCollectionForm';
import BeastToIotaPrice from './components/BeastToIotaPrice';
import BEASTFaucet from './components/Test-Beast-Faucet';
import KontaktFormular from './components/ArtistContactFormula';


const App = () => {
  const [account, setAccount] = useState(localStorage.getItem('account') || '');
  const [marketplace, setMarketplace] = useState(null);
  const [nftsForSale, setNftsForSale] = useState([]);
  const [allNFTs, setAllNFTs] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [selectedNetwork, setSelectedNetwork] = useState(localStorage.getItem('selectedNetwork') || 'iotaevm');
  const [blogPosts, setBlogPosts] = useState([]);

  const web3 = new Web3(window.ethereum);
  checkAccountInLocalStorage();

  useEffect(() => {
    if (account !== '') {
      // console.log('Wallet connected');
      setIsConnected(true);
      initializeMarketplace(setMarketplace, (marketplaceInstance) => {
        refreshData(marketplaceInstance, nftCollections[0].address, setNftsForSale, setAllNFTs, fetchAllNFTs);
      });
    } else {
      // console.log('Wallet disconnected');
      setIsConnected(false);
    }
  }, [account]);

  return (
<Router>
  <div>
    <div className='bg'></div>
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
    <div className="MainDiv">
      <Routes>
        <Route path="/" element={<Navigate to="/collections" replace />} />
        <Route path="/collections" element={<CollectionCards showSearchBar={true} showFilter={true} selectedNetwork={selectedNetwork} />} />
        <Route path="/wallet" element={<MyNFTs />} />

        <Route path="/projects" element={<ArtistPage />} />
        <Route path="/projects/:artistname/blog/:blogtitle" element={<BlogArticlePage />} />
        <Route path="/nfts" element={<AllNFTs />} />

        <Route path="/fairvote" element={<PollsList />} />
        <Route path="/fairvote/:id" element={<PollDetails />} />

        <Route path="/fairmint" element={<FairMintCollections />} />
        <Route path="/fairmint/:collectionaddress" element={<MintNFT />} />

        {/* <Route path="/users" element={<AllUsers />} /> */}

        <Route path="/faq" element={<Accordion />} />
        <Route path="/about" element={<About />} />
        <Route path="/imprint" element={<Imprint />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />

        <Route path="/beast-faucet" element={<BEASTFaucet />} />

        <Route path="/faucet" element={<TestnetFaucets />} />

        <Route path="/projects/:artistname" element={<ArtistProfile />} />
        <Route path="/users/:walletAddress" element={<UserNFTs />} />
        <Route path="/collections/:collectionaddress" element={<CollectionDetail />} />
        <Route path="/collections/:collectionaddress/:tokenid" element={<NFTDetail />} />

        <Route path="/upload" element={<NFTCollectionForm />} />
        <Route path="/register" element={<KontaktFormular />} />
        {/* <Route path="/price" element={<BeastToIotaPrice />} /> */}

        <Route path="/articles" element={<PublicBlogPage blogPosts={blogPosts} />} /> {/* Öffentliche Blog-Seite */}
        <Route path="/articles/:blogId" element={<BlogArticlePage blogPosts={blogPosts} />} />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
    <Footer />
  </div>
</Router>
  );
};

export default App;
