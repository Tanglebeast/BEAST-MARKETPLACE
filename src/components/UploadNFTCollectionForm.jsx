import React, { useState } from 'react';
import emailjs from 'emailjs-com';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import '../styles/UpluadNFTCollectionForm.css';
import { storage } from '../../firebaseConfig';
import { artistList } from '../ArtistList';

const NFTCollectionForm = () => {
    const [blockchain, setBlockchain] = useState('');
    const [category, setCategory] = useState('');
    const [medium, setMedium] = useState('');
    const [showOtherCategory, setShowOtherCategory] = useState(false);
    const [showOtherMedium, setShowOtherMedium] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        mintPrice: '',
        maxMintsPerWallet: '',
        totalSupply: '',
        walletAddress: '',
        otherCategory: '',
        physicalSize: '',
        otherMedium: '',
        agreeTerms: false,
        agreeFoundation: false,
    });
    const [loading, setLoading] = useState(false); // Zustand für den Ladebildschirm
    const [imageUrl, setImageUrl] = useState(''); // Zustand für das Bild-URL
    const [artworkUrls, setArtworkUrls] = useState([]); // Zustand für die Kunstwerk-URLs

    // Funktion zum Überprüfen der Wallet-Adresse
    const getArtistInfo = (walletAddress) => {
        const artist = artistList.find(
            artist => artist.walletaddress.toLowerCase() === walletAddress.toLowerCase()
        );
        return artist || { name: 'Unknown', email: 'unknown@example.com' };
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value,
        });
    };

    const handleImageUpload = (file) => {
        return new Promise((resolve, reject) => {
            const storageRef = ref(storage, `images/${file.name}`);
            const uploadTask = uploadBytesResumable(storageRef, file);

            uploadTask.on(
                "state_changed",
                (snapshot) => {
                    // Optional: Fortschritt anzeigen
                },
                (error) => {
                    reject(error);
                },
                () => {
                    getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                        resolve(downloadURL);
                    });
                }
            );
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true); // Ladebildschirm aktivieren

        if (!formData.agreeTerms || !formData.agreeFoundation) {
            alert("Please agree to the terms and conditions and the foundation contribution.");
            setLoading(false); // Ladebildschirm deaktivieren
            return;
        }

        const imageFiles = e.target.imageCertificate.files;
        const artworkFiles = e.target.physicalArtworkImages.files;

        try {
            // Lade das Zertifikatsbild hoch
            const uploadedImageUrl = await handleImageUpload(imageFiles[0]);
            setImageUrl(uploadedImageUrl); // Bild-URL setzen

            // Lade alle Kunstwerke hoch und speichere die URLs
            const uploadedArtworkUrls = await Promise.all(
                Array.from(artworkFiles).map(file => handleImageUpload(file))
            );
            const artworkUrlsFormatted = uploadedArtworkUrls.map(url => `<img src="${url}" alt="Artwork" style="width: 100px; height: auto; margin-bottom: 10px; margin-right: 10px;">`).join('');
            setArtworkUrls(uploadedArtworkUrls); // Kunstwerk-URLs setzen

            // Hole die Wallet-Adresse aus dem lokalen Speicher
            const localWalletAddress = localStorage.getItem('account');
            const artistInfo = getArtistInfo(localWalletAddress);

            console.log('Image URL:', uploadedImageUrl);
            console.log('Artwork URLs:', artworkUrlsFormatted);

            // Sende die Daten via EmailJS mit den Bild-URLs
            const response = await emailjs.send(
                import.meta.env.VITE_EMAILJS_SERVICE_ID,
                import.meta.env.VITE_EMAILJS_TEMPLATE_ID_NFTCOLLECTION,
                {
                    blockchain: blockchain,
                    name: formData.name,
                    description: formData.description,
                    mintPrice: formData.mintPrice,
                    maxMintsPerWallet: formData.maxMintsPerWallet,
                    totalSupply: formData.totalSupply,
                    walletAddress: formData.walletAddress,
                    category: category === 'other' ? formData.otherCategory : category,
                    physicalSize: formData.physicalSize,
                    medium: medium === 'other' ? formData.otherMedium : medium,
                    imageUrl: uploadedImageUrl,  // URL des Zertifikatsbildes
                    artworkUrls: artworkUrlsFormatted, // Array der URLs der Kunstwerke
                    to_name: artistInfo.name, // Künstlername
                    user_email: artistInfo.email, // Künstler-E-Mail
                },
                import.meta.env.VITE_EMAILJS_USER_ID
            );

            console.log('EmailJS Response:', response);
            alert("NFT Collection created successfully!");

            // Formular und Zustände zurücksetzen
            setFormData({
                name: '',
                description: '',
                mintPrice: '',
                maxMintsPerWallet: '',
                totalSupply: '',
                walletAddress: '',
                otherCategory: '',
                physicalSize: '',
                otherMedium: '',
                agreeTerms: false,
                agreeFoundation: false,
            });
            setBlockchain('');
            setCategory('');
            setMedium('');
            setImageUrl('');
            setArtworkUrls([]);
        } catch (error) {
            console.error("Upload or email error:", error);
            alert("Failed to upload images or send email. Please try again.");
        } finally {
            setLoading(false); // Ladebildschirm deaktivieren
        }
    };

    return (
        <form onSubmit={handleSubmit} className="nft-form-container">
            <h2>Submit an Artwork</h2>
            <p className='grey'>Please be advised that we do not accept every Artwork. We will carefully review all information provided and make decisions based on the quality, originality, and potential of the submitted work.</p>
            <label>
                Blockchain:
                <select name="blockchain" value={blockchain} onChange={(e) => setBlockchain(e.target.value)} required>
                    <option value="">Select Blockchain</option>
                    <option value="IOTA">IOTA</option>
                    <option value="BNB">BNB</option>
                    <option value="Ethereum">Ethereum</option>
                    <option value="Polygon">Polygon</option>
                </select>
            </label>

            <label>
                Artwork name:
                <input type="text" name="name" value={formData.name} onChange={handleInputChange} placeholder="Enter name" required />
            </label>

            <label>
                Artwork description:
                <textarea name="description" value={formData.description} onChange={handleInputChange} placeholder="Enter description" required></textarea>
            </label>

            <label className='numberInputSubmitCollection'>
                Mint Price (in native chain currency):
                <input className='mt5' type="number" name="mintPrice" value={formData.mintPrice} onChange={handleInputChange} placeholder="Enter mint price" required />
            </label>

            <label className='numberInputSubmitCollection'>
                Max Mints Per Wallet:
                <input type="number" name="maxMintsPerWallet" value={formData.maxMintsPerWallet} onChange={handleInputChange} placeholder="Enter max mints per wallet" required />
            </label>

            <label className='numberInputSubmitCollection'>
                Total Supply:
                <input type="number" name="totalSupply" value={formData.totalSupply} onChange={handleInputChange} placeholder="Enter total supply (Amount of fractals)" required />
            </label>

            <label>
                Wallet Address:
                <input type="text" name="walletAddress" value={formData.walletAddress} onChange={handleInputChange} placeholder="Enter the payment wallet address" required />
            </label>

            <label>
                Category:
                <select name="category" value={category} onChange={(e) => {
                    setCategory(e.target.value);
                    setShowOtherCategory(e.target.value === 'other');
                }} required>
                    <option value="">Select Category</option>
                    <option value="modern art">Modern Art</option>
                    <option value="digital art">Digital Art</option>
                    <option value="oil painting">Oil Painting</option>
                    <option value="other">Other</option>
                </select>
            </label>

            {showOtherCategory && (
                <label>
                    Describe your category:
                    <input type="text" name="otherCategory" value={formData.otherCategory} onChange={handleInputChange} placeholder="Describe category" required />
                </label>
            )}

            <label>
                Physical Size:
                <input type="text" name="physicalSize" value={formData.physicalSize} onChange={handleInputChange} placeholder="Enter physical size in cm (100 X 150cm)" required />
            </label>

            <label>
                Medium:
                <select name="medium" value={medium} onChange={(e) => {
                    setMedium(e.target.value);
                    setShowOtherMedium(e.target.value === 'other');
                }} required>
                    <option value="">Select Medium</option>
                    <option value="3d textured canvas">3D Textured Canvas</option>
                    <option value="oil">Oil</option>
                    <option value="pen">Pen</option>
                    <option value="other">Other</option>
                </select>
            </label>

            {showOtherMedium && (
                <label>
                    Describe your medium:
                    <input type="text" name="otherMedium" value={formData.otherMedium} onChange={handleInputChange} placeholder="Describe medium" required />
                </label>
            )}

            <label>
                Upload Certificate:
                <input type="file" name="imageCertificate" required />
            </label>

            <label>
                Upload Physical Artwork Images:
                <input type="file" name="physicalArtworkImages" multiple required />
            </label>

            <label className='row centered'>
                <input className='mtb0' type="checkbox" name="agreeFoundation" checked={formData.agreeFoundation} onChange={handleInputChange} required />
                I agree with the secondary market and mint fees for the Fractalz foundation
            </label>

            <label className='row centered'>
                <input className='mtb0' type="checkbox" name="agreeTerms" checked={formData.agreeTerms} onChange={handleInputChange} required />
                I agree to the terms and conditions
            </label>

            <button type="submit" className='actionbutton'>
                {loading ? <img src="basic-loading.gif" alt="Loading..." style={{ width: '20px', height: '20px' }} /> : 'SUBMIT ARTWORK'}
            </button>
        </form>
    );
};

export default NFTCollectionForm;
