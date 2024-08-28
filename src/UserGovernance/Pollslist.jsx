// src/components/PollsList.js
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Web3 from 'web3';
import '../styles/Pollist.css';
import { getRpcUrl } from '../components/networkConfig';
import { nftCollections } from '../NFTCollections';


const NFT_VOTING_ABI = [ { "inputs": [ { "internalType": "string", "name": "_question", "type": "string" }, { "internalType": "string", "name": "_description", "type": "string" }, { "internalType": "string[]", "name": "_options", "type": "string[]" }, { "internalType": "uint256", "name": "_durationInHours", "type": "uint256" }, { "internalType": "address[]", "name": "_nftContractAddresses", "type": "address[]" } ], "name": "createPoll", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "uint256", "name": "_pollId", "type": "uint256" } ], "name": "endPoll", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "stateMutability": "nonpayable", "type": "constructor" }, { "inputs": [ { "internalType": "address", "name": "owner", "type": "address" } ], "name": "OwnableInvalidOwner", "type": "error" }, { "inputs": [ { "internalType": "address", "name": "account", "type": "address" } ], "name": "OwnableUnauthorizedAccount", "type": "error" }, { "anonymous": false, "inputs": [ { "indexed": true, "internalType": "address", "name": "previousOwner", "type": "address" }, { "indexed": true, "internalType": "address", "name": "newOwner", "type": "address" } ], "name": "OwnershipTransferred", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": false, "internalType": "uint256", "name": "pollId", "type": "uint256" }, { "indexed": false, "internalType": "string", "name": "question", "type": "string" }, { "indexed": false, "internalType": "string", "name": "description", "type": "string" }, { "indexed": false, "internalType": "string[]", "name": "options", "type": "string[]" }, { "indexed": false, "internalType": "uint256", "name": "endTime", "type": "uint256" }, { "indexed": false, "internalType": "address[]", "name": "nftContractAddresses", "type": "address[]" } ], "name": "PollCreated", "type": "event" }, { "inputs": [ { "internalType": "uint256", "name": "_pollId", "type": "uint256" }, { "internalType": "uint256", "name": "_optionId", "type": "uint256" }, { "internalType": "uint256", "name": "_voteCount", "type": "uint256" } ], "name": "removeVote", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "renounceOwnership", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "newOwner", "type": "address" } ], "name": "transferOwnership", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "uint256", "name": "_pollId", "type": "uint256" }, { "internalType": "uint256", "name": "_optionId", "type": "uint256" }, { "internalType": "uint256", "name": "_voteCount", "type": "uint256" } ], "name": "vote", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "anonymous": false, "inputs": [ { "indexed": true, "internalType": "address", "name": "user", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "pollId", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "optionId", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "voteCount", "type": "uint256" } ], "name": "VoteRemoved", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": true, "internalType": "address", "name": "user", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "pollId", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "optionId", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "voteCount", "type": "uint256" } ], "name": "Voted", "type": "event" }, { "inputs": [ { "internalType": "address", "name": "_user", "type": "address" }, { "internalType": "uint256", "name": "_pollId", "type": "uint256" } ], "name": "getNFTBalance", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "uint256", "name": "_pollId", "type": "uint256" } ], "name": "getPoll", "outputs": [ { "internalType": "string", "name": "question", "type": "string" }, { "internalType": "string", "name": "description", "type": "string" }, { "internalType": "string[]", "name": "options", "type": "string[]" }, { "internalType": "uint256[]", "name": "votes", "type": "uint256[]" }, { "internalType": "bool", "name": "isActive", "type": "bool" }, { "internalType": "uint256", "name": "endTime", "type": "uint256" }, { "internalType": "uint256", "name": "totalVotes", "type": "uint256" }, { "internalType": "address[]", "name": "nftContractAddresses", "type": "address[]" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "_user", "type": "address" }, { "internalType": "uint256", "name": "_pollId", "type": "uint256" } ], "name": "getTotalVotesUsed", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "_user", "type": "address" } ], "name": "getUserVotes", "outputs": [ { "components": [ { "internalType": "uint256", "name": "pollId", "type": "uint256" }, { "internalType": "uint256", "name": "optionId", "type": "uint256" }, { "internalType": "uint256", "name": "voteCount", "type": "uint256" } ], "internalType": "struct NFTVoting.UserVote[]", "name": "", "type": "tuple[]" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "owner", "outputs": [ { "internalType": "address", "name": "", "type": "address" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "name": "polls", "outputs": [ { "internalType": "string", "name": "question", "type": "string" }, { "internalType": "string", "name": "description", "type": "string" }, { "internalType": "uint256", "name": "endTime", "type": "uint256" }, { "internalType": "bool", "name": "isActive", "type": "bool" }, { "internalType": "uint256", "name": "totalVotes", "type": "uint256" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "", "type": "address" }, { "internalType": "uint256", "name": "", "type": "uint256" } ], "name": "userVotes", "outputs": [ { "internalType": "uint256", "name": "pollId", "type": "uint256" }, { "internalType": "uint256", "name": "optionId", "type": "uint256" }, { "internalType": "uint256", "name": "voteCount", "type": "uint256" } ], "stateMutability": "view", "type": "function" } ];
const NFT_VOTING_ADDRESS = '0x26d2F2B120e9841B76f195bE6788397215a09137';

// Mapping der NFT-Kollektionen nach Adressen
const addressToCollection = nftCollections.reduce((map, collection) => {
    map[collection.address.toLowerCase()] = collection;
    return map;
}, {});


const PollsList = ({ artistName }) => {
    const [web3, setWeb3] = useState(null);
    const [contract, setContract] = useState(null);
    const [polls, setPolls] = useState([]);
    const [loading, setLoading] = useState(true);
    const [connectedAccount, setConnectedAccount] = useState(null);
    const [errorMessage, setErrorMessage] = useState('');
  
    const location = useLocation();  // Use useLocation to get the current URL
  
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
  
              if (storedAccount !== currentAccount) {
                setErrorMessage(
                  'Connected account does not match the stored account. Please connect the correct wallet.'
                );
              } else {
                setConnectedAccount(currentAccount);
                const nftVotingContract = new web3Instance.eth.Contract(NFT_VOTING_ABI, NFT_VOTING_ADDRESS);
                setContract(nftVotingContract);
                await fetchPolls(nftVotingContract);
              }
            } catch (error) {
              console.error('Error initializing Web3 or contract:', error);
              setErrorMessage('Failed to initialize Web3 or contract.');
            }
          } else {
            alert('Please install MetaMask!');
          }
        } else {
          try {
            const readOnlyWeb3 = new Web3(getRpcUrl());
            setWeb3(readOnlyWeb3);
            const readOnlyContract = new readOnlyWeb3.eth.Contract(NFT_VOTING_ABI, NFT_VOTING_ADDRESS);
            setContract(readOnlyContract);
            await fetchPolls(readOnlyContract);
          } catch (error) {
            console.error('Error setting up read-only Web3:', error);
            setErrorMessage('Failed to set up read-only Web3.');
          }
        }
  
        setLoading(false);
      };
  
      init();
    }, []);
  
    const fetchPolls = async (contract) => {
        const pollsArray = [];
        for (let i = 0; i < 10; i++) {
            try {
                const poll = await contract.methods.getPoll(i).call();
    
                const votes = poll[2].map((vote) => vote.toString());
    
                // Convert BigInt addresses to strings
                const nftContractAddresses = poll[7].map((address) => address.toLowerCase());
    
                // Collect NFT data from contract addresses
                const nftData = nftContractAddresses.map((address) => {
                    const collection = addressToCollection[address.toLowerCase()];
                    return collection
                        ? {
                            name: collection.name,
                            artist: collection.artist,
                        }
                        : { name: address, artist: '' };  // Use empty string if no artist found
                });
    
                // Extract unique artist names from nftData
                const uniqueArtists = [...new Set(nftData.map((item) => item.artist).filter(Boolean))];
    
                // Determine artistName based on unique artists count
                const artistNameFromPoll = uniqueArtists.length > 1 ? 'FRACTALZ' : (uniqueArtists[0] || '');
    
                if (location.pathname.includes('/fairvote') || artistNameFromPoll.toLowerCase() === artistName.toLowerCase()) {
                    const endTime = parseInt(poll[5]);
                    const isActive = poll[4];
                    const currentTime = Math.floor(Date.now() / 1000);
    
                    const status = isActive && currentTime < endTime ? 'View Voting' : 'EXPIRED';
    
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
                console.error(`Error fetching poll with ID ${i}:`, error);
            }
        }
        setPolls(pollsArray);
    };
    
    
      
  
    if (loading) {
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
    ? 'Available Fairvotes'
    : `${artistName.toUpperCase()}'S POLLS`;
  
    return (
        <div className="polls-list-container">
        <h2 className="polls-list-heading s24">{headingText}</h2>
        <div className="mediacolumn3">
          {polls.length === 0 && <p>No polls available.</p>}
          {polls.map((poll, index) => (
            <div key={index} className="poll-container">
              <h2 className="poll-question-card">{poll[0]}</h2>
              {poll.nftData && poll.nftData.length > 0 && (
                <div className="nft-info">
                  <p>{poll.artistName}</p> {/* Updated to display the correct artist name */}
                </div>
              )}
              <Link
                to={`/fairvote/${poll.id}`}
                className={`view-details-button ${poll.status === 'EXPIRED' ? 'disabled' : ''}`}
                style={{ pointerEvents: poll.status === 'EXPIRED' ? '' : 'auto' }}
              >
                {poll.status}
              </Link>
            </div>
          ))}
        </div>
      </div>
    );
  };
  
  export default PollsList;