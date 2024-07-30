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
  const navigate = useNavigate();

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
      try {
        const uniqueOwners = new Map();

        for (const collection of nftCollections) {
          const allNFTs = await fetchAllNFTs(collection.address, marketplace); 
          allNFTs.forEach(nft => {
            const owner = nft.owner.toLowerCase();
            if (uniqueOwners.has(owner)) {
              uniqueOwners.get(owner).count += 1;
            } else {
              uniqueOwners.set(owner, { count: 1 });
            }
          });
        }

        const ownerArray = [...uniqueOwners.keys()];

        const ownersWithNamesAndPictures = await Promise.all(ownerArray.map(async (owner) => {
          try {
            const userName = await getUserName(owner, marketplace);
            const profilePicture = await getProfilePicture(owner, marketplace);
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
        }));

        setUsers(ownersWithNamesAndPictures);
        setFilteredUsers(ownersWithNamesAndPictures);
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
  };

  return (
    <div className="all-users">
      <div className="loading-container">
        {loading ? (
          <img src="./loading.gif" alt="Loading" className="loading-gif" />
        ) : error ? (
          <div>{error}</div>
        ) : (
          <>
            <div className='flex w100 mt10'>
                <div className='w20'>
                    <UsersFilter onFilterChange={handleFilterChange} />
                </div>
                <div className='flex-start flex column ml20 w100'>
                  <div className='flex-start flex column w90'>
                    <h1 className='mt0 s24'>USERS</h1>
                    <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
                  </div>
                  <div className="users-list">
                    {filteredUsers.map((user, index) => (
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
                        <h2>
                          {user.name.startsWith('0x') ? <ShortenAddress address={user.name} /> : user.name}
                        </h2>
                        <p>{user.nftCount} NFTs</p>
                      </div>
                    ))}
                  </div>
                </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AllUsers;
