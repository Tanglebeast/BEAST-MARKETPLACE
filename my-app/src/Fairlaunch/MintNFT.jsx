import React, { useState, useEffect, useCallback } from 'react';
import Web3 from 'web3';
import { Link } from 'react-router-dom';
import CustomPopup from '../components/SuccessfulMintPopup';
import { nftCollections } from '../NFTCollections';
import ArtworkDetails from '../components/ArtworkDetails';
import BigNumber from 'bignumber.js';
import '../styles/Fairlaunch.css'



// Funktion zum Überprüfen und Wechseln von Netzwerken
const checkNetwork = async (expectedChainId, showAlert) => {
    if (window.ethereum) {
        try {
            const chainId = await window.ethereum.request({ method: 'eth_chainId' });
            if (chainId !== expectedChainId) {
                await window.ethereum.request({
                    method: 'wallet_switchEthereumChain',
                    params: [{ chainId: expectedChainId }],
                });
            }
        } catch (switchError) {
            if (switchError.code === 4902) {
                // Chain not added, prompt user to add it
                const chain = getChainById(expectedChainId);
                if (chain) {
                    await window.ethereum.request({
                        method: 'wallet_addEthereumChain',
                        params: [chain],
                    });
                } else {
                    showAlert('Network is not supported');
                }
            } else {
                // Handle other errors
                showAlert('Please connect to the correct network.');
            }
        }
    } else {
        showAlert('Please install MetaMask!');
    }
};

const getChainById = (chainId) => {
    const chains = {
        '0x431': {
            chainId: '0x431',
            chainName: 'Shimmer Testnet',
            rpcUrls: ['https://shimmer.network'],
            nativeCurrency: {
                name: 'Shimmer',
                symbol: 'SMR',
                decimals: 18,
            },
            blockExplorerUrls: ['https://explorer.shimmer.network'],
        },
        '0x433': {
            chainId: '0x433',
            chainName: 'IOTA Testnet',
            rpcUrls: ['https://iota.testnet'],
            nativeCurrency: {
                name: 'IOTA',
                symbol: 'IOTA',
                decimals: 18,
            },
            blockExplorerUrls: ['https://explorer.iota.testnet'],
        },
        // Add other chains as needed
    };

    return chains[chainId] || null;
};

// Token-IDs und Besitzer abrufen
const getUserTokenDetails = async (contract, account) => {
    if (!contract || !account) return [];

    const tokenIds = [];
    const ownerDetails = [];

    try {
        const balance = await contract.methods.balanceOf(account).call();
        console.log("Token Balance:", balance); // Debugging-Ausgabe

        for (let i = 0; i < balance; i++) {
            const tokenId = await contract.methods.tokenOfOwnerByIndex(account, i).call();
            console.log("Token ID:", tokenId); // Debugging-Ausgabe

            const tokenURI = await contract.methods.tokenURI(tokenId).call(); // Abrufen der Token URI
            console.log("Token URI for Token ID", tokenId, ":", tokenURI); // Alte URI in der Konsole anzeigen

            // Entferne den ersten Abschnitt der URI bis zum "/"
            const splitURI = tokenURI.split('/');
            const newURI = `https://ipfs.io/ipfs/${splitURI[splitURI.length - 2]}/${splitURI[splitURI.length - 1]}.json`;

            console.log("Formatted Token URI for Token ID", tokenId, ":", newURI); // Neue formatierte URI in der Konsole anzeigen

            // Abrufen der JSON-Daten
            const response = await fetch(newURI);
            const data = await response.json();

            tokenIds.push(tokenId);

            const owner = await contract.methods.ownerOf(tokenId).call();
            console.log("Owner for Token ID", tokenId, ":", owner); // Debugging-Ausgabe

            ownerDetails.push({
                tokenId,
                owner,
                title: data.name,
                description: data.description,
                image: data.image.replace('ipfs://', 'https://ipfs.io/ipfs/'),
                attributes: data.attributes
            });
        }
    } catch (error) {
        console.error("Fehler beim Abrufen der Token-Details:", error);
    }

    return ownerDetails;
};

