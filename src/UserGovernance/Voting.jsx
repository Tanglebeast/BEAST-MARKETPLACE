// src/components/PollDetails.js
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Web3 from 'web3';
import '../styles/Voting.css';
import { getRpcUrl, getCurrentNetwork } from '../components/networkConfig';
import { nftCollections } from '../NFTCollections';
import CustomPopup from '../components/AlertPopup';

const NFT_VOTING_ABI = [ { "inputs": [ { "internalType": "string", "name": "_question", "type": "string" }, { "internalType": "string", "name": "_description", "type": "string" }, { "internalType": "string[]", "name": "_options", "type": "string[]" }, { "internalType": "uint256", "name": "_durationInHours", "type": "uint256" }, { "internalType": "address[]", "name": "_nftContractAddresses", "type": "address[]" } ], "name": "createPoll", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "uint256", "name": "_pollId", "type": "uint256" } ], "name": "endPoll", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "stateMutability": "nonpayable", "type": "constructor" }, { "inputs": [ { "internalType": "address", "name": "owner", "type": "address" } ], "name": "OwnableInvalidOwner", "type": "error" }, { "inputs": [ { "internalType": "address", "name": "account", "type": "address" } ], "name": "OwnableUnauthorizedAccount", "type": "error" }, { "anonymous": false, "inputs": [ { "indexed": true, "internalType": "address", "name": "previousOwner", "type": "address" }, { "indexed": true, "internalType": "address", "name": "newOwner", "type": "address" } ], "name": "OwnershipTransferred", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": false, "internalType": "uint256", "name": "pollId", "type": "uint256" }, { "indexed": false, "internalType": "string", "name": "question", "type": "string" }, { "indexed": false, "internalType": "string", "name": "description", "type": "string" }, { "indexed": false, "internalType": "string[]", "name": "options", "type": "string[]" }, { "indexed": false, "internalType": "uint256", "name": "endTime", "type": "uint256" }, { "indexed": false, "internalType": "address[]", "name": "nftContractAddresses", "type": "address[]" } ], "name": "PollCreated", "type": "event" }, { "inputs": [ { "internalType": "uint256", "name": "_pollId", "type": "uint256" }, { "internalType": "uint256", "name": "_optionId", "type": "uint256" }, { "internalType": "uint256", "name": "_voteCount", "type": "uint256" } ], "name": "removeVote", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "renounceOwnership", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "newOwner", "type": "address" } ], "name": "transferOwnership", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "uint256", "name": "_pollId", "type": "uint256" }, { "internalType": "uint256", "name": "_optionId", "type": "uint256" }, { "internalType": "uint256", "name": "_voteCount", "type": "uint256" } ], "name": "vote", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "anonymous": false, "inputs": [ { "indexed": true, "internalType": "address", "name": "user", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "pollId", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "optionId", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "voteCount", "type": "uint256" } ], "name": "VoteRemoved", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": true, "internalType": "address", "name": "user", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "pollId", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "optionId", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "voteCount", "type": "uint256" } ], "name": "Voted", "type": "event" }, { "inputs": [ { "internalType": "address", "name": "_user", "type": "address" }, { "internalType": "uint256", "name": "_pollId", "type": "uint256" } ], "name": "getNFTBalance", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "uint256", "name": "_pollId", "type": "uint256" } ], "name": "getPoll", "outputs": [ { "internalType": "string", "name": "question", "type": "string" }, { "internalType": "string", "name": "description", "type": "string" }, { "internalType": "string[]", "name": "options", "type": "string[]" }, { "internalType": "uint256[]", "name": "votes", "type": "uint256[]" }, { "internalType": "bool", "name": "isActive", "type": "bool" }, { "internalType": "uint256", "name": "endTime", "type": "uint256" }, { "internalType": "uint256", "name": "totalVotes", "type": "uint256" }, { "internalType": "address[]", "name": "nftContractAddresses", "type": "address[]" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "_user", "type": "address" }, { "internalType": "uint256", "name": "_pollId", "type": "uint256" } ], "name": "getTotalVotesUsed", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "_user", "type": "address" } ], "name": "getUserVotes", "outputs": [ { "components": [ { "internalType": "uint256", "name": "pollId", "type": "uint256" }, { "internalType": "uint256", "name": "optionId", "type": "uint256" }, { "internalType": "uint256", "name": "voteCount", "type": "uint256" } ], "internalType": "struct NFTVoting.UserVote[]", "name": "", "type": "tuple[]" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "owner", "outputs": [ { "internalType": "address", "name": "", "type": "address" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "name": "polls", "outputs": [ { "internalType": "string", "name": "question", "type": "string" }, { "internalType": "string", "name": "description", "type": "string" }, { "internalType": "uint256", "name": "endTime", "type": "uint256" }, { "internalType": "bool", "name": "isActive", "type": "bool" }, { "internalType": "uint256", "name": "totalVotes", "type": "uint256" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "", "type": "address" }, { "internalType": "uint256", "name": "", "type": "uint256" } ], "name": "userVotes", "outputs": [ { "internalType": "uint256", "name": "pollId", "type": "uint256" }, { "internalType": "uint256", "name": "optionId", "type": "uint256" }, { "internalType": "uint256", "name": "voteCount", "type": "uint256" } ], "stateMutability": "view", "type": "function" } ];
const NFT_VOTING_ADDRESS = '0x26d2F2B120e9841B76f195bE6788397215a09137';

const networkConfigs = {
    iotaevm: {
      chainId: '0x433',
      chainName: 'IOTA EVM Testnet',
      rpcUrls: ['https://json-rpc.evm.testnet.iotaledger.net'],
      nativeCurrency: {
        name: 'IOTA',
        symbol: 'IOTA',
        decimals: 18,
      },
      blockExplorerUrls: ['https://explorer.evm.testnet.iotaledger.net'],
    },
    bnbchain: {
      chainId: '0x61',
      chainName: 'BNB Smart Chain Testnet',
      rpcUrls: ['https://data-seed-prebsc-1-s1.bnbchain.org:8545'],
      nativeCurrency: {
        name: 'BNB',
        symbol: 'BNB',
        decimals: 18,
      },
      blockExplorerUrls: ['https://testnet.bscscan.com/'],
    },
    polygon: {
      chainId: '0x13882',
      chainName: 'Polygon Amoy Testnet',
      rpcUrls: ['https://rpc-amoy.polygon.technology'],
      nativeCurrency: {
        name: 'MATIC',
        symbol: 'MATIC',
        decimals: 18,
      },
      blockExplorerUrls: ['https://amoy.polygonscan.com'],
    },
    ethereum: {
      chainId: '0xaa36a7',
      chainName: 'Ethereum Sepolia Testnet',
      rpcUrls: ['wss://sepolia.drpc.org'],
      nativeCurrency: {
        name: 'ETH',
        symbol: 'ETH',
        decimals: 18,
      },
      blockExplorerUrls: ['https://sepolia.etherscan.io'],
    },
  };

const PollDetails = () => {
    const [web3, setWeb3] = useState(null);
    const [contract, setContract] = useState(null);
    const [poll, setPoll] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedOption, setSelectedOption] = useState(0);
    const [voteCount, setVoteCount] = useState(1);
    const [userVotes, setUserVotes] = useState(0);
    const [availableVotes, setAvailableVotes] = useState(0);
    const [connectedAccount, setConnectedAccount] = useState(null);
    const [errorMessage, setErrorMessage] = useState('');
    const [timeLeft, setTimeLeft] = useState('');
    const { id: pollId } = useParams();
    const [showModal, setShowModal] = useState(false); // Status für das Anzeigen des Modals
    const [modalMessage, setModalMessage] = useState('');
    const [isPollEnded, setIsPollEnded] = useState(false);


    const pollIdInt = parseInt(pollId);

    const handleCloseModal = () => {
        setShowModal(false);
    };
    

    useEffect(() => {
        const init = async () => {
            const storedAccount = localStorage.getItem('account');
    
            if (window.ethereum && storedAccount) {
                try {
                    const web3Instance = new Web3(window.ethereum);
                    setWeb3(web3Instance);
    
                    const accounts = await web3Instance.eth.requestAccounts();
                    const currentAccount = accounts[0];
    
                    if (storedAccount !== currentAccount) {
                        setErrorMessage('Das verbundene Konto stimmt nicht mit dem gespeicherten Konto überein. Bitte verbinden Sie das richtige Wallet.');
                    } else {
                        setConnectedAccount(currentAccount);
                        const nftVotingContract = new web3Instance.eth.Contract(NFT_VOTING_ABI, NFT_VOTING_ADDRESS);
                        setContract(nftVotingContract);
                        await fetchPoll(nftVotingContract, currentAccount);
                    }
                } catch (error) {
                    console.error('Fehler bei der Initialisierung von Web3 oder dem Vertrag:', error);
                    setErrorMessage('Fehler bei der Initialisierung von Web3 oder dem Vertrag.');
                }
            } else {
                try {
                    const readOnlyWeb3 = new Web3(getRpcUrl());
                    setWeb3(readOnlyWeb3);
                    const readOnlyContract = new readOnlyWeb3.eth.Contract(NFT_VOTING_ABI, NFT_VOTING_ADDRESS);
                    setContract(readOnlyContract);
                    await fetchPoll(readOnlyContract);
                } catch (error) {
                    console.error('Fehler beim Einrichten des Read-Only Web3:', error);
                    setErrorMessage('Fehler beim Einrichten des Read-Only Web3.');
                }
            }
    
            setLoading(false);
        };
    
        init();
    }, [pollId]);


    useEffect(() => {
        if (poll && poll.endTime) {
            const endTime = Number(poll.endTime);
            const intervalId = setInterval(() => {
                const now = Math.floor(Date.now() / 1000);
                const remainingTime = endTime - now;
    
                if (remainingTime <= 0) {
                    setTimeLeft('TIME OVER');
                    setIsPollEnded(true); // Umfrage als abgelaufen markieren
                    clearInterval(intervalId);
                } else {
                    const days = Math.floor(remainingTime / (3600 * 24));
                    const hours = Math.floor((remainingTime % (3600 * 24)) / 3600);
                    const minutes = Math.floor((remainingTime % 3600) / 60);
                    const seconds = remainingTime % 60;
    
                    setTimeLeft(`${days}D ${hours}H ${minutes}M ${seconds}S`);
                }
            }, 1000);
    
            return () => clearInterval(intervalId);
        }
    }, [poll]);
    
    

    const fetchPoll = async (contract, account = null) => {
        try {
            // console.log(`Lade Umfrage mit ID: ${pollIdInt}`);
            const pollData = await contract.methods.getPoll(pollIdInt).call();
            if (pollData) {
                const votes = pollData[2].map(vote => vote.toString());
                const nftContractAddresses = pollData[7]; // Assuming this is the correct index
                // console.log('NFT Contract Addresses:', nftContractAddresses);
                setPoll({ 
                    question: pollData[0],
                    description: pollData[1],
                    options: pollData[2],
                    votes: pollData[3],
                    isActive: pollData[4],
                    endTime: pollData[5],
                    totalVotes: pollData[6],
                    nftContractAddresses
                });
    
                if (account) {
                    await fetchUserVotes(contract, account);
                    await fetchAvailableVotes(contract, account);
                }
            } else {
                // console.error(`Keine Umfragedaten für ID gefunden: ${pollIdInt}`);
            }
        } catch (error) {
            // console.error(`Fehler beim Laden der Umfrage mit ID ${pollIdInt}:`, error);
        }
    };
    
    const fetchUserVotes = async (contract, account) => {
        try {
            const userVotesData = await contract.methods.getUserVotes(account).call();
            // console.log('Alle Benutzervotes:', userVotesData);
            const votesForPoll = userVotesData.filter(vote => vote.pollId.toString() === pollIdInt.toString());
            // console.log('Gefundene Votes für diese Umfrage:', votesForPoll);
    
            const votesMap = votesForPoll.reduce((acc, vote) => {
                acc[vote.optionId] = (acc[vote.optionId] || 0) + parseInt(vote.voteCount);
                return acc;
            }, {});
    
            setUserVotes(votesMap);
        } catch (error) {
            console.error('Error getting user vote', error);
        }
    };
    
    
    const fetchAvailableVotes = async (contract, account) => {
        try {
            const nftBalance = await contract.methods.getNFTBalance(account, pollIdInt).call();
            setAvailableVotes(nftBalance.toString());
        } catch (error) {
            console.error('Error getting voices', error);
        }
    };

    const checkValues = async () => {
        // const accounts = await web3.eth.getAccounts();
        // const nftBalance = await contract.methods.getNFTBalance(accounts[0], pollIdInt).call();
        // const userVotesData = await contract.methods.getUserVotes(accounts[0]).call();
        // console.log('Verfügbare Stimmen:', nftBalance);
        // console.log('Benutzervotes:', userVotesData);
    };
    
    checkValues();
    

    const handleVote = async () => {
        if (!contract || !connectedAccount) {
            setModalMessage('Wallet not connected or authorized');
            setShowModal(true);
            return;
        }
        try {
            const receipt = await contract.methods.vote(pollId, selectedOption, voteCount).send({
                from: connectedAccount,
                gas: 3000000,
                gasPrice: Web3.utils.toWei('20', 'gwei')
            });
            console.log('Transaction:', receipt);
            if (receipt.status) {
                setModalMessage('Vote submitted successfully!');
                setShowModal(true);
                await fetchPoll(contract, connectedAccount);
            } else {
                throw new Error('Transaction failed');
            }
        } catch (error) {
            console.error('Error voting', error);
            setModalMessage('Error submitting Vote. Do you own enough voting rights?');
            setShowModal(true);
        }
    };

    const handleRemoveVote = async () => {
        if (!contract || !connectedAccount) {
            setModalMessage('Wallet not connected or authorized.');
            setShowModal(true);
            return;
        }
        try {
            const receipt = await contract.methods.removeVote(pollId, selectedOption, voteCount).send({
                from: connectedAccount,
                gas: 3000000,
                gasPrice: Web3.utils.toWei('20', 'gwei')
            });
            console.log('Transactio:', receipt);
            if (receipt.status) {
                setModalMessage('Vote removed successfully!');
                setShowModal(true);
                await fetchPoll(contract, connectedAccount);
            } else {
                throw new Error('Transaction failed');
            }
        } catch (error) {
            console.error('Error removing voice', error);
            setModalMessage('Error removing voice');
            setShowModal(true);
        }
    };

    const handleConnectWallet = async () => {
        if (window.ethereum) {
            try {
                const currentNetwork = getCurrentNetwork();
                const networkConfig = networkConfigs[currentNetwork];
                
                if (!networkConfig) {
                    throw new Error('Unsupported network');
                }

                // Überprüfen und wechseln des Netzwerks
                await switchNetwork(networkConfig.chainId, networkConfig);

                const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
                const account = accounts[0];
                localStorage.setItem('account', account);
                setConnectedAccount(account);
                
                // Aktualisiere Web3 und Contract mit dem verbundenen Account
                const web3Instance = new Web3(window.ethereum);
                setWeb3(web3Instance);
                const nftVotingContract = new web3Instance.eth.Contract(NFT_VOTING_ABI, NFT_VOTING_ADDRESS);
                setContract(nftVotingContract);
                await fetchPoll(nftVotingContract, account);

                window.location.reload();

            } catch (error) {
                console.error('Fehler beim Verbinden des Wallets:', error);
                setErrorMessage('Fehler beim Verbinden des Wallets. Bitte versuchen Sie es erneut.');
            }
        } else {
            setErrorMessage('MetaMask ist nicht installiert. Bitte installieren Sie MetaMask, um fortzufahren.');
        }
    };

    const switchNetwork = async (targetChainId, networkConfig) => {
        try {
            await window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: targetChainId }],
            });
        } catch (switchError) {
            // This error code indicates that the chain has not been added to MetaMask.
            if (switchError.code === 4902) {
                try {
                    await window.ethereum.request({
                        method: 'wallet_addEthereumChain',
                        params: [networkConfig],
                    });
                } catch (addError) {
                    throw new Error('Failed to add the network to MetaMask');
                }
            } else {
                throw switchError;
            }
        }
    };

    const remainingVotes = availableVotes - userVotes;

    // Mapping der NFT-Kollektionen nach Adressen
    const addressToCollection = nftCollections.reduce((map, collection) => {
        map[collection.address.toLowerCase()] = collection;
        return map;
    }, {});

    // Aufbereiten der NFT-Daten
    const nftData = poll && Array.isArray(poll.nftContractAddresses) 
    ? poll.nftContractAddresses.map(address => {
        const collection = addressToCollection[address.toLowerCase()];
        return collection ? {
            name: collection.name,
            link: `/collections/${address}`,
            artist: collection.artist
        } : { name: address, link: '#', artist: '' };
    }) 
    : [];

    // console.log('Poll data:', poll);

    // Ermitteln des Künstlers (wenn alle Kollektionen denselben Künstler haben)
    const uniqueArtists = [...new Set(nftData.map(item => item.artist))];
    const artistName = uniqueArtists.length === 1 ? uniqueArtists[0] : '';

    const getTotalVotes = () => {
        if (!poll) return 0;
        return poll.votes.reduce((sum, votes) => sum + parseInt(votes), 0);
    };

    const getPercentage = (votes) => {
        const totalVotes = getTotalVotes();
        return totalVotes === 0 ? 0 : (votes / totalVotes) * 100;
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

    if (!poll) {
        return <div>Keine Umfragedaten gefunden.</div>;
    }

    return (
        <div className="poll-details-container column">
            <div className='centered mb15'><h2>{timeLeft}</h2></div>
                <div><h3>VOTING POWER:</h3></div>
                <div className="nft-contract-addresses mb15 mt0">
        {Array.isArray(nftData) && nftData.map((nft, index) => (
            <div className='column flex VisibleLink fit-content' key={index}>
                <span className='grey'> {artistName}</span>
                <a href={nft.link} target="_blank" rel="noopener noreferrer">{nft.name}</a>
                {index === 0}
            </div>
        ))}
    </div>
    <div className='mt10 mb10'>
    <span className='grey'>Description</span>
        <p className='mb0 mt0'>{poll.description}</p>
    </div>
            <div className='flex center-ho mt5 space-between'>
            <div>
            <span className='grey'>Question</span>
                <h2 className="poll-question-1 mt0 mb0">{poll.question}</h2>
            </div>
            <div>AVAILABLE VOTES: {availableVotes - Object.values(userVotes).reduce((acc, val) => acc + val, 0)} / {availableVotes}</div>
            </div>
            <ul className="poll-options">
            {Array.isArray(poll.options) && poll.options.map((option, index) => {
                    const votes = parseInt(poll.votes[index]);
                    const percentage = getPercentage(votes);
                    return (
                        <li
                            key={index}
                            className={`poll-option ${selectedOption === index ? 'selected' : ''}`}
                            onClick={() => setSelectedOption(index)}
                        >
                            <input
                                type="radio"
                                name="option"
                                value={index}
                                checked={selectedOption === index}
                                onChange={() => setSelectedOption(index)}
                            />
                            <span className="custom-checkmark"></span>
                            <label className='w100' style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                                <div className='space-between flex w100 gap50 center-ho'>
                                    <div className='w30'>{option}</div>

                                    <div className="vote-bar-container">
                                        <div 
                                            className="vote-bar" 
                                            style={{width: `${percentage}%`}}
                                        ></div>
                                    </div>

                                    <div className='flex w30'>{userVotes[index] || 0} / {votes} VOTES</div>
                                </div>
                            </label>
                        </li>
                    );
                })}
            </ul>
            <div className='centered column'>
                <label className='mb15' htmlFor="voteCount">VOTE AMOUNT:</label>
                <input
                    disabled={isPollEnded}
                    type="number"
                    id="voteCount"
                    value={voteCount}
                    onChange={(e) => setVoteCount(parseInt(e.target.value))}
                    min="1"
                    max="10"
                />
            </div>
            <div className='column centered w100'>
                {connectedAccount ? (
                    <>
                        <button onClick={handleVote} disabled={isPollEnded} className="vote-button mb10 mt15 w50">
                            <h2 className='mt5 mb5 s16'>SUBMIT VOTES</h2>
                        </button>
                        <button onClick={handleRemoveVote} disabled={isPollEnded} className="remove-vote-button w50">
                            <h2 className='mt5 mb5 s16'>REMOVE VOTES</h2>
                        </button>
                    </>
                ) : (
                    <button onClick={handleConnectWallet} className="vote-button mb10 mt15 w50">
                        <h2 className='mt5 mb5 s16'>CONNECT WALLET</h2>
                    </button>
                )}
            </div>
            {showModal && (
                <CustomPopup 
                    message={modalMessage} 
                    onClose={handleCloseModal} // korrektes Schließen
                />
            )}
        </div>
    );
};

export default PollDetails;