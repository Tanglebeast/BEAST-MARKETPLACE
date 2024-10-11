import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import { fetchAllNFTs, getUserName, getProfilePicture, getMaxSupply } from '../components/utils';
import '../styles/ArtworkOwnerRanking.css';
import ShortenAddress from './ShortenAddress';

const web3 = new Web3(window.ethereum);

const ArtworkOwnerRanking = ({ collectionAddress, marketplace }) => {
  const [ownerData, setOwnerData] = useState([]);
  const [totalSupply, setTotalSupply] = useState(0);
  const [loading, setLoading] = useState(true); // Ladezustand hinzufügen

  useEffect(() => {
    const fetchOwnerData = async () => {
      try {
        // Hole die maximale Anzahl an NFTs und wandle sie in eine Zahl um
        const maxSupply = await getMaxSupply(collectionAddress);
        setTotalSupply(Number(maxSupply) || 0); // Fallback auf 0, falls maxSupply null oder ungültig ist

        const allNFTs = await fetchAllNFTs(collectionAddress, web3);

        const ownerCount = allNFTs.reduce((acc, nft) => {
          acc[nft.owner] = (acc[nft.owner] || 0) + 1;
          return acc;
        }, {});

        // Hole die Benutzernamen und Profilbilder für alle Besitzer
        const owners = Object.keys(ownerCount);
        const ownerUsernames = await Promise.all(
          owners.map(owner => getUserName(owner, marketplace))
        );
        const ownerProfilePictures = await Promise.all(
          owners.map(owner => getProfilePicture(owner, marketplace))
        );

        const sortedOwners = Object.entries(ownerCount)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 10)
          .map(([owner, count], index) => ({
            owner,
            username: ownerUsernames[owners.indexOf(owner)] || '', // Sicherstellen, dass der Index korrekt ist
            profilePicture: ownerProfilePictures[owners.indexOf(owner)] || '/placeholder-PFP-black.png',
            count,
            percentage: (count / Number(maxSupply)) * 100, // Verwendung von maxSupply als Zahl
          }));

        setOwnerData(sortedOwners);
      } catch (error) {
        console.error('Error fetching owner data:', error);
      } finally {
        setLoading(false); // Ladezustand beenden
      }
    };

    fetchOwnerData();
  }, [collectionAddress, marketplace]);

  return (
    <div className="artwork-owner-ranking">
      <h2 className='mt5'>Top Owners</h2>
      {loading ? (
        <div className="loading-container">
          <img src="/basic-loading.gif" alt="Loading..." className="loading-gif" />
        </div>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Owner</th>
              <th>Owned</th>
            </tr>
          </thead>
          <tbody>
            {ownerData.map(({ owner, username, profilePicture, count, percentage }) => (
              <tr key={owner}>
                <td className='VisibleLink'>
                  <div className='OwnerInfoDiv padding2'>
                    <img src={profilePicture} alt={username} className="owner-profile-picture" />
                    <a href={`/users/${owner}`} className='pointer'>{username || <ShortenAddress address={owner} />}</a>
                  </div>
                </td>
                <td>{count} NFTs</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ArtworkOwnerRanking;
