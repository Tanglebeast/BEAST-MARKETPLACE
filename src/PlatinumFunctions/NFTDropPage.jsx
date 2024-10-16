import React, { useState, useEffect } from 'react';
import BigNumber from 'bignumber.js';
import '../styles/NFTDropPage.css';
import { web3OnlyRead } from '../components/utils';
import Platinumbenefits from './PlatinumBenefits';
import PlatinumFaq from './PlatinumFaq';
// Falls Sie das Icon verwenden
// import CurrencyIotaIcon from '../Assets/currency-iota';

const NFTDropPage = ({ account, web3 }) => {
  const [contract, setContract] = useState(null);
  const [mintPrice, setMintPrice] = useState('0');
  const [totalSupply, setTotalSupply] = useState(0);
  const [maxSupply, setMaxSupply] = useState(100);
  const [mintQuantity, setMintQuantity] = useState(1);
  const [message, setMessage] = useState('');

  const contractAddress = '0x2a145839F09A447e462532Cb5D44123503384320'; // Replace with your contract address
  const abi = [ { "inputs": [ { "internalType": "address", "name": "to", "type": "address" }, { "internalType": "uint256", "name": "tokenId", "type": "uint256" } ], "name": "approve", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "address[]", "name": "recipients", "type": "address[]" }, { "internalType": "uint256[]", "name": "tokenIds", "type": "uint256[]" } ], "name": "batchTransfer", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "address payable", "name": "_paymentWallet", "type": "address" }, { "internalType": "uint256", "name": "_initialMintPrice", "type": "uint256" }, { "internalType": "uint256", "name": "_ownerShare", "type": "uint256" } ], "stateMutability": "nonpayable", "type": "constructor" }, { "inputs": [], "name": "ERC721EnumerableForbiddenBatchMint", "type": "error" }, { "inputs": [ { "internalType": "address", "name": "sender", "type": "address" }, { "internalType": "uint256", "name": "tokenId", "type": "uint256" }, { "internalType": "address", "name": "owner", "type": "address" } ], "name": "ERC721IncorrectOwner", "type": "error" }, { "inputs": [ { "internalType": "address", "name": "operator", "type": "address" }, { "internalType": "uint256", "name": "tokenId", "type": "uint256" } ], "name": "ERC721InsufficientApproval", "type": "error" }, { "inputs": [ { "internalType": "address", "name": "approver", "type": "address" } ], "name": "ERC721InvalidApprover", "type": "error" }, { "inputs": [ { "internalType": "address", "name": "operator", "type": "address" } ], "name": "ERC721InvalidOperator", "type": "error" }, { "inputs": [ { "internalType": "address", "name": "owner", "type": "address" } ], "name": "ERC721InvalidOwner", "type": "error" }, { "inputs": [ { "internalType": "address", "name": "receiver", "type": "address" } ], "name": "ERC721InvalidReceiver", "type": "error" }, { "inputs": [ { "internalType": "address", "name": "sender", "type": "address" } ], "name": "ERC721InvalidSender", "type": "error" }, { "inputs": [ { "internalType": "uint256", "name": "tokenId", "type": "uint256" } ], "name": "ERC721NonexistentToken", "type": "error" }, { "inputs": [ { "internalType": "address", "name": "owner", "type": "address" }, { "internalType": "uint256", "name": "index", "type": "uint256" } ], "name": "ERC721OutOfBoundsIndex", "type": "error" }, { "inputs": [ { "internalType": "uint256", "name": "quantity", "type": "uint256" } ], "name": "mint", "outputs": [], "stateMutability": "payable", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "owner", "type": "address" } ], "name": "OwnableInvalidOwner", "type": "error" }, { "inputs": [ { "internalType": "address", "name": "account", "type": "address" } ], "name": "OwnableUnauthorizedAccount", "type": "error" }, { "anonymous": false, "inputs": [ { "indexed": true, "internalType": "address", "name": "owner", "type": "address" }, { "indexed": true, "internalType": "address", "name": "approved", "type": "address" }, { "indexed": true, "internalType": "uint256", "name": "tokenId", "type": "uint256" } ], "name": "Approval", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": true, "internalType": "address", "name": "owner", "type": "address" }, { "indexed": true, "internalType": "address", "name": "operator", "type": "address" }, { "indexed": false, "internalType": "bool", "name": "approved", "type": "bool" } ], "name": "ApprovalForAll", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": true, "internalType": "address", "name": "previousOwner", "type": "address" }, { "indexed": true, "internalType": "address", "name": "newOwner", "type": "address" } ], "name": "OwnershipTransferred", "type": "event" }, { "inputs": [], "name": "pause", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "anonymous": false, "inputs": [ { "indexed": false, "internalType": "address", "name": "account", "type": "address" } ], "name": "Paused", "type": "event" }, { "inputs": [], "name": "renounceOwnership", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "from", "type": "address" }, { "internalType": "address", "name": "to", "type": "address" }, { "internalType": "uint256", "name": "tokenId", "type": "uint256" } ], "name": "safeTransferFrom", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "from", "type": "address" }, { "internalType": "address", "name": "to", "type": "address" }, { "internalType": "uint256", "name": "tokenId", "type": "uint256" }, { "internalType": "bytes", "name": "data", "type": "bytes" } ], "name": "safeTransferFrom", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "operator", "type": "address" }, { "internalType": "bool", "name": "approved", "type": "bool" } ], "name": "setApprovalForAll", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "uint256", "name": "_price", "type": "uint256" } ], "name": "setMintPrice", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "uint256", "name": "_share", "type": "uint256" } ], "name": "setOwnerShare", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "address payable", "name": "_wallet", "type": "address" } ], "name": "setPaymentWallet", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "anonymous": false, "inputs": [ { "indexed": true, "internalType": "address", "name": "from", "type": "address" }, { "indexed": true, "internalType": "address", "name": "to", "type": "address" }, { "indexed": true, "internalType": "uint256", "name": "tokenId", "type": "uint256" } ], "name": "Transfer", "type": "event" }, { "inputs": [ { "internalType": "address", "name": "from", "type": "address" }, { "internalType": "address", "name": "to", "type": "address" }, { "internalType": "uint256", "name": "tokenId", "type": "uint256" } ], "name": "transferFrom", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "newOwner", "type": "address" } ], "name": "transferOwnership", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "unpause", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "anonymous": false, "inputs": [ { "indexed": false, "internalType": "address", "name": "account", "type": "address" } ], "name": "Unpaused", "type": "event" }, { "inputs": [ { "internalType": "address", "name": "owner", "type": "address" } ], "name": "balanceOf", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "uint256", "name": "tokenId", "type": "uint256" } ], "name": "getApproved", "outputs": [ { "internalType": "address", "name": "", "type": "address" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "owner", "type": "address" }, { "internalType": "address", "name": "operator", "type": "address" } ], "name": "isApprovedForAll", "outputs": [ { "internalType": "bool", "name": "", "type": "bool" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "MAX_SUPPLY", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "mintPrice", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "name", "outputs": [ { "internalType": "string", "name": "", "type": "string" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "owner", "outputs": [ { "internalType": "address", "name": "", "type": "address" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "uint256", "name": "tokenId", "type": "uint256" } ], "name": "ownerOf", "outputs": [ { "internalType": "address", "name": "", "type": "address" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "ownerShare", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "paused", "outputs": [ { "internalType": "bool", "name": "", "type": "bool" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "paymentWallet", "outputs": [ { "internalType": "address payable", "name": "", "type": "address" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "bytes4", "name": "interfaceId", "type": "bytes4" } ], "name": "supportsInterface", "outputs": [ { "internalType": "bool", "name": "", "type": "bool" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "symbol", "outputs": [ { "internalType": "string", "name": "", "type": "string" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "uint256", "name": "index", "type": "uint256" } ], "name": "tokenByIndex", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "owner", "type": "address" } ], "name": "tokenIdsOfOwner", "outputs": [ { "internalType": "uint256[]", "name": "", "type": "uint256[]" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "owner", "type": "address" }, { "internalType": "uint256", "name": "index", "type": "uint256" } ], "name": "tokenOfOwnerByIndex", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "uint256", "name": "tokenId", "type": "uint256" } ], "name": "tokenURI", "outputs": [ { "internalType": "string", "name": "", "type": "string" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "totalSupply", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "USER_LIMIT", "outputs": [ { "internalType": "uint256", "name": "", "type": "uint256" } ], "stateMutability": "view", "type": "function" } ];

  useEffect(() => {
    if (web3 && account) {
      const contractInstance = new web3.eth.Contract(abi, contractAddress);
      setContract(contractInstance);
    }
  }, [web3, account]);

  // Initialize the contract for read operations with web3OnlyRead
  useEffect(() => {
    const initReadOnlyContract = async () => {
      try {
        const readOnlyContract = new web3OnlyRead.eth.Contract(abi, contractAddress);

        // Fetch initial contract data with web3OnlyRead
        const price = await readOnlyContract.methods.mintPrice().call();
        const fetchedSupply = parseInt(await readOnlyContract.methods.totalSupply().call(), 10);
        const fetchedMaxSupply = parseInt(await readOnlyContract.methods.MAX_SUPPLY().call(), 10);

        setMintPrice(web3OnlyRead.utils.fromWei(price, 'ether'));
        setTotalSupply(fetchedSupply);
        setMaxSupply(fetchedMaxSupply);
      } catch (error) {
        console.error('Error fetching contract data with web3OnlyRead:', error);
        setMessage('Error loading contract data.');
      }
    };

    initReadOnlyContract();
  }, [contractAddress]);

  const getGasEstimate = async (method, params, fromAddress) => {
    try {
      const gasEstimate = await method.estimateGas({ ...params, from: fromAddress });
      const gasPrice = await web3.eth.getGasPrice();

      // Add a 15% safety margin
      const gasPriceInWei = parseFloat(gasPrice);
      const gasPriceWithMarkup = (gasPriceInWei * 1.15).toFixed(0);

      return { gasEstimate, gasPrice: gasPriceWithMarkup };
    } catch (error) {
      console.error('Error estimating gas:', error);

      try {
        const gasPrice = await web3.eth.getGasPrice();
        const gasPriceInWei = parseFloat(gasPrice);
        const gasPriceWithMarkup = (gasPriceInWei * 1.15).toFixed(0);

        // Use a manual gas amount
        const manualGasEstimate = 300000;

        return { gasEstimate: manualGasEstimate, gasPrice: gasPriceWithMarkup };
      } catch (innerError) {
        console.error('Error fetching gas price for manual estimation:', innerError);
        throw innerError;
      }
    }
  };

  const handleMint = async () => {
    if (contract && account && web3) {
      const mintQty = parseInt(mintQuantity, 10);
      const pricePerMintWei = web3.utils.toWei(mintPrice, 'ether');
      const totalPriceWeiBN = new BigNumber(pricePerMintWei).times(mintQty);

      try {
        // Use getGasEstimate
        const { gasEstimate, gasPrice } = await getGasEstimate(
          contract.methods.mint(mintQty),
          { value: totalPriceWeiBN.toString(10) },
          account
        );

        await contract.methods.mint(mintQty).send({
          from: account,
          value: totalPriceWeiBN.toString(10),
          gas: gasEstimate,
          gasPrice: gasPrice,
        });

        setMessage(`Mint was successful!`);

        // Update the totalSupply after successful minting with web3OnlyRead
        try {
          const readOnlyContract = new web3OnlyRead.eth.Contract(abi, contractAddress);
          const updatedSupply = parseInt(await readOnlyContract.methods.totalSupply().call(), 10);
          setTotalSupply(updatedSupply);
        } catch (error) {
          console.error('Error updating total supply with web3OnlyRead:', error);
          setMessage('Minting successful, but error updating availability.');
        }

      } catch (error) {
        console.error('Error during minting:', error);
        setMessage('Minting failed. Please ensure you have sufficient balance.');
      }
    } else {
      setMessage('Please connect your wallet.');
    }
  };

  return (
    <div 
  className='w100 flex centered PlatinumDropBanner' 
  style={{ 
    backgroundImage: `url(/platinum-background.png)`,
    height: '100vh'
  }}
>
  <div className='overlay'></div>
      <div className="nft-drop-page centered w80 w100media flex column">

      {/* <div 
                className='PlatinumDropBanner'
                style={{ backgroundImage: `url(/platinum-banner.png)` }}
            >
            </div> */}

        <div className='flex center-ho background-Video mediacolumn2'>
            
        <div className='drop-page-mintSection'>
          <div className='w100 drop-page-mintSection-2'>
            <div className='drop-mint-header mb10'>
              <h1>TANGLESPACE PLATINUM CARD</h1>
              <span className='opacity-70'>
                The Tanglespace Platinum Card gives you access to special features and tools, as well as to token-gated communities, voting rights, and Early Access.
              </span>
            </div>

            <section className="stats">
              <div className='statsdiv'>
                <span className='opacity-50'>Mint Price</span>
                <div className='flex center-ho'>
                  <h2 className='mr5'>{mintPrice} IOTA</h2>
                  {/* If you want to use an icon */}
                  {/* <CurrencyIotaIcon
                    filled={false} 
                    textColor="currentColor" 
                    size={24} 
                    className="currency-icon"
                  /> */}
                </div>
              </div>
              <div className='statsdiv'>
                <span className='opacity-50'>Available</span>
                <h2>{maxSupply - totalSupply}/{maxSupply}</h2>
              </div>
              <div className='statsdiv'>
                <span className='opacity-50'>Status</span>
                <h2>Live!</h2>
              </div>
            </section>

            <button className="mint-button-drop w100" onClick={handleMint}>
              <h3>MINT NOW</h3>
            </button>

            {/* If you want to allow selecting the quantity */}
            {/* <section className="mint-section">
              <label>Select Quantity:</label>
              <input
                type="number"
                min="1"
                max={maxSupply - totalSupply}
                value={mintQuantity}
                onChange={(e) => setMintQuantity(e.target.value)}
              />
            </section> */}

            <div className='footerMintDiv'>
              <p>{message}</p>
            </div>
          </div>
        </div>

        <div className='flex justify-content-end fit-content'>
          <div className='drop-page-imgDiv'>
          <video className="drop-page-img" src="/giveaway.mp4" autoPlay loop muted playsInline></video>
          </div>
        </div>
        </div>

        {/* Zweite spalte */}



<div className='flex w100 space-between gap30 mt50 mediacolumn2'>

<div className='text-align-left w50 w100media aligncentermedia'>
<h2 className='text-align-left mt0 mb5'>PLATINUM CARD BENEFITS</h2>
<span className='opacity-70'>Unlock benefits and opportunities</span>
<Platinumbenefits />
</div>

<div className='text-align-left w50 w100media aligncentermedia'>
<h2 className='text-align-left mt0 mb5'>FREQUENTLY ASKED QUESTIONS</h2>
<span className='opacity-70'>Common questions & answers</span>
<PlatinumFaq />
</div>



</div>


        {/* <div className='flex center-ho mt50'>

        <div className='flex justify-content-end fit-content'>
            <div className='drop-page-videoDiv'>
                <video 
                    src='/giveaway.mp4' 
                    className='drop-page-video' 
                    autoPlay 
                    loop 
                    muted 
                    playsInline 
                    alt='Platinum Card Showcase Video'
                />
            </div>
        </div> */}


{/* 
</div> */}


      </div>
    </div>
  );
};

export default NFTDropPage;