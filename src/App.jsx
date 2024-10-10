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
import './App.css';
import NetworkselectionDropdown from './components/NetworkselectionDropdown'; // Importieren Sie die Dropdown-Komponente
import { 
  connectWallet, 
  disconnectWallet, 
  initializeMarketplace, 
  fetchAllNFTs, 
  refreshData,
  checkAccountInLocalStorage,
  checkNetwork,
  getNetworkConfig
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

import 'groupfi-chatbox-sdk/dist/esm/assets/style.css';
import ChatboxSDK from 'groupfi-chatbox-sdk'


const App = () => {
  const [account, setAccount] = useState(localStorage.getItem('account') || '');
  const [marketplace, setMarketplace] = useState(null);
  const [nftsForSale, setNftsForSale] = useState([]);
  const [allNFTs, setAllNFTs] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [selectedNetwork, setSelectedNetwork] = useState(localStorage.getItem('selectedNetwork') || 'iotaevm');
  const [blogPosts, setBlogPosts] = useState([]);
  const web3 = new Web3(window.ethereum);
  const [chatboxLoaded, setChatboxLoaded] = useState(false);



  const updateAccount = (newAccount) => {
    setAccount(newAccount);
    localStorage.setItem('account', newAccount);
  };

  useEffect(() => {
    const expectedChainId = getNetworkConfig(selectedNetwork).chainId;
    if (account !== '') {
      // Überprüfe das Netzwerk, wenn die Wallet verbunden ist
      checkNetwork(expectedChainId);
    }
  }, [account, selectedNetwork]);

  // Wallet verbinden und Account setzen
  const connectWalletHandler = async () => {
    try {
      await connectWallet(updateAccount);
    } catch (error) {
      console.error("Failed to connect wallet:", error);
    }
  };

  useEffect(() => {
    // Initialisiere Chatbox
    const initializeChatbox = async () => {
      const config = {
        isWalletConnected: isConnected,
        provider: isConnected ? web3.currentProvider : undefined,
        theme: 'dark',
        uiConfig: {
          accent: 'violet',
          title: 'TANGLESPACE CHATBOX',
          subTitle: 'Welcome to the TANGLESPACE Community-Chat',
          logoUrl: 'https://firebasestorage.googleapis.com/.../currency-beast-black.png',
          iconPosition: { left: 10, top: 10 }
        }
      };

      ChatboxSDK.loadChatbox(config);

      ChatboxSDK.events.on('chatbox-ready', (data) => {
        console.log(`Chatbox is ready with Version: ${data.chatboxVersion}`);
        setChatboxLoaded(true);
      });
    };

    initializeChatbox();

    return () => {
      ChatboxSDK.removeChatbox();
    };
  }, [isConnected, account]);

  useEffect(() => {
    if (chatboxLoaded) {
      ChatboxSDK.processWallet({
        isWalletConnected: isConnected,
        provider: isConnected ? web3.currentProvider : undefined
      });

      if (isConnected && account) {
        ChatboxSDK.processAccount({ account });
      }
    }
  }, [chatboxLoaded, isConnected, account]);

  useEffect(() => {
    if (chatboxLoaded) {
      ChatboxSDK.request({
        method: 'setGroups',
        params: {
          includes: [
            { groupId: 'groupfiGTESTd2b7278595668cc19192e6d4fd0b49cb8615b5f240e00cf58c80565c5274eab7' },
            { groupId: 'groupfifeaaf94b17ca0c792a174b02afa44028cfb8c8271597c1c39f84b5de0e1d717c' },
            { groupId: 'groupfiTANGLESPACEADMINca687edbbe408c1d29e396517ed5d3a68dda563e8f91b44d21a63ba92fd22cfb' },
            // Weitere Gruppen hinzufügen
          ],
          announcement: [
            { groupId: 'groupfiTANGLESPACEADMINca687edbbe408c1d29e396517ed5d3a68dda563e8f91b44d21a63ba92fd22cfb' }
          ]
        }
      });
    }
  }, [chatboxLoaded]);

  useEffect(() => {
    checkAccountInLocalStorage();
  }, []);

  useEffect(() => {
    if (account !== '') {
      setIsConnected(true);
      initializeMarketplace(setMarketplace, (marketplaceInstance) => {
        refreshData(marketplaceInstance, nftCollections[0].address, setNftsForSale, setAllNFTs, fetchAllNFTs);
      });
    } else {
      setIsConnected(false);
    }
  }, [account]);

  // Event Listener für Account-Änderungen
  useEffect(() => {
    if (window.ethereum) {
      const handleAccountsChanged = (accounts) => {
        if (accounts.length > 0) {
          updateAccount(accounts[0]);
        } else {
          // Wallet ist möglicherweise getrennt
          updateAccount('');
          setIsConnected(false);
        }
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);

      // Optional: Event Listener für Netzwerkänderungen
      const handleChainChanged = (_chainId) => {
        // Hier können Sie die Logik zur Behandlung von Netzwerkänderungen hinzufügen
        window.location.reload();
      };

      window.ethereum.on('chainChanged', handleChainChanged);

      // Bereinigen der Event Listener beim Unmount
      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, []);

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
    <div className='Groupfi-iconBG'></div>
  </div>
</Router>
  );
};

export default App;
