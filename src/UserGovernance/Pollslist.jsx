// src/components/PollsList.js
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Web3 from 'web3';
import '../styles/Pollist.css';
import { getRpcUrl } from '../components/networkConfig';
import { nftCollections } from '../NFTCollections';
import { artistList } from '../ArtistList';
import PollFilter from './PollFilter';
import SearchBar from '../components/SearchBar';


const NFT_VOTING_ABI = [ { "inputs": [ { "internalType": "address", "name": "_creator", "type": "address" } ], "name": "addPollCreator", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "string", "name": "_question", "type": "string" }, { "internalType": "string", "name": "_description", "type": "string" }, { "internalType": "string[]", "name": "_options", "type": "string[]" }, { "internalType": "uint256", "name": "_durationInHours", "type": "uint256" } ], "name": "createERC20Poll", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "string", "name": "_question", "type": "string" }, { "internalType": "string", "name": "_description", "type": "string" }, { "internalType": "string[]", "name": "_options", "type": "string[]" }, { "internalType": "uint256", "name": "_durationInHours", "type": "uint256" }, { "internalType": "address[]", "name": "_nftContractAddresses", "type": "address[]" } ], "name": "createNFTPoll", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "stateMutability": "nonpayable", "type": "constructor" }, { "inputs": [ { "internalType": "address", "name": "owner", "type": "address" } ], "name": "OwnableInvalidOwner", "type": "error" }, { "inputs": [ { "internalType": "address", "name": "account", "type": "address" } ], "name": "OwnableUnauthorizedAccount", "type": "error" }, { "anonymous": false, "inputs": [ { "indexed": true, "internalType": "address", "name": "previousOwner", "type": "address" }, { "indexed": true, "internalType": "address", "name": "newOwner", "type": "address" } ], "name": "OwnershipTransferred", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": false, "internalType": "uint256", "name": "pollId", "type": "uint256" }, { "indexed": false, "internalType": "string", "name": "question", "type": "string" }, { "indexed": false, "internalType": "string", "name": "description", "type": "string" }, { "indexed": false, "internalType": "string[]", "name": "options", "type": "string[]" }, { "indexed": false, "internalType": "uint256", "name": "endTime", "type": "uint256" }, { "indexed": false, "internalType": "address[]", "name": "nftContractAddresses", "type": "address[]" }, { "indexed": false, "internalType": "address", "name": "erc20TokenAddress", "type": "address" }, { "indexed": false, "internalType": "bool", "name": "isERC20Poll", "type": "bool" } ], "name": "PollCreated", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": true, "internalType": "address", "name": "creator", "type": "address" } ], "name": "PollCreatorAdded", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": true, "internalType": "address", "name": "creator", "type": "address" } ], "name": "PollCreatorRemoved", "type": "event" }, { "inputs": [ { "internalType": "address", "name": "_creator", "type": "address" } ], "name": "removePollCreator", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "uint256", "name": "_pollId", "type": "uint256" }, { "internalType": "uint256", "name": "_optionId", "type": "uint256" }, { "internalType": "uint256", "name": "_voteCount", "type": "uint256" } ], "name": "removeVote", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "renounceOwnership", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "newOwner", "type": "address" } ], "name": "transferOwnership", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "uint256", "name": "_pollId", "type": "uint256" }, { "internalType": "uint256", "name": "_optionId", "type": "uint256" }, { "internalType": "uint256", "name": "_voteCount", "type": "uint256" } ], "name": "vote", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "anonymous": false, "inputs": [ { "indexed": true, "internalType": "address", "name": "user", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "pollId", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "optionId", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "voteCount", "type": "uint256" } ], "name": "VoteRemoved", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": true, "internalType": "address", "name": "user", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "pollId", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "optionId", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "voteCount", "type": "uint256" } ], "name": "Voted", "type": "event" }, { "inputs": [], "name": "ERC20_TOKEN_ADDRESS", "outputs": [ { "internalType": "address", "name": "", "type": "address" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "_user", "type": "address" }, { "internalType": "uint256", "name": "_pollId", "type": "uint256" } ], "name": "getNFTBalance", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "uint256", "name": "_pollId", "type": "uint256" } ], "name": "getPoll", "outputs": [ { "internalType": "string", "name": "question", "type": "string" }, { "internalType": "string", "name": "description", "type": "string" }, { "internalType": "string[]", "name": "options", "type": "string[]" }, { "internalType": "uint256[]", "name": "votes", "type": "uint256[]" }, { "internalType": "bool", "name": "isActive", "type": "bool" }, { "internalType": "uint256", "name": "endTime", "type": "uint256" }, { "internalType": "uint256", "name": "totalVotes", "type": "uint256" }, { "internalType": "address[]", "name": "nftContractAddresses", "type": "address[]" }, { "internalType": "address", "name": "erc20TokenAddress", "type": "address" }, { "internalType": "bool", "name": "isERC20Poll", "type": "bool" }, { "internalType": "uint8", "name": "erc20Decimals", "type": "uint8" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "_user", "type": "address" }, { "internalType": "uint256", "name": "_pollId", "type": "uint256" } ], "name": "getTotalVotesUsed", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "_user", "type": "address" } ], "name": "getUserVotes", "outputs": [ { "components": [ { "internalType": "uint256", "name": "pollId", "type": "uint256" }, { "internalType": "uint256", "name": "optionId", "type": "uint256" }, { "internalType": "uint256", "name": "voteCount", "type": "uint256" } ], "internalType": "struct NFTandERC20Voting.UserVote[]", "name": "", "type": "tuple[]" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "owner", "outputs": [ { "internalType": "address", "name": "", "type": "address" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "", "type": "address" } ], "name": "pollCreators", "outputs": [ { "internalType": "bool", "name": "", "type": "bool" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "name": "polls", "outputs": [ { "internalType": "string", "name": "question", "type": "string" }, { "internalType": "string", "name": "description", "type": "string" }, { "internalType": "uint256", "name": "endTime", "type": "uint256" }, { "internalType": "bool", "name": "isActive", "type": "bool" }, { "internalType": "uint256", "name": "totalVotes", "type": "uint256" }, { "internalType": "address", "name": "erc20TokenAddress", "type": "address" }, { "internalType": "bool", "name": "isERC20Poll", "type": "bool" }, { "internalType": "uint8", "name": "erc20Decimals", "type": "uint8" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "", "type": "address" }, { "internalType": "uint256", "name": "", "type": "uint256" } ], "name": "userVotes", "outputs": [ { "internalType": "uint256", "name": "pollId", "type": "uint256" }, { "internalType": "uint256", "name": "optionId", "type": "uint256" }, { "internalType": "uint256", "name": "voteCount", "type": "uint256" } ], "stateMutability": "view", "type": "function" } ];
const NFT_VOTING_ADDRESS = '0x0d373c81928Ec30c63289ffed3B174a0D50c887b';

// Mapping der NFT-Kollektionen nach Adressen
const addressToCollection = nftCollections.reduce((map, collection) => {
  map[collection.address.toLowerCase()] = collection;
  return map;
}, {});

// Erstellen der artistMap für schnellen Zugriff
const artistMap = artistList.reduce((map, artist) => {
  map[artist.name.toLowerCase()] = artist;
  return map;
}, {});

// Sicherstellen, dass 'tanglebeasts' im artistMap vorhanden ist
if (!artistMap['tanglebeasts']) {
  artistMap['tanglebeasts'] = {
      name: 'Tanglebeasts',
      profilepicture: '/images/tanglebeasts-profile.png' // Pfad zum Profilbild von Tanglebeasts
  };
}

const PollsList = ({ artistName }) => {
  const [web3Instance, setWeb3] = useState(null);
  const [contract, setContract] = useState(null);
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [connectedAccount, setConnectedAccount] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  const [filters, setFilters] = useState({
      sort: '', // 'asc' oder 'desc'
      availability: [], // ['Live', 'Expired']
      artists: [], // Künstlerfilter
      pollTypes: [] // Neuer Filter für Poll Type
  });

  const [searchQuery, setSearchQuery] = useState(''); // Suchabfrage hinzufügen

  const location = useLocation();  // Verwenden von useLocation, um die aktuelle URL zu erhalten

  // Pagination States
  const resultsPerPage = 10; // Anzahl der Polls pro Seite
  const [currentPage, setCurrentPage] = useState(1);
  const [loadedBatches, setLoadedBatches] = useState(1); // Geladene Chargen
  const [totalBatches, setTotalBatches] = useState(1); // Gesamtanzahl der Chargen
  const [backgroundLoading, setBackgroundLoading] = useState(false);

  // Progress Bar State
  const [progressPercentage, setProgressPercentage] = useState(0);

  useEffect(() => {
      const init = async () => {
          const storedAccount = localStorage.getItem('account');

          if (storedAccount) {
              if (window.ethereum) {
                  try {
                      const web3Instance = new Web3(window.ethereum);
                      setWeb3(web3Instance);

                      const accounts = await web3Instance.eth.requestAccounts();
                      const currentAccount = accounts[0];

                      if (storedAccount.toLowerCase() !== currentAccount.toLowerCase()) {
                          setErrorMessage(
                              'Das verbundene Konto stimmt nicht mit dem gespeicherten Konto überein. Bitte verbinden Sie die richtige Wallet.'
                          );
                      } else {
                          setConnectedAccount(currentAccount);
                          const nftVotingContract = new web3Instance.eth.Contract(NFT_VOTING_ABI, NFT_VOTING_ADDRESS);
                          setContract(nftVotingContract);
                          await fetchPolls(nftVotingContract);
                      }
                  } catch (error) {
                      console.error('Fehler beim Initialisieren von Web3 oder Vertrag:', error);
                      setErrorMessage('Fehler beim Initialisieren von Web3 oder Vertrag.');
                  }
              } else {
                  alert('Bitte installieren Sie MetaMask!');
              }
          } else {
              try {
                  const readOnlyWeb3 = new Web3(getRpcUrl());
                  setWeb3(readOnlyWeb3);
                  const readOnlyContract = new readOnlyWeb3.eth.Contract(NFT_VOTING_ABI, NFT_VOTING_ADDRESS);
                  setContract(readOnlyContract);
                  await fetchPolls(readOnlyContract);
              } catch (error) {
                  console.error('Fehler beim Einrichten von Read-Only Web3:', error);
                  setErrorMessage('Fehler beim Einrichten von Read-Only Web3.');
              }
          }

          setLoading(false);
      };

      init();
  }, []);

  const fetchPolls = async (contractInstance) => {
      setLoading(true);
      setPolls([]);
      setLoadedBatches(0);
      setTotalBatches(1);

      const totalPolls = 100; // Gesamtanzahl der Polls (kann dynamisch sein)
      const batches = Math.ceil(totalPolls / resultsPerPage);
      setTotalBatches(batches);

      // Laden der ersten Charge
      const firstBatch = await loadPollBatch(contractInstance, 0, resultsPerPage);
      setPolls(firstBatch);
      setLoadedBatches(1);
      setProgressPercentage((1 / batches) * 100);
      setLoading(false);

      // Hintergrundladen der restlichen Chargen
      setBackgroundLoading(true);

      for (let batch = 1; batch < batches; batch++) {
          const start = batch * resultsPerPage;
          const limit = resultsPerPage;
          const batchPolls = await loadPollBatch(contractInstance, start, limit);
          setPolls(prevPolls => {
              const combinedPolls = [...prevPolls, ...batchPolls];
              // Entfernen von Duplikaten basierend auf poll ID
              const uniquePolls = combinedPolls.filter((poll, index, self) =>
                  index === self.findIndex((p) => p.id === poll.id)
              );
              return uniquePolls;
          });
          setLoadedBatches(batch + 1);
          setProgressPercentage(((batch + 1) / batches) * 100);
      }

      setBackgroundLoading(false);
  };

  const loadPollBatch = async (contractInstance, start, limit) => {
      const pollsArray = [];
      for (let i = start; i < start + limit; i++) {
          try {
              const poll = await contractInstance.methods.getPoll(i).call();

              const votes = poll.votes.map((vote) => vote.toString());

              // Konvertieren von BigInt-Adressen in Strings
              const nftContractAddresses = poll.nftContractAddresses.map((address) => address.toLowerCase());

              // Sammeln von NFT-Daten aus Vertragsadressen
              const nftData = nftContractAddresses.map((address) => {
                  const collection = addressToCollection[address.toLowerCase()];
                  return collection
                      ? {
                          name: collection.name,
                          artist: collection.artist, // Stellen Sie sicher, dass 'artist' im nftCollections-Objekt vorhanden ist
                      }
                      : { name: address, artist: '' };  // Verwenden Sie einen leeren String, wenn kein Künstler gefunden wird
              });

              // Extrahieren eindeutiger Künstlernamen aus nftData
              const uniqueArtists = [...new Set(nftData.map((item) => item.artist).filter(Boolean))];

              // Bestimmen des artistName basierend auf der Anzahl eindeutiger Künstler
              let artistNameFromPoll = uniqueArtists.length > 1 ? 'TANGLESPACE' : (uniqueArtists[0] || '');

              // Wenn es eine ERC20-Umfrage ist, setze den Künstler auf "Tanglebeasts"
              if (poll.isERC20Poll) {
                  artistNameFromPoll = 'Tanglebeasts';
              }

              // Überprüfen, ob der Poll angezeigt werden soll
              if (location.pathname.includes('/fairvote') || artistNameFromPoll.toLowerCase() === artistName.toLowerCase()) {
                  const endTime = parseInt(poll.endTime);
                  const isActive = poll.isActive;
                  const currentTime = Math.floor(Date.now() / 1000);

                  const status = isActive && currentTime < endTime ? 'Live' : 'Expired';

                  pollsArray.push({
                      id: i,
                      ...poll,
                      votes,
                      nftData,
                      artistName: artistNameFromPoll,
                      status
                  });
              }
          } catch (error) {
              // console.error(`Fehler beim Abrufen des Polls mit ID ${i}:`, error);
          }
      }
      return pollsArray;
  };

  if (loading && loadedBatches === 0) {
      return (
          <div className="loading-container">
              <img src="/loading.gif" alt="Loading..." />
          </div>
      );
  }

  if (errorMessage) {
      return (
          <div className="error-message">
              <p>{errorMessage}</p>
          </div>
      );
  }

  const headingText = location.pathname.includes('/fairvote')
      ? 'FAIRVOTE'
      : `${artistName.toUpperCase()}'S POLLS`;

  // Anwenden der Filter
  const filteredPolls = polls.filter(poll => {
      // Suchfilter
      const matchesSearch = poll.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            poll.artistName.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      // Verfügbarkeitsfilter
      if (filters.availability.length > 0 && !filters.availability.includes(poll.status)) {
          return false;
      }

      // Künstlerfilter
      if (filters.artists.length > 0 && !filters.artists.includes(poll.artistName)) {
          return false;
      }

      // Poll Type Filter
      if (filters.pollTypes.length > 0) {
          if (poll.isERC20Poll && !filters.pollTypes.includes('BEAST')) return false;
          if (!poll.isERC20Poll && !filters.pollTypes.includes('PROJECTS')) return false;
      }

      return true;
  });

  // Anwenden der Sortierung
  const sortedPolls = [...filteredPolls].sort((a, b) => {
      if (filters.sort === 'asc') {
          return a.id - b.id;
      } else if (filters.sort === 'desc') {
          return b.id - a.id;
      }
      return 0; // Keine Sortierung
  });

  // Berechne die Gesamtseitenzahl dynamisch basierend auf den gefilterten Polls
  const totalPages = Math.ceil(sortedPolls.length / resultsPerPage);

  // Polls für die aktuelle Seite
  const getCurrentPolls = () => {
      const startIndex = (currentPage - 1) * resultsPerPage;
      return sortedPolls.slice(startIndex, startIndex + resultsPerPage);
  };

  const handleFilterChange = (newFilters) => {
      setFilters(newFilters);
      setCurrentPage(1); // Zurücksetzen auf die erste Seite bei Filteränderung
  };

  // Extrahieren der einzigartigen Künstler aus den Polls
  const availableArtists = [...new Set(polls.map(poll => poll.artistName).filter(Boolean))];

  return (
      <div className="polls-list-container">
          <div className="nft-list">
              <div className='w100 flex space-between CollectionDetail-mediaDiv'>
                  <div className='w20 Coll-FilterDiv ButtonandFilterMedia'>
                      {/* Filterkomponente */}
                      <PollFilter onFilterChange={handleFilterChange} artists={availableArtists} />
                  </div>
                  <div className='w100 flex column flex-start ml20 ml0-media'>
                      
                      <div className='w95 flex space-between center-ho'>
                      <h2 className='mt15 OnlyDesktop mb0'>{headingText}</h2>
                      <div>
                          <div className="collection-stats gap15 p0imp">
                              <div className='collection-stats-div text-align-left'>
                                  <p className='s16 grey'>TOTAL POLLS</p>
                                  <div className='bold ml5'>{filteredPolls.length}</div>
                              </div>
                              <div className='collection-stats-div text-align-left'>
                                  <p className='s16 grey'>LIVE POLLS</p>
                                  <div className='bold ml5'>{filteredPolls.filter(poll => poll.status === 'Live').length}</div>
                              </div>
                              <div className='collection-stats-div text-align-left'>
                                  <p className='s16 grey'>EXPIRED POLLS</p>
                                  <div className='bold ml5'>{filteredPolls.filter(poll => poll.status === 'Expired').length}</div>
                              </div>
                              {/* Weitere Statistiken können hier hinzugefügt werden */}
                          </div>
                          </div>
                      </div>

                      <div className='flex space-between w95'>
                          <div className='w100 flex center-ho space-between'>
                              <div className='w30'>
                                  {/* Suchleiste */}
                                  <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} placeholder="Suche nach Künstler oder Umfrage" />
                              </div>
                              <div className="custom-pagination mt15">
                                  <button 
                                      className="custom-pagination-btn previous-btn"
                                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} 
                                      disabled={currentPage === 1}
                                  >
                                      &lt; 
                                  </button>
                                  <span className="custom-pagination-info">
                                      {currentPage} OF {totalPages}
                                  </span>

                                  <button 
                                      className="custom-pagination-btn next-btn custom-pagination-info-2 margin0"
                                      onClick={() => {
                                          if (currentPage < totalPages && currentPage + 1 > loadedBatches) {
                                              setLoading(true); // Setze den Ladezustand
                                          }
                                          setCurrentPage(prev => Math.min(prev + 1, totalPages));
                                      }} 
                                      disabled={currentPage === totalPages || (currentPage + 1 > loadedBatches)}
                                  >
                                      {currentPage < totalPages && currentPage + 1 > loadedBatches ? (
                                          <img src="/basic-loading.gif" alt="Loading..." className="loading-gif" />
                                      ) : (
                                          '>'
                                      )}
                                  </button>
                              </div>
                          </div>
                      </div>

                      {/* Progress-Bar während des Ladens */}
                      { (loading || backgroundLoading) && (
                          <div className="progress-bar-container mb10">
                              <div 
                                  className="progress-bar" 
                                  style={{ width: `${progressPercentage}%` }}
                              ></div>
                          </div>
                      )}

                      {/* Hauptinhalt der Polls */}
                      <div className='poll-Collection-Div'>
                          {sortedPolls.length === 0 ? (
                              <div className="no-nfts-container flex centered column">
                                  <h2 className="no-nfts-message">No Polls found...</h2>
                                  <img src="/no-nft.png" alt="no poll Icon" className="no-nfts-image" />
                              </div>
                          ) : (
                              getCurrentPolls().map((poll, index) => {
                                  // Finden des entsprechenden Künstlerprofils
                                  const artist = artistMap[poll.artistName.toLowerCase()];
                                  const profileImage = artist 
                                      ? artist.profilepicture 
                                      : (poll.isERC20Poll ? '/images/tanglebeasts-profile.png' : '/images/default-profile.png'); // Fallback-Bild

                                  return (
                                      <div key={poll.id} className="poll-card">
                                          {/* Hinzufügen des Span-Elements für ERC20 Polls */}
                                          {poll.isERC20Poll && (
                                            <div className='flex center-ho'>
                                              <img src='/crown.png' className='h20px mr5'></img>
                                              <span className="erc20-voting-label s14 gold">BEAST TOKEN VOTING</span>
                                              </div>
                                          )}
                                          <div className='flex center-ho space-between'>
                                              <h2 className="poll-question-card">{poll.question}</h2>
                                              <img
                                                  src={profileImage}
                                                  alt={`${poll.artistName} Profil`}
                                                  className="artist-profile-image-poll"
                                              />
                                          </div>
                                          <div className='flex space-between mt15'>
                                          <Link
                                              to={`/fairvote/${poll.id}`}
                                              className={`view-details-button ${poll.status === 'Expired' ? 'expired' : ''}`}
                                          >
                                              {poll.status === 'Live' ? 'VOTE NOW' : 'VIEW RESULTS'}
                                          </Link>

                                              {poll.nftData && poll.nftData.length > 0 && (
                                                  <div className="nft-info">
                                                      <p className='mb0'>{poll.artistName}</p>
                                                  </div>
                                              )}
                                          </div>
                                      </div>
                                  );
                              })
                          )}
                      </div>
                  </div>
              </div>
          </div>
      </div>
  );
};

export default PollsList;