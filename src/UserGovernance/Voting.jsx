// src/components/PollDetails.js
import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import Web3 from 'web3';
import '../styles/Voting.css';
import { getRpcUrl, getCurrentNetwork } from '../components/networkConfig';
import { nftCollections } from '../NFTCollections';
import CustomPopup from '../components/AlertPopup';
import { getGasEstimate } from '../components/utils';

const NFT_VOTING_ABI = [ { "inputs": [ { "internalType": "address", "name": "_creator", "type": "address" } ], "name": "addPollCreator", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "string", "name": "_question", "type": "string" }, { "internalType": "string", "name": "_description", "type": "string" }, { "internalType": "string[]", "name": "_options", "type": "string[]" }, { "internalType": "uint256", "name": "_durationInHours", "type": "uint256" } ], "name": "createERC20Poll", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "string", "name": "_question", "type": "string" }, { "internalType": "string", "name": "_description", "type": "string" }, { "internalType": "string[]", "name": "_options", "type": "string[]" }, { "internalType": "uint256", "name": "_durationInHours", "type": "uint256" }, { "internalType": "address[]", "name": "_nftContractAddresses", "type": "address[]" } ], "name": "createNFTPoll", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "stateMutability": "nonpayable", "type": "constructor" }, { "inputs": [ { "internalType": "address", "name": "owner", "type": "address" } ], "name": "OwnableInvalidOwner", "type": "error" }, { "inputs": [ { "internalType": "address", "name": "account", "type": "address" } ], "name": "OwnableUnauthorizedAccount", "type": "error" }, { "anonymous": false, "inputs": [ { "indexed": true, "internalType": "address", "name": "previousOwner", "type": "address" }, { "indexed": true, "internalType": "address", "name": "newOwner", "type": "address" } ], "name": "OwnershipTransferred", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": false, "internalType": "uint256", "name": "pollId", "type": "uint256" }, { "indexed": false, "internalType": "string", "name": "question", "type": "string" }, { "indexed": false, "internalType": "string", "name": "description", "type": "string" }, { "indexed": false, "internalType": "string[]", "name": "options", "type": "string[]" }, { "indexed": false, "internalType": "uint256", "name": "endTime", "type": "uint256" }, { "indexed": false, "internalType": "address[]", "name": "nftContractAddresses", "type": "address[]" }, { "indexed": false, "internalType": "address", "name": "erc20TokenAddress", "type": "address" }, { "indexed": false, "internalType": "bool", "name": "isERC20Poll", "type": "bool" } ], "name": "PollCreated", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": true, "internalType": "address", "name": "creator", "type": "address" } ], "name": "PollCreatorAdded", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": true, "internalType": "address", "name": "creator", "type": "address" } ], "name": "PollCreatorRemoved", "type": "event" }, { "inputs": [ { "internalType": "address", "name": "_creator", "type": "address" } ], "name": "removePollCreator", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "uint256", "name": "_pollId", "type": "uint256" }, { "internalType": "uint256", "name": "_optionId", "type": "uint256" }, { "internalType": "uint256", "name": "_voteCount", "type": "uint256" } ], "name": "removeVote", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "renounceOwnership", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "newOwner", "type": "address" } ], "name": "transferOwnership", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "uint256", "name": "_pollId", "type": "uint256" }, { "internalType": "uint256", "name": "_optionId", "type": "uint256" }, { "internalType": "uint256", "name": "_voteCount", "type": "uint256" } ], "name": "vote", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "anonymous": false, "inputs": [ { "indexed": true, "internalType": "address", "name": "user", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "pollId", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "optionId", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "voteCount", "type": "uint256" } ], "name": "VoteRemoved", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": true, "internalType": "address", "name": "user", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "pollId", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "optionId", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "voteCount", "type": "uint256" } ], "name": "Voted", "type": "event" }, { "inputs": [], "name": "ERC20_TOKEN_ADDRESS", "outputs": [ { "internalType": "address", "name": "", "type": "address" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "_user", "type": "address" }, { "internalType": "uint256", "name": "_pollId", "type": "uint256" } ], "name": "getNFTBalance", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "uint256", "name": "_pollId", "type": "uint256" } ], "name": "getPoll", "outputs": [ { "internalType": "string", "name": "question", "type": "string" }, { "internalType": "string", "name": "description", "type": "string" }, { "internalType": "string[]", "name": "options", "type": "string[]" }, { "internalType": "uint256[]", "name": "votes", "type": "uint256[]" }, { "internalType": "bool", "name": "isActive", "type": "bool" }, { "internalType": "uint256", "name": "endTime", "type": "uint256" }, { "internalType": "uint256", "name": "totalVotes", "type": "uint256" }, { "internalType": "address[]", "name": "nftContractAddresses", "type": "address[]" }, { "internalType": "address", "name": "erc20TokenAddress", "type": "address" }, { "internalType": "bool", "name": "isERC20Poll", "type": "bool" }, { "internalType": "uint8", "name": "erc20Decimals", "type": "uint8" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "_user", "type": "address" }, { "internalType": "uint256", "name": "_pollId", "type": "uint256" } ], "name": "getTotalVotesUsed", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "_user", "type": "address" } ], "name": "getUserVotes", "outputs": [ { "components": [ { "internalType": "uint256", "name": "pollId", "type": "uint256" }, { "internalType": "uint256", "name": "optionId", "type": "uint256" }, { "internalType": "uint256", "name": "voteCount", "type": "uint256" } ], "internalType": "struct NFTandERC20Voting.UserVote[]", "name": "", "type": "tuple[]" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "owner", "outputs": [ { "internalType": "address", "name": "", "type": "address" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "", "type": "address" } ], "name": "pollCreators", "outputs": [ { "internalType": "bool", "name": "", "type": "bool" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "name": "polls", "outputs": [ { "internalType": "string", "name": "question", "type": "string" }, { "internalType": "string", "name": "description", "type": "string" }, { "internalType": "uint256", "name": "endTime", "type": "uint256" }, { "internalType": "bool", "name": "isActive", "type": "bool" }, { "internalType": "uint256", "name": "totalVotes", "type": "uint256" }, { "internalType": "address", "name": "erc20TokenAddress", "type": "address" }, { "internalType": "bool", "name": "isERC20Poll", "type": "bool" }, { "internalType": "uint8", "name": "erc20Decimals", "type": "uint8" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "", "type": "address" }, { "internalType": "uint256", "name": "", "type": "uint256" } ], "name": "userVotes", "outputs": [ { "internalType": "uint256", "name": "pollId", "type": "uint256" }, { "internalType": "uint256", "name": "optionId", "type": "uint256" }, { "internalType": "uint256", "name": "voteCount", "type": "uint256" } ], "stateMutability": "view", "type": "function" } ];
const NFT_VOTING_ADDRESS = '0x0d373c81928Ec30c63289ffed3B174a0D50c887b';

const BEAST_TOKEN_ABI = [ { "inputs": [ { "internalType": "address", "name": "initialOwner", "type": "address" } ], "stateMutability": "nonpayable", "type": "constructor" }, { "inputs": [], "name": "ECDSAInvalidSignature", "type": "error" }, { "inputs": [ { "internalType": "uint256", "name": "length", "type": "uint256" } ], "name": "ECDSAInvalidSignatureLength", "type": "error" }, { "inputs": [ { "internalType": "bytes32", "name": "s", "type": "bytes32" } ], "name": "ECDSAInvalidSignatureS", "type": "error" }, { "inputs": [ { "internalType": "address", "name": "spender", "type": "address" }, { "internalType": "uint256", "name": "allowance", "type": "uint256" }, { "internalType": "uint256", "name": "needed", "type": "uint256" } ], "name": "ERC20InsufficientAllowance", "type": "error" }, { "inputs": [ { "internalType": "address", "name": "sender", "type": "address" }, { "internalType": "uint256", "name": "balance", "type": "uint256" }, { "internalType": "uint256", "name": "needed", "type": "uint256" } ], "name": "ERC20InsufficientBalance", "type": "error" }, { "inputs": [ { "internalType": "address", "name": "approver", "type": "address" } ], "name": "ERC20InvalidApprover", "type": "error" }, { "inputs": [ { "internalType": "address", "name": "receiver", "type": "address" } ], "name": "ERC20InvalidReceiver", "type": "error" }, { "inputs": [ { "internalType": "address", "name": "sender", "type": "address" } ], "name": "ERC20InvalidSender", "type": "error" }, { "inputs": [ { "internalType": "address", "name": "spender", "type": "address" } ], "name": "ERC20InvalidSpender", "type": "error" }, { "inputs": [ { "internalType": "uint256", "name": "deadline", "type": "uint256" } ], "name": "ERC2612ExpiredSignature", "type": "error" }, { "inputs": [ { "internalType": "address", "name": "signer", "type": "address" }, { "internalType": "address", "name": "owner", "type": "address" } ], "name": "ERC2612InvalidSigner", "type": "error" }, { "inputs": [], "name": "EnforcedPause", "type": "error" }, { "inputs": [], "name": "ExpectedPause", "type": "error" }, { "inputs": [ { "internalType": "address", "name": "account", "type": "address" }, { "internalType": "uint256", "name": "currentNonce", "type": "uint256" } ], "name": "InvalidAccountNonce", "type": "error" }, { "inputs": [], "name": "InvalidShortString", "type": "error" }, { "inputs": [ { "internalType": "address", "name": "owner", "type": "address" } ], "name": "OwnableInvalidOwner", "type": "error" }, { "inputs": [ { "internalType": "address", "name": "account", "type": "address" } ], "name": "OwnableUnauthorizedAccount", "type": "error" }, { "inputs": [ { "internalType": "string", "name": "str", "type": "string" } ], "name": "StringTooLong", "type": "error" }, { "anonymous": false, "inputs": [ { "indexed": true, "internalType": "address", "name": "owner", "type": "address" }, { "indexed": true, "internalType": "address", "name": "spender", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "value", "type": "uint256" } ], "name": "Approval", "type": "event" }, { "anonymous": false, "inputs": [], "name": "EIP712DomainChanged", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": true, "internalType": "address", "name": "previousOwner", "type": "address" }, { "indexed": true, "internalType": "address", "name": "newOwner", "type": "address" } ], "name": "OwnershipTransferred", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": false, "internalType": "address", "name": "account", "type": "address" } ], "name": "Paused", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": true, "internalType": "address", "name": "from", "type": "address" }, { "indexed": true, "internalType": "address", "name": "to", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "value", "type": "uint256" } ], "name": "Transfer", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": false, "internalType": "address", "name": "account", "type": "address" } ], "name": "Unpaused", "type": "event" }, { "inputs": [], "name": "DOMAIN_SEPARATOR", "outputs": [ { "internalType": "bytes32", "name": "", "type": "bytes32" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "MINT_AMOUNT", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "owner", "type": "address" }, { "internalType": "address", "name": "spender", "type": "address" } ], "name": "allowance", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "spender", "type": "address" }, { "internalType": "uint256", "name": "value", "type": "uint256" } ], "name": "approve", "outputs": [ { "internalType": "bool", "name": "", "type": "bool" } ], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "account", "type": "address" } ], "name": "balanceOf", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "uint256", "name": "value", "type": "uint256" } ], "name": "burn", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "account", "type": "address" }, { "internalType": "uint256", "name": "value", "type": "uint256" } ], "name": "burnFrom", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "decimals", "outputs": [ { "internalType": "uint8", "name": "", "type": "uint8" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "eip712Domain", "outputs": [ { "internalType": "bytes1", "name": "fields", "type": "bytes1" }, { "internalType": "string", "name": "name", "type": "string" }, { "internalType": "string", "name": "version", "type": "string" }, { "internalType": "uint256", "name": "chainId", "type": "uint256" }, { "internalType": "address", "name": "verifyingContract", "type": "address" }, { "internalType": "bytes32", "name": "salt", "type": "bytes32" }, { "internalType": "uint256[]", "name": "extensions", "type": "uint256[]" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "mint", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "name", "outputs": [ { "internalType": "string", "name": "", "type": "string" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "owner", "type": "address" } ], "name": "nonces", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "owner", "outputs": [ { "internalType": "address", "name": "", "type": "address" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "pause", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "paused", "outputs": [ { "internalType": "bool", "name": "", "type": "bool" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "owner", "type": "address" }, { "internalType": "address", "name": "spender", "type": "address" }, { "internalType": "uint256", "name": "value", "type": "uint256" }, { "internalType": "uint256", "name": "deadline", "type": "uint256" }, { "internalType": "uint8", "name": "v", "type": "uint8" }, { "internalType": "bytes32", "name": "r", "type": "bytes32" }, { "internalType": "bytes32", "name": "s", "type": "bytes32" } ], "name": "permit", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "renounceOwnership", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "symbol", "outputs": [ { "internalType": "string", "name": "", "type": "string" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "totalSupply", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "to", "type": "address" }, { "internalType": "uint256", "name": "value", "type": "uint256" } ], "name": "transfer", "outputs": [ { "internalType": "bool", "name": "", "type": "bool" } ], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "from", "type": "address" }, { "internalType": "address", "name": "to", "type": "address" }, { "internalType": "uint256", "name": "value", "type": "uint256" } ], "name": "transferFrom", "outputs": [ { "internalType": "bool", "name": "", "type": "bool" } ], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "newOwner", "type": "address" } ], "name": "transferOwnership", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "unpause", "outputs": [], "stateMutability": "nonpayable", "type": "function" } ];
const BEAST_TOKEN_ADDRESS = '0x6852f7B4ba44667F2Db80E6f3A9f8A173b03cD15';

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
    const [userVotes, setUserVotes] = useState({}); // Ändere von 0 zu {}
    const [availableERC20Votes, setAvailableERC20Votes] = useState(0);
    const [availableNFTVotes, setAvailableNFTVotes] = useState(0);
    const [connectedAccount, setConnectedAccount] = useState(null);
    const [errorMessage, setErrorMessage] = useState('');
    const [timeLeft, setTimeLeft] = useState('');
    const { id: pollId } = useParams();
    const location = useLocation(); // Verwende useLocation
    const [showModal, setShowModal] = useState(false);
    const [modalMessage, setModalMessage] = useState('');
    const [isPollEnded, setIsPollEnded] = useState(false);
    const [beastTokenBalance, setBeastTokenBalance] = useState(0);

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

                    if (storedAccount.toLowerCase() !== currentAccount.toLowerCase()) {
                        setErrorMessage('Das verbundene Konto stimmt nicht mit dem gespeicherten Konto überein. Bitte verbinden Sie das richtige Wallet.');
                    } else {
                        setConnectedAccount(currentAccount);
                        const nftVotingContract = new web3Instance.eth.Contract(NFT_VOTING_ABI, NFT_VOTING_ADDRESS);
                        setContract(nftVotingContract);
                        await fetchPoll(nftVotingContract, currentAccount, web3Instance);
                    }
                } catch (error) {
                    console.error('Fehler bei der Initialisierung von Web3 oder dem Vertrag:', error);
                    setErrorMessage('Fehler bei der Initialisierung von Web3 oder dem Vertrag.');
                }
            } else {
                try {
                    const rpcUrl = getRpcUrl(); // Stelle sicher, dass getRpcUrl() die richtige URL zurückgibt
                    const readOnlyWeb3 = new Web3(rpcUrl);
                    setWeb3(readOnlyWeb3);
                    const readOnlyContract = new readOnlyWeb3.eth.Contract(NFT_VOTING_ABI, NFT_VOTING_ADDRESS);
                    setContract(readOnlyContract);
                    await fetchPoll(readOnlyContract, null, readOnlyWeb3);
                } catch (error) {
                    console.error('Fehler beim Einrichten von Read-Only Web3:', error);
                    setErrorMessage('Fehler beim Einrichten von Read-Only Web3.');
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
                    setIsPollEnded(true);
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

    const fetchPoll = async (contractInstance, account = null, web3Instance) => {
        try {
            const pollData = await contractInstance.methods.getPoll(pollIdInt).call();
            if (pollData) {
                const votes = pollData.votes.map(vote => vote.toString());
                const nftContractAddresses = pollData.nftContractAddresses.map(addr => addr.toLowerCase());

                // Mapping der NFT-Kollektionen nach Adressen
                const addressToCollection = nftCollections.reduce((map, collection) => {
                    map[collection.address.toLowerCase()] = collection;
                    return map;
                }, {});

                // Sammeln von NFT-Daten aus Vertragsadressen
                const nftData = nftContractAddresses.map((address) => {
                    const collection = addressToCollection[address.toLowerCase()];
                    return collection
                        ? {
                            name: collection.name,
                            artist: collection.artist,
                        }
                        : { name: address, artist: '' };
                });

                // Extrahieren eindeutiger Künstlernamen aus nftData
                const uniqueArtists = [...new Set(nftData.map((item) => item.artist).filter(Boolean))];

                // Bestimmen des artistName basierend auf der Anzahl eindeutiger Künstler
                let artistNameFromPoll;
                if (pollData.isERC20Poll) {
                    artistNameFromPoll = 'BEAST-VOTING';
                } else if (uniqueArtists.length > 1) {
                    artistNameFromPoll = 'FRACTALZ';
                } else {
                    artistNameFromPoll = uniqueArtists[0] || 'PROJECT-VOTING';
                }

                // Bestimme artistName korrekt
                // In deinem Code hattest du 'artistNameFromPoll.toLowerCase() === artistNameFromPoll.toLowerCase()', was immer true ist.
                // Korrigiere es zu 'artistNameFromPoll.toLowerCase() === artistName.toLowerCase()'

                if (location.pathname.includes('/fairvote') || artistNameFromPoll.toLowerCase() === artistName.toLowerCase()) { // Korrigierte Bedingung
                    const endTime = parseInt(pollData.endTime);
                    const isActive = pollData.isActive;
                    const currentTime = Math.floor(Date.now() / 1000);

                    const status = isActive && currentTime < endTime ? 'Live' : 'Expired';

                    setPoll({
                        id: pollIdInt,
                        ...pollData,
                        votes,
                        nftData,
                        artistName: artistNameFromPoll,
                        status
                    });

                    if (account) {
                        await fetchUserVotes(contractInstance, account);
                        await fetchAvailableVotes(contractInstance, account, pollData.isERC20Poll, web3Instance);
                    }
                }
            }
        } catch (error) {
            console.error(`Fehler beim Laden der Umfrage mit ID ${pollIdInt}:`, error);
        }
    };

    const fetchUserVotes = async (contract, account) => {
        try {
            const userVotesData = await contract.methods.getUserVotes(account).call();
            const votesForPoll = userVotesData.filter(vote => vote.pollId.toString() === pollIdInt.toString());

            const votesMap = votesForPoll.reduce((acc, vote) => {
                acc[vote.optionId] = (acc[vote.optionId] || 0) + parseInt(vote.voteCount);
                return acc;
            }, {});

            setUserVotes(votesMap);
        } catch (error) {
            console.error('Error getting user vote:', error);
        }
    };

    const fetchAvailableVotes = async (contract, account, isERC20Poll, web3Instance) => {
        try {
            if (isERC20Poll) {
                const beastTokenContract = new web3Instance.eth.Contract(BEAST_TOKEN_ABI, BEAST_TOKEN_ADDRESS);
                const balance = await beastTokenContract.methods.balanceOf(account).call();
                const decimals = await beastTokenContract.methods.decimals().call();
    
                // Konvertiere balance und decimals explizit zu Number
                const balanceNumber = Number(balance);
                const decimalsNumber = Number(decimals);
                const adjustedBalance = balanceNumber / Math.pow(10, decimalsNumber);
    
                console.log(`ERC20 Balance: ${balanceNumber}, Decimals: ${decimalsNumber}, Adjusted Balance: ${adjustedBalance}`);
                setAvailableERC20Votes(adjustedBalance);
                setBeastTokenBalance(adjustedBalance);
            } else {
                const nftBalance = await contract.methods.getNFTBalance(account, pollIdInt).call();
    
                // Konvertiere nftBalance explizit zu Number
                const nftBalanceNumber = Number(nftBalance);
                console.log(`NFT Balance: ${nftBalanceNumber}`);
                setAvailableNFTVotes(nftBalanceNumber);
            }
        } catch (error) {
            console.error('Error getting available votes:', error);
        }
    };
    

    const handleVote = async () => {
        if (!contract || !connectedAccount) {
            setModalMessage('Wallet not connected or authorized');
            setShowModal(true);
            return;
        }
        try {
            // Bereite die Methode und Parameter vor
            const method = contract.methods.vote(pollIdInt, selectedOption, voteCount);
            const params = {}; // Zusätzliche Parameter falls nötig

            // Rufe die Gasabschätzung auf
            const { gasEstimate, gasPrice } = await getGasEstimate(web3, method, params, connectedAccount);

            // Sende die Transaktion mit geschätztem Gas und Gaspreis
            const receipt = await method.send({
                from: connectedAccount,
                gas: gasEstimate,
                gasPrice: gasPrice
            });

            console.log('Transaction:', receipt);
            if (receipt.status) {
                setModalMessage('Vote submitted successfully!');
                setShowModal(true);
                await fetchPoll(contract, connectedAccount, web3);
            } else {
                throw new Error('Transaction failed');
            }
        } catch (error) {
            console.error('Error voting:', error);
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
            // Bereite die Methode und Parameter vor
            const method = contract.methods.removeVote(pollIdInt, selectedOption, voteCount);
            const params = {}; // Zusätzliche Parameter falls nötig

            // Rufe die Gasabschätzung auf
            const { gasEstimate, gasPrice } = await getGasEstimate(web3, method, params, connectedAccount);

            // Sende die Transaktion mit geschätzten Gasgebühren
            const receipt = await method.send({
                from: connectedAccount,
                gas: gasEstimate,
                gasPrice: gasPrice
            });

            console.log('Transaction:', receipt);
            if (receipt.status) {
                setModalMessage('Vote removed successfully!');
                setShowModal(true);
                await fetchPoll(contract, connectedAccount, web3);
            } else {
                throw new Error('Transaction failed');
            }
        } catch (error) {
            console.error('Error removing vote:', error);
            setModalMessage('Error removing vote');
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
                await fetchPoll(nftVotingContract, account, web3Instance);

                // Entferne das erneute Laden der Seite
                // window.location.reload();

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
            // Dieser Fehlercode bedeutet, dass die Chain nicht zu MetaMask hinzugefügt wurde.
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

    // Aufbereiten der NFT-Daten
    const nftData = poll && Array.isArray(poll.nftContractAddresses) 
        ? poll.nftContractAddresses.map(address => {
            const collection = nftCollections.find(c => c.address.toLowerCase() === address.toLowerCase());
            return collection ? {
                name: collection.name,
                link: `/collections/${address}`,
                artist: collection.artist
            } : { name: address, link: '#', artist: '' };
        }) 
        : [];

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

    // Berechne remainingVotes hier, nachdem poll geprüft wurde
    const remainingVotes = poll.isERC20Poll 
        ? availableERC20Votes - Object.values(userVotes).reduce((acc, val) => acc + val, 0)
        : availableNFTVotes - Object.values(userVotes).reduce((acc, val) => acc + val, 0);

    return (
        <div className="poll-details-container column">
            <div className='centered mb15'><h2>{timeLeft}</h2></div>
            
            {poll.isERC20Poll ? (
                <div>
                    <h3>VOTING AVAILABLE FOR:</h3>
                    <div className='flex center-ho'>
                                              <img src='/crown.png' className='h20px mr5'></img>
                                              <span className="erc20-voting-label s14 gold">BEAST TOKEN HOLDERS</span>
                                              </div>
                </div>
            ) : (
                <div>
                    <h3>VOTING AVAILABLE FOR:</h3>
                    <div className="nft-contract-addresses mb15 mt0">
                        {Array.isArray(nftData) && nftData.map((nft, index) => (
                            <div className='column flex VisibleLink fit-content' key={index}>
                                <span className='grey'> {artistName}</span>
                                <a href={nft.link} target="_blank" rel="noopener noreferrer">{nft.name}</a>
                            </div>
                        ))}
                    </div>
                </div>
            )}
            
            <div className='mt10 mb10'>
                <span className='grey'>Description</span>
                <p className='mb0 mt0'>{poll.description}</p>
            </div>
            <div className='flex center-ho mt5 space-between'>
                <div>
                    <span className='grey'>Question</span>
                    <h2 className="poll-question-1 mt0 mb0">{poll.question}</h2>
                </div>
                <div>
                    AVAILABLE VOTES: {poll.isERC20Poll 
                        ? `${remainingVotes} / ${availableERC20Votes}` 
                        : `${remainingVotes} / ${availableNFTVotes}`}
                </div>
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