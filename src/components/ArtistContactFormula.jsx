import React, { useState } from 'react';
import emailjs from 'emailjs-com';
// Entfernte den Import von CountrySelect
import '../styles/ArtistContactFormula.css';

function KontaktFormular() {
  const [formData, setFormData] = useState({
    name: '',
    artistName: '',
    // profileImage: null, // Entfernt
    // bannerImage: null, // Entfernt
    email: '',
    // country: '', // Entfernt
    artType: [],
    hasArtworks: '',
    isFromSoonaverse: '', // Neu hinzugefügt
    artworksLinks: [''], // Geändert von 'artworksLink' zu 'artworksLinks' als Array
    twitter: '',
    instagram: '',
    website: '',
    behance: '',
    discord: '',
    wallet: '',
    description: '',
    additionalInfo: '',
    agreeToTerms: false
  });

  const [showArtworksLink, setShowArtworksLink] = useState(false);
  const [loading, setLoading] = useState(false); // Ladezustand

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name.startsWith('artworksLinks')) {
      const index = parseInt(e.target.dataset.index, 10);
      const newArtworksLinks = [...formData.artworksLinks];
      newArtworksLinks[index] = value;
      setFormData((prevData) => ({
        ...prevData,
        artworksLinks: newArtworksLinks
      }));
      return;
    }

    setFormData((prevData) => ({
      ...prevData,
      [name]: type === 'checkbox' ? checked : value
    }));

    if (name === 'hasArtworks') {
      setShowArtworksLink(value === 'yes');
      // Reset isFromSoonaverse and artworksLinks when hasArtworks changes
      setFormData((prevData) => ({
        ...prevData,
        isFromSoonaverse: '',
        artworksLinks: ['']
      }));
    }

    if (name === 'isFromSoonaverse') {
      // Reset artworksLinks when isFromSoonaverse changes
      setFormData((prevData) => ({
        ...prevData,
        artworksLinks: ['']
      }));
    }
  };

  const handleArtTypeChange = (e) => {
    const { value, checked } = e.target;
    setFormData((prevData) => {
      if (checked) {
        return { ...prevData, artType: [...prevData.artType, value] };
      } else {
        return { ...prevData, artType: prevData.artType.filter((type) => type !== value) };
      }
    });
  };

  const handleAddArtworksLink = () => {
    setFormData((prevData) => ({
      ...prevData,
      artworksLinks: [...prevData.artworksLinks, '']
    }));
  };

  const handleRemoveArtworksLink = (index) => {
    setFormData((prevData) => {
      const newArtworksLinks = [...prevData.artworksLinks];
      newArtworksLinks.splice(index, 1);
      return { ...prevData, artworksLinks: newArtworksLinks };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.agreeToTerms) {
      alert('You must agree to the terms and privacy policy.');
      return;
    }

    setLoading(true); // Ladezustand aktivieren

    try {
      // Entfernte die Upload-Logik für Profile- und Banner-Images

      // Konvertiere artworksLinks Array in eine formatierte Zeichenkette
      const formattedArtworksLinks = formData.artworksLinks.join('<br>');

      // E-Mail an den Kunden senden
      await emailjs.send(
        import.meta.env.VITE_EMAILJS_SERVICE_ID,
        import.meta.env.VITE_EMAILJS_TEMPLATE_ID_NFTCOLLECTION,
        {
          to_name: formData.name,
          to_email: formData.email,
          from_name: formData.name,
          artist_name: formData.artistName,
          // profile_image_url: '', // Entfernt
          // banner_image_url: '', // Entfernt
          reply_to: formData.email,
          // country: '', // Entfernt
          art_type: formData.artType.join(', '),
          has_artworks: formData.hasArtworks,
          is_from_soonaverse: formData.isFromSoonaverse, // Neu hinzugefügt
          artworks_links: formattedArtworksLinks, // Geändert zu formatierter Zeichenkette
          twitter: formData.twitter,
          instagram: formData.instagram,
          website: formData.website,
          behance: formData.behance,
          discord: formData.discord,
          wallet: formData.wallet,
          description: formData.description,
          additional_info: formData.additionalInfo
        },
        import.meta.env.VITE_EMAILJS_USER_ID
      );

      alert('Form submitted successfully!');
      setFormData({
        name: '',
        artistName: '',
        // profileImage: null,
        // bannerImage: null,
        email: '',
        // country: '',
        artType: [],
        hasArtworks: '',
        isFromSoonaverse: '',
        artworksLinks: [''], // Zurücksetzen auf ein leeres Feld
        twitter: '',
        instagram: '',
        website: '',
        behance: '',
        discord: '',
        wallet: '',
        description: '',
        additionalInfo: '',
        agreeToTerms: false
      });
      setShowArtworksLink(false);
    } catch (error) {
      console.error('Error sending Form: ', error);
      alert('Error sending Form. Please try again.');
    } finally {
      setLoading(false); // Ladezustand deaktivieren
    }
  };

  return (
    <div className='w100 centered'>
      <form id="contactForm" className='centered column' onSubmit={handleSubmit}>
        <h3>REGISTER PROJECT</h3>
        <p className='grey lh w80'>
          Please be advised that we do not accept every project for collaboration. Our selection process is thorough and meticulous. We carefully review all information provided and make decisions based on the quality, originality, and potential of the submitted collection. Only those projects who meet our standards and align with our vision will be considered.
        </p>
        <div className='column flex mb25 w80'>
          <label className='mb5'>
            NAME
          </label>
          <input
            placeholder="Please enter your name"
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
          />
        </div>
        <div className='column flex mb25 w80'>
          <label className='mb5'>PROJECT NAME
          <span className="star-icon">*</span>
          </label>
          <input
            placeholder="Please enter the project name"
            type="text"
            name="artistName"
            value={formData.artistName}
            onChange={handleChange}
            required
          />
        </div>
        {/* Entfernte Profile Image und Banner Image Felder */}
        <div className='column flex mb25 w80'>
          <label className='mb5'>
            EMAIL
            <span className="star-icon">*</span>
          </label>
          <input
            placeholder="Please enter your email (we will respond to this email)"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>
        <div className='column flex mb25 w80'>
          <label className='mb5'>
            Walletaddress
            <span className="star-icon">*</span>
          </label>
          <input
            placeholder="Please enter your EVM wallet address"
            type="text"
            name="wallet"
            value={formData.wallet}
            onChange={handleChange}
            required
          />
        </div>
        {/* Entfernte Länder-Auswahl */}
        <div className='column flex mb25 w80 mt15'>
          <label className='mb10'>WHICH CATEGORIES ARE YOU INTO?</label>
          <div>
            <label><input type="checkbox" value="digital art" onChange={handleArtTypeChange} /> Digital Art</label>
            <label className='ml5'><input type="checkbox" value="pfps" onChange={handleArtTypeChange} /> PFPs</label>
            <label className='ml5'><input type="checkbox" value="metaverse" onChange={handleArtTypeChange} /> Metaverse</label>
            <label className='ml5'><input type="checkbox" value="3d art" onChange={handleArtTypeChange} /> 3D Art</label>
            <br />
            <label><input type="checkbox" value="music" onChange={handleArtTypeChange} /> Music</label>
            <label className='ml5'><input type="checkbox" value="gaming" onChange={handleArtTypeChange} /> Gaming</label>
            <label className='ml5'><input type="checkbox" value="ai art" onChange={handleArtTypeChange} /> AI Art</label>
            <label className='ml5'><input type="checkbox" value="other" onChange={handleArtTypeChange} /> Other</label>
          </div>
        </div>
        <div className='column flex mb25 w80 mt15'>
          <label className='mb5'>DO YOU ALREADY HAVE EXISTING NFT COLLECTIONS ON IOTA OR SHIMMER?
          <span className="star-icon">*</span>
          </label>
          <div>
            <label><input type="radio" name="hasArtworks" value="yes" checked={formData.hasArtworks === 'yes'} onChange={handleChange} required/> Yes</label>
            <label className='ml5'><input type="radio" name="hasArtworks" value="no" checked={formData.hasArtworks === 'no'} onChange={handleChange} /> No</label>
          </div>
        </div>
        {showArtworksLink && (
          <>
            <div className='column flex mb25 w80'>
              <label className='mb5'>Are you from soonaverse?
              <span className="star-icon">*</span>
              </label>
              <div>
                <label><input type="radio" name="isFromSoonaverse" value="yes" checked={formData.isFromSoonaverse === 'yes'} onChange={handleChange} required/> Yes</label>
                <label className='ml5'><input type="radio" name="isFromSoonaverse" value="no" checked={formData.isFromSoonaverse === 'no'} onChange={handleChange} /> No</label>
              </div>
            </div>
            <div className='column flex mb25 w80'>
              <label className='mb5'>
                {formData.isFromSoonaverse === 'yes'
                  ? 'Enter collection ids'
                  : 'Enter links to collections'}
                <span className="star-icon">*</span>
              </label>
              {formData.artworksLinks.map((link, index) => (
                <div key={index} className='artworks-link-input'>
                  <input
                    placeholder={
                      formData.isFromSoonaverse === 'yes'
                        ? 'Please enter your collection ID'
                        : 'Please provide a link to your collection'
                    }
                    type="text" // Geändert von "url" zu "text"
                    className='textfield-add-removeable'
                    name={`artworksLinks[${index}]`}
                    data-index={index}
                    value={link}
                    onChange={handleChange}
                    required
                  />
                  {formData.artworksLinks.length > 1 && (
                    <button
                      type="button"
                      className="remove-coll-btn"
                      onClick={() => handleRemoveArtworksLink(index)}
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
              <button type="button" className="add-coll-btn" onClick={handleAddArtworksLink}>
                Add
              </button>
            </div>
            {formData.isFromSoonaverse === 'yes' && (
              <div className='column flex mb25 w80'>
                <a
                  href="https://docs.google.com/spreadsheets/d/13K2zqutUYwECCWwENlT3Tm2VR7qy_lTR3wbPxbfqbs4/edit?gid=2065538264#gid=2065538264"
                  target="_blank"
                  rel="noopener noreferrer"
                  className='text-link blue mt5'
                >
                  SEE SOONAVERSE COLLECTION IDS
                </a>
              </div>
            )}
          </>
        )}
        <div className='column flex mb25 w80 mt15'>
          <label className='mb5'>SOCIAL MEDIA</label>
          <input type="url" name="twitter" placeholder="Link to Twitter" value={formData.twitter} onChange={handleChange} />
          <input type="url" name="instagram" placeholder="Link to Instagram" value={formData.instagram} onChange={handleChange} />
          <input type="url" name="website" placeholder="Link to Website" value={formData.website} onChange={handleChange} />
          <input type="url" name="behance" placeholder="Link to Behance" value={formData.behance} onChange={handleChange} />
          <input type="url" name="discord" placeholder="Link to Discord" value={formData.discord} onChange={handleChange} />
        </div>
        <div className='column flex mb25 w80'>
          <label className='mb5'>
            DESCRIPTION
            <span className="star-icon">*</span>
          </label>
          <textarea
            className='DescriptionInput'
            placeholder="Please provide a description of you and your Artworks.."
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
          />
        </div>
        <div className='column flex mb25 w80'>
          <label className='mb5'>ADDITIONAL INFORMATION</label>
          <textarea
            className='AdditionalInfoInput'
            placeholder="You can provide additional information here.."
            name="additionalInfo"
            value={formData.additionalInfo}
            onChange={handleChange}
          />
        </div>
        <div className='mb10'>
          <label>
            <input
              type="checkbox"
              name="agreeToTerms"
              checked={formData.agreeToTerms}
              onChange={handleChange}
              required
            />
            I agree to TANGLESPACE terms of use and privacy policy.
            <span className="star-icon">*</span>
          </label>
        </div>
        <button className='sendformbtn w50 img25' type="submit">
          {loading ? <img src="/basic-loading.gif" alt="Loading..." /> : 'SUBMIT FORM'}
        </button>
      </form>
    </div>
  );
}

export default KontaktFormular;
