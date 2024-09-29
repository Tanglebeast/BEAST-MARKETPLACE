import React, { useEffect, useState } from 'react';
import { fetchAllNFTs, getUserName, initializeMarketplace, getProfilePicture } from '../components/utils'; 
import { nftCollections } from '../NFTCollections';
import ShortenAddress from '../components/ShortenAddress';
import { useNavigate } from 'react-router-dom';
import '../styles/AllUsers.css';
import UsersFilter from '../components/UsersFilter';
import SearchBar from '../components/SearchBar';

const placeholderImage = './placeholder-PFP.png';

const AllUsers = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [marketplace, setMarketplace] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({ nftcount: [], availability: [] });
  const [currentPage, setCurrentPage] = useState(1);
  const [loadedBatches, setLoadedBatches] = useState(1); // Für den Fortschrittsbalken
  const [totalBatches, setTotalBatches] = useState(1); // Gesamtanzahl der Chargen
  const [backgroundLoading, setBackgroundLoading] = useState(false);
  const navigate = useNavigate();

  const resultsPerPage = 5; // Anzahl der Benutzer pro Seite

  useEffect(() => {
    const setupMarketplace = async () => {
      try {
        await initializeMarketplace(setMarketplace, () => {});
      } catch (err) {
        console.error('Failed to initialize marketplace:', err);
      }
    };
    setupMarketplace();
  }, []);

  useEffect(() => {
    if (!marketplace) return;

    const fetchUsers = async () => {
      setLoading(true);
      setLoadedBatches(0);
      setTotalBatches(1); // Resetten der Batches

      try {
        const uniqueOwners = new Map();

        // Parallelisierung der Anfragen für alle Sammlungen
        await Promise.all(
          nftCollections.map(async (collection) => {
            const allNFTs = await fetchAllNFTs(collection.address, marketplace);
            allNFTs.forEach(nft => {
              const owner = nft.owner.toLowerCase();
              if (uniqueOwners.has(owner)) {
                uniqueOwners.get(owner).count += 1;
              } else {
                uniqueOwners.set(owner, { count: 1 });
              }
            });
          })
        );

        const ownerArray = [...uniqueOwners.keys()];
        const batches = Math.ceil(ownerArray.length / resultsPerPage);
        setTotalBatches(batches); // Setzen der Gesamtanzahl der Batches

        const fetchOwnerDetails = async (ownersBatch) => {
          return await Promise.all(
            ownersBatch.map(async (owner) => {
              try {
                const [userName, profilePicture] = await Promise.all([
                  getUserName(owner, marketplace),
                  getProfilePicture(owner, marketplace)
                ]);
                const nftCount = uniqueOwners.get(owner).count;
                return { 
                  address: owner, 
                  name: userName || owner, 
                  profilePicture: profilePicture || placeholderImage,
                  nftCount
                };
              } catch (err) {
                return { 
                  address: owner, 
                  name: owner, 
                  profilePicture: placeholderImage,
                  nftCount: uniqueOwners.get(owner).count
                };
              }
            })
          );
        };

        // Initial-Load der ersten 30 Benutzer
        const firstBatchOwners = ownerArray.slice(0, resultsPerPage);
        const firstBatchDetails = await fetchOwnerDetails(firstBatchOwners);

        setUsers(firstBatchDetails); // Sofortige Anzeige der ersten Benutzer
        setLoadedBatches(1);
        setBackgroundLoading(true);

        // Hintergrundladen der restlichen Benutzer
        for (let batch = 1; batch < batches; batch++) {
          const start = batch * resultsPerPage;
          const batchOwners = ownerArray.slice(start, start + resultsPerPage);
          const batchDetails = await fetchOwnerDetails(batchOwners);

          setUsers(prevUsers => {
            const mergedUsers = [...prevUsers, ...batchDetails];
            const uniqueUsers = mergedUsers.filter((user, index, self) =>
              index === self.findIndex(u => u.address === user.address)
            );
            return uniqueUsers;
          });

          setLoadedBatches(batch + 1);
        }

        setBackgroundLoading(false);
      } catch (error) {
        setError('Failed to fetch NFT owners');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [marketplace]);

  useEffect(() => {
    let updatedUsers = [...users];

    // Filter by NFT Count
    if (filters.nftcount.length > 0) {
      const sortOption = filters.nftcount[0];
      if (sortOption === 'LOW TO HIGH') {
        updatedUsers.sort((a, b) => a.nftCount - b.nftCount);
      } else if (sortOption === 'HIGH TO LOW') {
        updatedUsers.sort((a, b) => b.nftCount - a.nftCount);
      }
    }

    // Filter by Availability
    if (filters.availability.includes('NAMES')) {
      updatedUsers = updatedUsers.filter(user => user.name !== user.address);
    }
    if (filters.availability.includes('PFPS')) {
      updatedUsers = updatedUsers.filter(user => user.profilePicture !== placeholderImage);
    }

    // Search Filter
    if (searchQuery) {
      updatedUsers = updatedUsers.filter(user =>
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.address.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredUsers(updatedUsers);
  }, [filters, searchQuery, users]);

  const handleUserClick = (address) => {
    navigate(`/users/${address}`);
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setCurrentPage(1); // Zurücksetzen der Seite beim Ändern der Filter
  };

  const displayedUsers = filteredUsers.slice((currentPage - 1) * resultsPerPage, currentPage * resultsPerPage);

  const totalPages = Math.ceil(filteredUsers.length / resultsPerPage);

  // Berechnung des Fortschrittsbalken
  const progressPercentage = totalBatches > 0 ? (loadedBatches / totalBatches) * 100 : 0;

  return (
    <div className="all-users">
      {loading ? (
        <div className="loading-container">
          <img src="./loading.gif" alt="Loading" className="loading-gif" />
        </div>
      ) : error ? (
        <div>{error}</div>
      ) : (
        <>
          <div className='flex w100 mt10 myNFTMainDivMedia'>
            <h1 className='mt0 s24 onlymedia'>USERS</h1>
            <div className='w20 ButtonandFilterMedia'>
              <UsersFilter onFilterChange={handleFilterChange} />
            </div>
            <div className='flex-start flex column ml20 w100 AllUser-List-Media'>
              <div className='flex-start flex column w90'>
                <h1 className='mt0 s24 OnlyDesktop'>USERS</h1>
                <div className='w30 w100media'>
                  <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
                </div>
              </div>
              <div className="users-list">
                {displayedUsers.map((user, index) => (
                  <div 
                    className="user-card flex column" 
                    key={index} 
                    onClick={() => handleUserClick(user.address)}
                  >
                    <div className='UserImageDiv'>
                      <img 
                        className="profile-picture" 
                        src={user.profilePicture} 
                        alt={user.name} 
                      />
                    </div>
                    <div className='text-align-left w95 mb5'>
                      <h3 className='mb10 blue'>
                        {user.name.startsWith('0x') ? <ShortenAddress address={user.name} /> : user.name}
                      </h3>
                      <span className='grey'>{user.nftCount} NFTs</span>
                    </div>
                  </div>
                ))}
              </div>
              {/* Paginierung */}
              <div className="custom-pagination">
                <button 
                  className="custom-pagination-btn previous-btn"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} 
                  disabled={currentPage === 1}
                >
                  &lt;
                </button>
                <span className="custom-pagination-info">
                  {currentPage} OF {totalPages}
                </span>
                <button 
                  className="custom-pagination-btn next-btn"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} 
                  disabled={currentPage === totalPages}
                >
                  &gt;
                </button>
              </div>
              {/* Fortschrittsbalken */}
              {(loading || backgroundLoading) && (
                <div className="progress-bar-container">
                  <div 
                    className="progress-bar" 
                    style={{ width: `${progressPercentage}%` }}
                  ></div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AllUsers;
