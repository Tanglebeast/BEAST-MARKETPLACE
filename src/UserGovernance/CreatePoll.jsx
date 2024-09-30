import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import NftCollectionSelector from './SelectPollCollections';
import '../styles/CreatePollOverlay.css'
import { CONTRACT_OWNER_ADDRESS, getGasEstimate } from '../components/utils';

const web3 = new Web3(window.ethereum);

const CONTRACT_ADDRESS = '0x0d373c81928Ec30c63289ffed3B174a0D50c887b';
const NFTVotingABI = [ { "inputs": [ { "internalType": "address", "name": "_creator", "type": "address" } ], "name": "addPollCreator", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "string", "name": "_question", "type": "string" }, { "internalType": "string", "name": "_description", "type": "string" }, { "internalType": "string[]", "name": "_options", "type": "string[]" }, { "internalType": "uint256", "name": "_durationInHours", "type": "uint256" } ], "name": "createERC20Poll", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "string", "name": "_question", "type": "string" }, { "internalType": "string", "name": "_description", "type": "string" }, { "internalType": "string[]", "name": "_options", "type": "string[]" }, { "internalType": "uint256", "name": "_durationInHours", "type": "uint256" }, { "internalType": "address[]", "name": "_nftContractAddresses", "type": "address[]" } ], "name": "createNFTPoll", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "stateMutability": "nonpayable", "type": "constructor" }, { "inputs": [ { "internalType": "address", "name": "owner", "type": "address" } ], "name": "OwnableInvalidOwner", "type": "error" }, { "inputs": [ { "internalType": "address", "name": "account", "type": "address" } ], "name": "OwnableUnauthorizedAccount", "type": "error" }, { "anonymous": false, "inputs": [ { "indexed": true, "internalType": "address", "name": "previousOwner", "type": "address" }, { "indexed": true, "internalType": "address", "name": "newOwner", "type": "address" } ], "name": "OwnershipTransferred", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": false, "internalType": "uint256", "name": "pollId", "type": "uint256" }, { "indexed": false, "internalType": "string", "name": "question", "type": "string" }, { "indexed": false, "internalType": "string", "name": "description", "type": "string" }, { "indexed": false, "internalType": "string[]", "name": "options", "type": "string[]" }, { "indexed": false, "internalType": "uint256", "name": "endTime", "type": "uint256" }, { "indexed": false, "internalType": "address[]", "name": "nftContractAddresses", "type": "address[]" }, { "indexed": false, "internalType": "address", "name": "erc20TokenAddress", "type": "address" }, { "indexed": false, "internalType": "bool", "name": "isERC20Poll", "type": "bool" } ], "name": "PollCreated", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": true, "internalType": "address", "name": "creator", "type": "address" } ], "name": "PollCreatorAdded", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": true, "internalType": "address", "name": "creator", "type": "address" } ], "name": "PollCreatorRemoved", "type": "event" }, { "inputs": [ { "internalType": "address", "name": "_creator", "type": "address" } ], "name": "removePollCreator", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "uint256", "name": "_pollId", "type": "uint256" }, { "internalType": "uint256", "name": "_optionId", "type": "uint256" }, { "internalType": "uint256", "name": "_voteCount", "type": "uint256" } ], "name": "removeVote", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "renounceOwnership", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "newOwner", "type": "address" } ], "name": "transferOwnership", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "uint256", "name": "_pollId", "type": "uint256" }, { "internalType": "uint256", "name": "_optionId", "type": "uint256" }, { "internalType": "uint256", "name": "_voteCount", "type": "uint256" } ], "name": "vote", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "anonymous": false, "inputs": [ { "indexed": true, "internalType": "address", "name": "user", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "pollId", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "optionId", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "voteCount", "type": "uint256" } ], "name": "VoteRemoved", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": true, "internalType": "address", "name": "user", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "pollId", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "optionId", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "voteCount", "type": "uint256" } ], "name": "Voted", "type": "event" }, { "inputs": [], "name": "ERC20_TOKEN_ADDRESS", "outputs": [ { "internalType": "address", "name": "", "type": "address" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "_user", "type": "address" }, { "internalType": "uint256", "name": "_pollId", "type": "uint256" } ], "name": "getNFTBalance", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "uint256", "name": "_pollId", "type": "uint256" } ], "name": "getPoll", "outputs": [ { "internalType": "string", "name": "question", "type": "string" }, { "internalType": "string", "name": "description", "type": "string" }, { "internalType": "string[]", "name": "options", "type": "string[]" }, { "internalType": "uint256[]", "name": "votes", "type": "uint256[]" }, { "internalType": "bool", "name": "isActive", "type": "bool" }, { "internalType": "uint256", "name": "endTime", "type": "uint256" }, { "internalType": "uint256", "name": "totalVotes", "type": "uint256" }, { "internalType": "address[]", "name": "nftContractAddresses", "type": "address[]" }, { "internalType": "address", "name": "erc20TokenAddress", "type": "address" }, { "internalType": "bool", "name": "isERC20Poll", "type": "bool" }, { "internalType": "uint8", "name": "erc20Decimals", "type": "uint8" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "_user", "type": "address" }, { "internalType": "uint256", "name": "_pollId", "type": "uint256" } ], "name": "getTotalVotesUsed", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "_user", "type": "address" } ], "name": "getUserVotes", "outputs": [ { "components": [ { "internalType": "uint256", "name": "pollId", "type": "uint256" }, { "internalType": "uint256", "name": "optionId", "type": "uint256" }, { "internalType": "uint256", "name": "voteCount", "type": "uint256" } ], "internalType": "struct NFTandERC20Voting.UserVote[]", "name": "", "type": "tuple[]" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "owner", "outputs": [ { "internalType": "address", "name": "", "type": "address" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "", "type": "address" } ], "name": "pollCreators", "outputs": [ { "internalType": "bool", "name": "", "type": "bool" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "name": "polls", "outputs": [ { "internalType": "string", "name": "question", "type": "string" }, { "internalType": "string", "name": "description", "type": "string" }, { "internalType": "uint256", "name": "endTime", "type": "uint256" }, { "internalType": "bool", "name": "isActive", "type": "bool" }, { "internalType": "uint256", "name": "totalVotes", "type": "uint256" }, { "internalType": "address", "name": "erc20TokenAddress", "type": "address" }, { "internalType": "bool", "name": "isERC20Poll", "type": "bool" }, { "internalType": "uint8", "name": "erc20Decimals", "type": "uint8" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "", "type": "address" }, { "internalType": "uint256", "name": "", "type": "uint256" } ], "name": "userVotes", "outputs": [ { "internalType": "uint256", "name": "pollId", "type": "uint256" }, { "internalType": "uint256", "name": "optionId", "type": "uint256" }, { "internalType": "uint256", "name": "voteCount", "type": "uint256" } ], "stateMutability": "view", "type": "function" } ];

const CreatePoll = ({ onClose }) => {
    const [question, setQuestion] = useState('');
    const [description, setDescription] = useState('');
    const [options, setOptions] = useState(['']);
    const [duration, setDuration] = useState(1);
    const [nftAddresses, setNftAddresses] = useState([]);
    const [endDateTime, setEndDateTime] = useState('');
    const [isSelectorOpen, setIsSelectorOpen] = useState(false);
    const [isOwner, setIsOwner] = useState(false);
    const [newCreatorAddress, setNewCreatorAddress] = useState('');
    const [removeCreatorAddress, setRemoveCreatorAddress] = useState('');
    const [pollType, setPollType] = useState('NFT'); // Neuer Zustand für den Umfragetyp
  
    useEffect(() => {
      const checkOwnership = async () => {
        const accounts = await web3.eth.getAccounts();
        const owner = await getContractOwner();
        setIsOwner(accounts[0].toLowerCase() === owner.toLowerCase());
      };
      checkOwnership();
    }, []);
  
    const getContractOwner = async () => {
      const contract = new web3.eth.Contract(NFTVotingABI, CONTRACT_ADDRESS);
      return await contract.methods.owner().call();
    };
  
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
      
        if (!question || !description || options.length === 0) {
          alert('Bitte fülle alle Felder aus.');
          return;
        }
      
        const calculatedDuration = calculateDurationInHours();
        if (calculatedDuration === null) return;
      
        const accounts = await web3.eth.getAccounts();
        const contract = new web3.eth.Contract(NFTVotingABI, CONTRACT_ADDRESS);
      
        try {
          let method;
      
          if (pollType === 'NFT') {
            if (nftAddresses.length === 0) {
              alert('Bitte füge mindestens eine NFT-Adresse hinzu.');
              return;
            }
      
            const filteredAddresses = nftAddresses.filter(address => web3.utils.isAddress(address));
      
            if (filteredAddresses.length === 0) {
              alert('Bitte füge gültige NFT-Adressen hinzu.');
              return;
            }
      
            // Ändern Sie hier 'createPoll' zu 'createNFTPoll'
            method = contract.methods.createNFTPoll(
              question,
              description,
              options,
              calculatedDuration,
              filteredAddresses
            );
          } else if (pollType === 'ERC20') {
            method = contract.methods.createERC20Poll(
              question,
              description,
              options,
              calculatedDuration
            );
          }
      
          // Gasabschätzung aufrufen
          const { gasEstimate, gasPrice } = await getGasEstimate(web3, method, {}, accounts[0]);
      
          // Transaktion senden
          await method.send({
            from: accounts[0],
            gas: gasEstimate,
            gasPrice: gasPrice
          });
      
          alert('Umfrage erstellt!');
          onClose();
        } catch (error) {
          console.error(error);
          alert('Fehler beim Erstellen der Umfrage.');
        }
      };
      
  
    const addPollCreator = async () => {
      if (!web3.utils.isAddress(newCreatorAddress)) {
        alert('Ungültige Ethereum-Adresse');
        return;
      }
  
      const accounts = await web3.eth.getAccounts();
      const contract = new web3.eth.Contract(NFTVotingABI, CONTRACT_ADDRESS);
  
      try {
        const method = contract.methods.addPollCreator(newCreatorAddress);
        const params = {};
  
        const { gasEstimate, gasPrice } = await getGasEstimate(method, {}, accounts[0]);

  
        await method.send({
          from: accounts[0],
          gas: gasEstimate,
          gasPrice: gasPrice
        });
  
        alert('Neuer Poll-Ersteller hinzugefügt!');
        setNewCreatorAddress('');
      } catch (error) {
        console.error(error);
        alert('Fehler beim Hinzufügen des Poll-Erstellers.');
      }
    };
  
    const removePollCreator = async () => {
      if (!web3.utils.isAddress(removeCreatorAddress)) {
        alert('Ungültige Ethereum-Adresse');
        return;
      }
  
      const accounts = await web3.eth.getAccounts();
      const contract = new web3.eth.Contract(NFTVotingABI, CONTRACT_ADDRESS);
  
      try {
        const method = contract.methods.removePollCreator(removeCreatorAddress);
        const params = {};
  
        const { gasEstimate, gasPrice } = await getGasEstimate(web3, method, params, accounts[0]);
  
        await method.send({
          from: accounts[0],
          gas: gasEstimate,
          gasPrice: gasPrice
        });
  
        alert('Poll-Ersteller entfernt!');
        setRemoveCreatorAddress('');
      } catch (error) {
        console.error(error);
        alert('Fehler beim Entfernen des Poll-Erstellers.');
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
                <div key={index} className='flex'>
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
            {pollType === 'NFT' && (
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
            )}
            {/* Auswahl des Umfragetypes */}
            {isOwner && (
              <div>
                <label className="popup-form-label text-align-left">Poll Type</label>
                <select
                  className="popup-form-input"
                  value={pollType}
                  onChange={(e) => setPollType(e.target.value)}
                >
                  <option value="NFT">NFT</option>
                  <option value="ERC20">ERC20</option>
                </select>
              </div>
            )}
            <button className="actionbutton" type="submit">
              Create Poll
            </button>
          </form>
          {isOwner && (
            <div className="owner-functions mt50">
              <h3>Add / Remove Artists</h3>
              <div>
                <label className="popup-form-label">Add Artist</label>
                <input
                  className="popup-form-input"
                  type="text"
                  value={newCreatorAddress}
                  onChange={(e) => setNewCreatorAddress(e.target.value)}
                  placeholder="Wallet Address"
                />
                <button className="actionbutton" onClick={addPollCreator}>
                  Add
                </button>
              </div>
              <div>
                <label className="popup-form-label mt10">Remove Artist</label>
                <input
                  className="popup-form-input"
                  type="text"
                  value={removeCreatorAddress}
                  onChange={(e) => setRemoveCreatorAddress(e.target.value)}
                  placeholder="Wallet Address"
                />
                <button className="actionbutton red" onClick={removePollCreator}>
                  Remove
                </button>
              </div>
            </div>
          )}
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