const MintNFT = () => {
    const [account, setAccount] = useState(null);
    const [contract, setContract] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [popupMessage, setPopupMessage] = useState(null);
    const [showPopup, setShowPopup] = useState(false);
    const [selectedCollection, setSelectedCollection] = useState(null);
    const [userLimit, setUserLimit] = useState(null);
    const [maxSupply, setMaxSupply] = useState(null);
    const [availableSupply, setAvailableSupply] = useState(null);
    const [totalSupply, setTotalSupply] = useState(null);
    const [walletNFTCount, setWalletNFTCount] = useState(null);
    const [loading, setLoading] = useState(true);
    const [tokenDetails, setTokenDetails] = useState([]);
    const [showOverlay, setShowOverlay] = useState(false);
    const [pricePerNFT, setPricePerNFT] = useState(null);
    const maxQuantity = userLimit !== null && walletNFTCount !== null ? Math.max(0, userLimit - walletNFTCount) : 1;


    const refreshContractData = useCallback(async () => {
        if (contract && account) {
            setLoading(true);
            try {
                const maxSupplyBigInt = await contract.methods.MAX_SUPPLY().call();
                const userLimitBigInt = await contract.methods.USER_LIMIT().call();
                const totalSupplyBigInt = await contract.methods.totalSupply().call();
                const balanceBigInt = await contract.methods.balanceOf(account).call();

                const pricePerNFT = await contract.methods.mintPrice().call();
                setPricePerNFT(pricePerNFT); // Setze den Preis

                const maxSupply = Number(maxSupplyBigInt);
                const userLimit = Number(userLimitBigInt);
                const totalSupply = Number(totalSupplyBigInt);
                const walletNFTCount = Number(balanceBigInt);

                setMaxSupply(maxSupply);
                setUserLimit(userLimit);
                setTotalSupply(totalSupply);
                setAvailableSupply(maxSupply - totalSupply);
                setWalletNFTCount(walletNFTCount);

                // Abrufen der Token-Details
                const userTokenDetails = await getUserTokenDetails(contract, account);
                setTokenDetails(userTokenDetails);

                console.log("Max Supply:", maxSupply);
                console.log("User Limit:", userLimit);
                console.log("Total Supply:", totalSupply);
                console.log("Wallet NFT Count:", walletNFTCount);
                console.log("Token Details:", userTokenDetails);
            } catch (error) {
                console.error("Fehler beim Abrufen der Vertragsdaten:", error);
                showAlert('Please switch into the correct Network.');
            } finally {
                setLoading(false);
            }
        }
    }, [contract, account]);

    useEffect(() => {
        const checkWalletConnection = async () => {
            if (window.ethereum) {
                const web3 = new Web3(window.ethereum);
                const accounts = await web3.eth.getAccounts();
                if (accounts.length > 0) {
                    setAccount(accounts[0]);

                    const currentUrl = window.location.pathname;
                    const contractAddressFromURL = currentUrl.split('/').pop();

                    console.log("Contract Address from URL:", contractAddressFromURL);

                    const collection = nftCollections.find(collection => collection.address.toLowerCase() === contractAddressFromURL.toLowerCase());
                    setSelectedCollection(collection);

                    if (collection) {
                        const contractAbi = collection.abi;
                        const contractAddress = collection.address;

                        console.log("Contract ABI:", contractAbi);
                        console.log("Contract Address:", contractAddress);

                        if (contractAbi) {
                            const expectedChainId = collection.networkid;
                            await checkNetwork(expectedChainId, showAlert);

                            const contractInstance = new web3.eth.Contract(contractAbi, contractAddress);
                            setContract(contractInstance);
                        } else {
                            showAlert('ABI nicht gefunden für die ausgewählte Vertragsadresse');
                        }
                    } else {
                        showAlert('Keine Sammlung gefunden mit der angegebenen Vertragsadresse');
                    }
                }
            }
        };

        checkWalletConnection();
    }, []);

    useEffect(() => {
        refreshContractData();
    }, [refreshContractData]);

    const connect = async () => {
        if (window.ethereum) {
            await window.ethereum.request({ method: 'eth_requestAccounts' });
            const web3 = new Web3(window.ethereum);

            const accounts = await web3.eth.getAccounts();
            setAccount(accounts[0]);

            const currentUrl = window.location.pathname;
            const contractAddressFromURL = currentUrl.split('/').pop();

            console.log("Contract Address from URL (Connect):", contractAddressFromURL);

            const collection = nftCollections.find(collection => collection.address.toLowerCase() === contractAddressFromURL.toLowerCase());
            setSelectedCollection(collection);

            if (collection) {
                const contractAbi = collection.abi;
                const contractAddress = collection.address;

                console.log("Contract ABI (Connect):", contractAbi);
                console.log("Contract Address (Connect):", contractAddress);

                if (contractAbi) {
                    const expectedChainId = collection.networkid;
                    await checkNetwork(expectedChainId, showAlert);

                    const contractInstance = new web3.eth.Contract(contractAbi, contractAddress);
                    setContract(contractInstance);
                } else {
                    showAlert('ABI nicht gefunden für die ausgewählte Vertragsadresse');
                }
            } else {
                showAlert('Keine Sammlung gefunden mit der angegebenen Vertragsadresse');
            }
        }
    };

    const getGasPricing = async (web3) => {
        const supportsEIP1559 = await web3.eth.getBlock('latest').then(block => block.baseFeePerGas !== undefined);
        let gasPrice;
        if (supportsEIP1559) {
            const feeData = await web3.eth.getFeeHistory(1, 'pending', [25, 75]);
            const baseFee = feeData.baseFeePerGas[feeData.baseFeePerGas.length - 1];
            const priorityFee = web3.utils.toWei('2', 'gwei');
            gasPrice = web3.utils.toBN(baseFee).add(web3.utils.toBN(priorityFee)).toString();
        } else {
            gasPrice = await web3.eth.getGasPrice();
        }
        return gasPrice;
    };

    const mint = async () => {
        if (contract && quantity > 0 && selectedCollection) {
            const web3 = new Web3(window.ethereum);
            const gasPrice = await getGasPricing(web3);
    
            // Hole den Preis pro NFT vom Smart Contract
            const pricePerNFT = await contract.methods.mintPrice().call();
            // Gesamtpreis berechnen
            const totalPrice = new BigNumber(pricePerNFT).times(quantity).toFixed(); // 'toFixed' für eine präzise Dezimaldarstellung
    
            console.log('Preis pro NFT (in Wei):', pricePerNFT);
            console.log('Gesamtpreis (in Wei):', totalPrice);
    
            try {
                await contract.methods.mint(quantity).send({
                    from: account,
                    value: totalPrice, // Überweise den Gesamtbetrag in Wei
                    gasPrice
                })
                .on('receipt', async (receipt) => {
                    console.log('Transaktionsbeleg:', receipt);
    
                    if (receipt.events.Transfer) {
                        const tokenId = receipt.events.Transfer.returnValues.tokenId;
                        console.log('Gemintete Token-ID:', tokenId);
    
                        // Abrufen der Details für den neu geminteten Token
                        const tokenURI = await contract.methods.tokenURI(tokenId).call();
                        const splitURI = tokenURI.split('/');
                        const newURI = `https://ipfs.io/ipfs/${splitURI[splitURI.length - 2]}/${splitURI[splitURI.length - 1]}.json`;
    
                        // Abrufen der JSON-Daten
                        const response = await fetch(newURI);
                        const data = await response.json();
    
                        const mintedTokenDetails = [{
                            tokenId,
                            title: data.name,
                            description: data.description,
                            image: data.image.replace('ipfs://', 'https://ipfs.io/ipfs/'),
                            attributes: data.attributes
                        }];
    
                        setTokenDetails(mintedTokenDetails);
                        showAlert('MINT SUCCESSFULL', mintedTokenDetails);
                    } else {
                        console.log('Kein Transfer-Event im Beleg gefunden');
                        showAlert('Mint erfolgreich');
                    }
    
                    refreshContractData();
                })
                .on('error', (error) => {
                    console.error(error);
                    showAlert('Mint fehlgeschlagen');
                });
            } catch (error) {
                console.error(error);
                showAlert('Minting-Transaktion fehlgeschlagen');
            }
        } else {
            showAlert('Ungültige Menge oder Sammlung nicht ausgewählt');
        }
    };
    
    
    

    const showAlert = (message, tokenDetails = []) => {
        setPopupMessage(message);
        setShowPopup(true);
        setTokenDetails(tokenDetails); // Setze die Details der geminteten Tokens
    };

    const closePopup = () => {
        setShowPopup(false);
        setPopupMessage(null);
        setTokenDetails([]); // Leeren der Token-Details beim Schließen des Popups
    };

    const handleIncreaseQuantity = () => {
        if (quantity < maxQuantity) {
            setQuantity(quantity + 1);
        }
    };
    
    const handleDecreaseQuantity = () => {
        if (quantity > 1) {
            setQuantity(quantity - 1);
        }
    };
    

    return (
        <div className='w100 centered column'>
            {loading ? (
                <div className="loading-container">
                    <img src='/loading.gif' alt='Loading...' />
                </div>
            ) : (
                <>
                    {selectedCollection && (
                        <div className='Mint-Info w95'>
                            {selectedCollection.banner && (
                                <img src={selectedCollection.banner} alt={selectedCollection.name} />
                            )}
                            <div className='Mint-info-text'>
                                <h2>{selectedCollection.name}</h2>
                                <p>{selectedCollection.description}</p>
                            </div>
                        </div>
                    )}
                    <div className='w95 mt35 Mint-DetailDiv centered'>
                        <div className='flex centered w100 margin-0-10 h500'>
                            <div className="image-container-mint">
                                {selectedCollection && selectedCollection.banner && (
                                    <img className='FullImageDiv' src={selectedCollection.banner} alt={selectedCollection.name} />
                                )}
                                {selectedCollection && selectedCollection.grid && (
                                    <img className={`OverlayImage ${showOverlay ? 'visible' : 'hidden'}`} src={selectedCollection.grid} alt="Overlay" />
                                )}
                            </div>

                            <div className='Mint-Info-UnderDiv'>
                                <div className='flex column center-v space-between w100 h100'>
                                {selectedCollection && (
                                    <>
                                    <div className='w100'>
                                        <div className='flex center-ho'>
                                            <p className='VisibleLink'>
                                                <Link to={`/collections/${selectedCollection.address}`}>{selectedCollection.name}</Link>
                                            </p>
                                        </div>

                                        <div className='flex center-ho'>
                                            <img className='w25 mr10' src='/artist.png' alt='Artist' />
                                            <p className='VisibleLink'>
                                                <Link to={`/artists/${selectedCollection.artist}`}>{selectedCollection.artist}</Link>
                                            </p>
                                        </div>
                                        </div>

                                    <div className='w100'>

                                        <div className='flex center-ho space-between'>
                                        <div className='maxperwallet flex centered grey'>
                                        <span className='margin-0 s16'><span className='margin-0 s16'>{walletNFTCount !== null ? walletNFTCount : 'Loading...'}/</span>{userLimit !== null ? userLimit : 'Loading...'} MAX MINTS PER WALLET</span>
                                        </div>
                                        </div>
                                        
                                        

                                        <div className='center-ho flex currency-icon-Mint space-between w100'>
                                            <div className='flex centere-ho column'>
                                            <p className='grey mb5'>Price:</p>
                                            <div className='flex center-ho'>
                                            <h3 className='s24 mt5 mb0'>{pricePerNFT ? `${Web3.utils.fromWei(pricePerNFT, 'ether')}` : 'Loading...'}</h3>
                                            {selectedCollection.currency && (
                                                <img src={selectedCollection.currency} alt="Currency Symbol" />
                                            )}
                                            </div>
                                            </div>
                                            <div className='flex centere-ho column'>
                                            <p className='grey mb5'>Remaining:</p>
                                            <h3 className='s24 mt5 mb0'>{availableSupply !== null ? availableSupply : 'Loading...'}/{maxSupply !== null ? maxSupply : 'Loading...'}</h3>
                                            </div>
                                        </div>
                                        </div>
                                        
                                        
                                    </>
                                )}

                                <div className='w100'>
                                    <div className='flex center-ho space-between'>
                                    <div className='quantity-container flex center-ho'>
                                        <button className='quantity-button' onClick={handleDecreaseQuantity}>-</button>
                                        <input 
                                        className='listinginput-mint'
                                        type="text"
                                        value={quantity}
                                        onChange={e => {
                                            const value = e.target.value;
                                            if (/^\d*$/.test(value)) { // Überprüft, ob nur Ziffern eingegeben werden
                                                setQuantity(Math.max(1, Math.min(userLimit || 1, value))); // Begrenzung auf Werte zwischen 1 und userLimit
                                            }
                                        }}
                                        inputMode="numeric"
                                    />

                                        <button className='quantity-button' onClick={handleIncreaseQuantity}>+</button>
                                    </div>
                                

                                    <div className='flex center-ho'>
                                        <p className='mr10'>NFT GRID</p>
                                        <label className='switch'>
                                            <input
                                                type='checkbox'
                                                checked={showOverlay}
                                                onChange={() => setShowOverlay(!showOverlay)}
                                            />
                                            <span className='slider'></span>
                                        </label>
                                    </div>
                                    </div>
                                    <button
                                        className={`mint-Button ${walletNFTCount === userLimit ? 'disabled' : ''}`}
                                        onClick={mint}
                                        disabled={walletNFTCount === userLimit || !account}
                                    >
                                        <h3 className='margin-0'>
                                            {walletNFTCount === userLimit ? 'MAX AMOUNT MINTED' : 'MINT NOW'}
                                        </h3>
                                    </button>


                                </div>

                                {showPopup && <CustomPopup message={popupMessage} tokenDetails={tokenDetails} onClose={closePopup} />}
                            </div>
                        </div>
                    </div>
                    </div>
                    <ArtworkDetails />
                </>
            )}
        </div>
    );
};

export default MintNFT;
