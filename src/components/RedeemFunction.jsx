import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getTokenIdsOfOwner, getMaxSupply, redeem, getRedeemedCollections, isCollectionRedeemed, initializeMarketplace } from '../components/utils';
import { nftCollections } from '../NFTCollections';
import CountrySelect from '../components/CountrySelect';
import emailjs from 'emailjs-com'; // Importiere EmailJS
import '../styles/RedeemFunction.css';

const RedeemFunction = () => {
  const [ownedCollections, setOwnedCollections] = useState([]);
  const [redeemedCollections, setRedeemedCollections] = useState([]);
  const [view, setView] = useState('redeemable');
  const [loading, setLoading] = useState(true);
  const [account, setAccount] = useState(localStorage.getItem('account')?.toLowerCase() || '');
  const [marketplace, setMarketplace] = useState(null);
  const [selectedCollection, setSelectedCollection] = useState(null);

  // Form fields
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [address, setAddress] = useState('');
  const [address2, setAddress2] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  const [agreed, setAgreed] = useState(false);

  const navigate = useNavigate();

const handleCollectionClick = (collectionAddress) => {
  navigate(`/collections/${collectionAddress}`);
};


  useEffect(() => {
    initializeMarketplace(setMarketplace, async (marketplaceInstance) => {
      await loadCollections(marketplaceInstance);
    });
  }, []);

  const loadCollections = async (marketplaceInstance) => {
    if (!account || !marketplaceInstance) {
      console.error('No wallet address or marketplace found');
      setLoading(false);
      return;
    }

    const ownedFullCollections = [];
    const redeemedItems = [];
    
    try {
      const redeemedCollectionAddresses = await getRedeemedCollections(account, marketplaceInstance);

      for (const collection of nftCollections) {
        try {
          const tokenIds = await getTokenIdsOfOwner(collection.address, account);
          const maxSupply = await getMaxSupply(collection.address);

          if (tokenIds.length === parseInt(maxSupply)) {
            ownedFullCollections.push(collection);
          }

          const isRedeemed = await isCollectionRedeemed(account, collection.address, marketplaceInstance);
          if (isRedeemed) {
            redeemedItems.push(collection);
          }
        } catch (error) {
          console.error(`Error fetching data for collection ${collection.name}:`, error);
        }
      }

      setOwnedCollections(ownedFullCollections);
      setRedeemedCollections(redeemedItems);
      setLoading(false);
    } catch (error) {
      console.error('Error loading collections:', error);
      setLoading(false);
    }
  };

  const sendConfirmationEmail = () => {
    const templateParams = {
      email: email,
      firstName: firstName,
      lastName: lastName,
      address: address,
      address2: address2,
      postalCode: postalCode,
      city: city,
      country: country,
      collectionName: selectedCollection.name,
      collectionBanner: selectedCollection.banner,
    };

    emailjs
      .send(
        import.meta.env.VITE_EMAILJS_SERVICE_ID, // Service ID aus der .env-Datei
        import.meta.env.VITE_EMAILJS_TEMPLATE_ID_REDEEM, // Template ID aus der .env-Datei
        templateParams,
        import.meta.env.VITE_EMAILJS_USER_ID // User ID aus der .env-Datei
      )
      .then(
        (response) => {
          console.log('SUCCESS!', response.status, response.text);
        //   alert('Email sent successfully!');
        },
        (error) => {
          console.log('FAILED...', error);
        }
      );
  };

  const handleRedeem = async () => {
    if (!selectedCollection || !email || !firstName || !lastName || !address || !postalCode || !city || !country || !agreed) {
      alert("Please fill out all required fields and agree to the terms.");
      return;
    }

    try {
      await redeem(selectedCollection.address, account, marketplace);
    //   alert(`Successfully redeemed item for collection: ${selectedCollection.name}`);
      
      const isRedeemed = await isCollectionRedeemed(account, selectedCollection.address, marketplace);
      if (isRedeemed) {
        setRedeemedCollections((prev) => [...prev, selectedCollection]);
        setOwnedCollections((prev) => prev.filter((c) => c.address !== selectedCollection.address));
        sendConfirmationEmail(); // E-Mail senden, nachdem die Transaktion erfolgreich war
        setSelectedCollection(null);
      }
    } catch (error) {
      alert(`Failed to redeem item for collection: ${selectedCollection.name}`);
      console.error(error);
    }
  };

  if (loading) {
    return <div className="loading-container">
    <img src="/loading.gif" alt="Loading..." />
  </div>
  }

  const redeemableCollections = ownedCollections.filter(collection => 
    !redeemedCollections.some(redeemed => redeemed.address === collection.address)
  );

  return (
    <div className='RedeemMainDiv flex'>
      <div className='w70'>
        <h2>Redeem Physical Item</h2>
        <div className="menu">
          <button onClick={() => setView('redeemable')} className={view === 'redeemable' ? 'active' : ''}>
            Redeemable
          </button>
          <button onClick={() => setView('redeemed')} className={view === 'redeemed' ? 'active' : ''}>
            Redeemed
          </button>
        </div>

        {view === 'redeemable' && (
          <div className='redeemable-section'>
            {redeemableCollections.length > 0 ? (
              redeemableCollections.map((collection) => (
                <div key={collection.address} onClick={() => setSelectedCollection(collection)}>
                  <div className='IMGcardDivRedeem'>
                    <img src={collection.banner} alt={collection.name} />
                  </div>
                  <h3>{collection.name}</h3>
                </div>
              ))
            ) : (
              <p>You do not own any complete Artwork that have not yet been redeemed.</p>
            )}
          </div>
        )}

        {view === 'redeemed' && (
          <div className='redeemed-section'>
            {redeemedCollections.length > 0 ? (
  redeemedCollections.map((collection) => (
    <div key={collection.address} onClick={() => handleCollectionClick(collection.address)}>
      <div className='IMGcardDivRedeem'>
        <img src={collection.banner} alt={collection.name} />
      </div>
      <h3>{collection.name}</h3>
      <p>Item redeemed</p>
    </div>
  ))
) : (
  <p>No items redeemed yet.</p>
)}

          </div>
        )}
      </div>

      <div className='RedeemSectionDiv flex column space-between'>
        <h3>Redeem Selected Artwork</h3>
        {selectedCollection ? (
          <div className='flex column centered selectedCollDiv'>
            <img src={selectedCollection.banner} alt={selectedCollection.name} />
            <p>{selectedCollection.name}</p>
            <input 
            className='w93'
              type="email" 
              placeholder="Enter your email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required
            />
            <CountrySelect className='w93' value={country} onChange={(e) => setCountry(e.target.value)} />
            <div className='flex center-ho gap10'>
            <input 
              type="text" 
              placeholder="First Name" 
              value={firstName} 
              onChange={(e) => setFirstName(e.target.value)} 
              required
            />
            <input 
              type="text" 
              placeholder="Last Name" 
              value={lastName} 
              onChange={(e) => setLastName(e.target.value)} 
              required
            />
            </div>
            <input 
            className='w93'
              type="text" 
              placeholder="Address" 
              value={address} 
              onChange={(e) => setAddress(e.target.value)} 
              required
            />
            <input 
            className='w93'
              type="text" 
              placeholder="Address Line 2 (optional)" 
              value={address2} 
              onChange={(e) => setAddress2(e.target.value)} 
            />
            <div className='flex center-ho gap10'>
            <input 
              type="text" 
              placeholder="Postal Code" 
              value={postalCode} 
              onChange={(e) => setPostalCode(e.target.value)} 
              required
            />
            <input 
              type="text" 
              placeholder="City" 
              value={city} 
              onChange={(e) => setCity(e.target.value)} 
              required
            />
            </div>
            <label className='mb10'>
              <input 
              className='checkboxinput'
                type="checkbox" 
                checked={agreed} 
                onChange={(e) => setAgreed(e.target.checked)} 
              />
              I agree to the terms
            </label>
            <span className='grey mb5 mt5'>* Please ensure all your details are correct</span>
            <button className=" ChangeProfilePicturebutton redeem-button mt5 w100" onClick={handleRedeem}>Redeem</button>
          </div>
        ) : (
          <p>Select a collection to redeem</p>
        )}
      </div>
    </div>
  );
};

export default RedeemFunction;
