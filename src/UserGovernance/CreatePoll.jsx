import React, { useState } from 'react';
import Web3 from 'web3';
import NftCollectionSelector from './SelectPollCollections';
import '../styles/CreatePollOverlay.css'

const web3 = new Web3(window.ethereum);

const CONTRACT_ADDRESS = '0x26d2F2B120e9841B76f195bE6788397215a09137';
const NFTVotingABI = [ { "inputs": [ { "internalType": "string", "name": "_question", "type": "string" }, { "internalType": "string", "name": "_description", "type": "string" }, { "internalType": "string[]", "name": "_options", "type": "string[]" }, { "internalType": "uint256", "name": "_durationInHours", "type": "uint256" }, { "internalType": "address[]", "name": "_nftContractAddresses", "type": "address[]" } ], "name": "createPoll", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "uint256", "name": "_pollId", "type": "uint256" } ], "name": "endPoll", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "stateMutability": "nonpayable", "type": "constructor" }, { "inputs": [ { "internalType": "address", "name": "owner", "type": "address" } ], "name": "OwnableInvalidOwner", "type": "error" }, { "inputs": [ { "internalType": "address", "name": "account", "type": "address" } ], "name": "OwnableUnauthorizedAccount", "type": "error" }, { "anonymous": false, "inputs": [ { "indexed": true, "internalType": "address", "name": "previousOwner", "type": "address" }, { "indexed": true, "internalType": "address", "name": "newOwner", "type": "address" } ], "name": "OwnershipTransferred", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": false, "internalType": "uint256", "name": "pollId", "type": "uint256" }, { "indexed": false, "internalType": "string", "name": "question", "type": "string" }, { "indexed": false, "internalType": "string", "name": "description", "type": "string" }, { "indexed": false, "internalType": "string[]", "name": "options", "type": "string[]" }, { "indexed": false, "internalType": "uint256", "name": "endTime", "type": "uint256" }, { "indexed": false, "internalType": "address[]", "name": "nftContractAddresses", "type": "address[]" } ], "name": "PollCreated", "type": "event" }, { "inputs": [ { "internalType": "uint256", "name": "_pollId", "type": "uint256" }, { "internalType": "uint256", "name": "_optionId", "type": "uint256" }, { "internalType": "uint256", "name": "_voteCount", "type": "uint256" } ], "name": "removeVote", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "renounceOwnership", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "newOwner", "type": "address" } ], "name": "transferOwnership", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "uint256", "name": "_pollId", "type": "uint256" }, { "internalType": "uint256", "name": "_optionId", "type": "uint256" }, { "internalType": "uint256", "name": "_voteCount", "type": "uint256" } ], "name": "vote", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "anonymous": false, "inputs": [ { "indexed": true, "internalType": "address", "name": "user", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "pollId", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "optionId", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "voteCount", "type": "uint256" } ], "name": "VoteRemoved", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": true, "internalType": "address", "name": "user", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "pollId", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "optionId", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "voteCount", "type": "uint256" } ], "name": "Voted", "type": "event" }, { "inputs": [ { "internalType": "address", "name": "_user", "type": "address" }, { "internalType": "uint256", "name": "_pollId", "type": "uint256" } ], "name": "getNFTBalance", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "uint256", "name": "_pollId", "type": "uint256" } ], "name": "getPoll", "outputs": [ { "internalType": "string", "name": "question", "type": "string" }, { "internalType": "string", "name": "description", "type": "string" }, { "internalType": "string[]", "name": "options", "type": "string[]" }, { "internalType": "uint256[]", "name": "votes", "type": "uint256[]" }, { "internalType": "bool", "name": "isActive", "type": "bool" }, { "internalType": "uint256", "name": "endTime", "type": "uint256" }, { "internalType": "uint256", "name": "totalVotes", "type": "uint256" }, { "internalType": "address[]", "name": "nftContractAddresses", "type": "address[]" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "_user", "type": "address" }, { "internalType": "uint256", "name": "_pollId", "type": "uint256" } ], "name": "getTotalVotesUsed", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "_user", "type": "address" } ], "name": "getUserVotes", "outputs": [ { "components": [ { "internalType": "uint256", "name": "pollId", "type": "uint256" }, { "internalType": "uint256", "name": "optionId", "type": "uint256" }, { "internalType": "uint256", "name": "voteCount", "type": "uint256" } ], "internalType": "struct NFTVoting.UserVote[]", "name": "", "type": "tuple[]" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "owner", "outputs": [ { "internalType": "address", "name": "", "type": "address" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "name": "polls", "outputs": [ { "internalType": "string", "name": "question", "type": "string" }, { "internalType": "string", "name": "description", "type": "string" }, { "internalType": "uint256", "name": "endTime", "type": "uint256" }, { "internalType": "bool", "name": "isActive", "type": "bool" }, { "internalType": "uint256", "name": "totalVotes", "type": "uint256" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "", "type": "address" }, { "internalType": "uint256", "name": "", "type": "uint256" } ], "name": "userVotes", "outputs": [ { "internalType": "uint256", "name": "pollId", "type": "uint256" }, { "internalType": "uint256", "name": "optionId", "type": "uint256" }, { "internalType": "uint256", "name": "voteCount", "type": "uint256" } ], "stateMutability": "view", "type": "function" } ];

const CreatePoll = ({ onClose }) => {
    const [question, setQuestion] = useState('');
    const [description, setDescription] = useState('');
    const [options, setOptions] = useState(['']);
    const [duration, setDuration] = useState(1); // Initial value for duration in hours
    const [nftAddresses, setNftAddresses] = useState([]);
    const [endDateTime, setEndDateTime] = useState('');
    const [isSelectorOpen, setIsSelectorOpen] = useState(false);

    const handleOptionChange = (index, value) => {
        const newOptions = [...options];
        newOptions[index] = value;
        setOptions(newOptions);
    };

    const openSelector = () => {
        setIsSelectorOpen(true);
    };

    const closeSelector = () => {
        setIsSelectorOpen(false);
    };

    const handleNftAddressChange = (addresses) => {
        setNftAddresses(addresses);
    };

    const addOption = () => {
        setOptions([...options, '']);
    };

    const removeOption = (index) => {
        if (options.length > 1) {
            const newOptions = options.filter((_, i) => i !== index);
            setOptions(newOptions);
        }
    };

    const addNftAddress = () => {
        setNftAddresses([...nftAddresses, '']);
    };

    const removeNftAddress = (index) => {
        if (nftAddresses.length > 1) {
            const newAddresses = nftAddresses.filter((_, i) => i !== index);
            setNftAddresses(newAddresses);
        }
    };

    const calculateDurationInHours = () => {
        if (!endDateTime) return duration; 

        const endTime = new Date(endDateTime).getTime();
        const currentTime = new Date().getTime();

        if (endTime <= currentTime) {
            alert('Das Enddatum und die Uhrzeit müssen in der Zukunft liegen.');
            return null;
        }

        const durationInMs = endTime - currentTime;
        const durationInHours = Math.ceil(durationInMs / (1000 * 60 * 60));
        return durationInHours;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!question || !description || options.length === 0 || nftAddresses.length === 0) {
            alert('Bitte fülle alle Felder aus.');
            return;
        }

        const filteredAddresses = nftAddresses.filter(address => web3.utils.isAddress(address));

        if (filteredAddresses.length === 0) {
            alert('Bitte füge gültige NFT-Adressen hinzu.');
            return;
        }

        const calculatedDuration = calculateDurationInHours();
        if (calculatedDuration === null) return;

        const accounts = await web3.eth.getAccounts();
        const contract = new web3.eth.Contract(NFTVotingABI, CONTRACT_ADDRESS);

        try {
            await contract.methods.createPoll(
                question,
                description,
                options,
                calculatedDuration,
                filteredAddresses
            ).send({
                from: accounts[0],
                gas: 5000000,
                gasPrice: '20000000000'
            });
            alert('Umfrage erstellt!');
            onClose();
        } catch (error) {
            console.error(error);
            alert('Fehler beim Erstellen der Umfrage.');
        }
    };

    return (
        <div className="popup-overlay-Poll">
            <div className="popup-content-Poll">
                <button className="close-button" onClick={onClose}>X</button>
                <h2 className="create-poll-title">Create a Poll</h2>
                <form onSubmit={handleSubmit}>
                    <div>
                        <label className="popup-form-label text-align-left">Question</label>
                        <input
                            className="popup-form-input"
                            type="text"
                            value={question}
                            onChange={(e) => setQuestion(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label className="popup-form-label text-align-left">Description</label>
                        <textarea
                            className="popup-form-textarea"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label className="popup-form-label text-align-left">Options</label>
                        {options.map((option, index) => (
                            <div>
                            <div className='flex' key={index}>
                                <input
                                    className="popup-form-input"
                                    type="text"
                                    value={option}
                                    onChange={(e) => handleOptionChange(index, e.target.value)}
                                    required
                                />
                                {index > 0 && (
                                    <button
                                        className="popup-form-button remove-option-button"
                                        type="button"
                                        onClick={() => removeOption(index)}
                                    >
                                        Remove
                                    </button>
                                )}
                                {index === options.length - 1 && (
                                    <button
                                        className="popup-form-button add-option-button"
                                        type="button"
                                        onClick={addOption}
                                    >
                                        Add
                                    </button>
                                )}
                            </div>
                            </div>
                        ))}
                    </div>
                    <div>
                        <label className="popup-form-label text-align-left">Enddate and time</label>
                        <input
                            className="popup-form-input"
                            type="datetime-local"
                            value={endDateTime}
                            onChange={(e) => setEndDateTime(e.target.value)}
                        />
                    </div>
                    <div className='flex column'>
                        <label className="popup-form-label text-align-left">Collections</label>
                        <button
                            className="popup-form-button mb10 add-option-button fit-content"
                            type="button"
                            onClick={openSelector}
                        >
                            Add Collections
                        </button>
                        {nftAddresses.length > 0 && (
                            <ul>
                                {nftAddresses.map((address, index) => (
                                    <li key={index}>
                                        {address}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                    <button className="actionbutton" type="submit">
                        Create Poll
                    </button>
                </form>
                {isSelectorOpen && (
                    <NftCollectionSelector
                        onClose={closeSelector}
                        onSelect={handleNftAddressChange}
                        selectedAddresses={nftAddresses}
                    />
                )}
            </div>
        </div>
    );
};

export default CreatePoll;