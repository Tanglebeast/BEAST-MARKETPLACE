// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

contract SocialMediaProfile {
    IERC721 public nftContract;

    struct SocialLinks {
        string twitter;
        string instagram;
        string discord;
        string bio;
    }

    struct NFT {
        address contractAddress;
        uint256 tokenId;
    }

    mapping(address => SocialLinks) private userProfiles;
    mapping(address => NFT[]) private userWatchlists;
    mapping(address => mapping(uint256 => uint256)) private nftWatchlistCounts;
    mapping(address => mapping(address => mapping(uint256 => bool))) private userWatchlistFlags;

    event ProfileUpdated(address indexed user, string twitter, string instagram, string discord, string bio);
    event ProfileRemoved(address indexed user);
    event NFTAddedToWatchlist(address indexed user, address contractAddress, uint256 tokenId);
    event NFTRemovedFromWatchlist(address indexed user, address contractAddress, uint256 tokenId);

    constructor(address _nftContractAddress) {
        nftContract = IERC721(_nftContractAddress);
    }

    modifier onlyNFTHolder() {
        require(nftContract.balanceOf(msg.sender) > 0, "Must own at least one NFT to perform this action");
        _;
    }

    // Funktion zum Aktualisieren des Profils
    function updateProfile(
        string memory twitter,
        string memory instagram,
        string memory discord,
        string memory bio
    ) public onlyNFTHolder {
        userProfiles[msg.sender] = SocialLinks(twitter, instagram, discord, bio);
        emit ProfileUpdated(msg.sender, twitter, instagram, discord, bio);
    }

    // Funktion zum Entfernen des Profils
    function removeProfile() public onlyNFTHolder {
        delete userProfiles[msg.sender];
        emit ProfileRemoved(msg.sender);
    }

    // Funktion zum Abrufen des Profils
    function getProfile(address user)
        public
        view
        returns (
            string memory twitter,
            string memory instagram,
            string memory discord,
            string memory bio
        )
    {
        SocialLinks storage links = userProfiles[user];
        return (links.twitter, links.instagram, links.discord, links.bio);
    }

    // Funktion zum Hinzufügen eines NFTs zur Watchlist
    function addToWatchlist(address _contractAddress, uint256 _tokenId) public onlyNFTHolder {
        require(!userWatchlistFlags[msg.sender][_contractAddress][_tokenId], "NFT already in watchlist");

        userWatchlistFlags[msg.sender][_contractAddress][_tokenId] = true;

        NFT memory newNFT = NFT(_contractAddress, _tokenId);
        userWatchlists[msg.sender].push(newNFT);

        nftWatchlistCounts[_contractAddress][_tokenId] += 1;

        emit NFTAddedToWatchlist(msg.sender, _contractAddress, _tokenId);
    }

    // Funktion zum Entfernen eines NFTs aus der Watchlist
    function removeFromWatchlist(address _contractAddress, uint256 _tokenId) public onlyNFTHolder {
        require(userWatchlistFlags[msg.sender][_contractAddress][_tokenId], "NFT not in watchlist");

        userWatchlistFlags[msg.sender][_contractAddress][_tokenId] = false;

        NFT[] storage watchlist = userWatchlists[msg.sender];
        for (uint256 i = 0; i < watchlist.length; i++) {
            if (watchlist[i].contractAddress == _contractAddress && watchlist[i].tokenId == _tokenId) {
                // Entferne das NFT aus der Watchlist
                watchlist[i] = watchlist[watchlist.length - 1];
                watchlist.pop();
                break;
            }
        }

        nftWatchlistCounts[_contractAddress][_tokenId] -= 1;

        emit NFTRemovedFromWatchlist(msg.sender, _contractAddress, _tokenId);
    }

    // Funktion zum Abrufen der Watchlist eines Benutzers
    function getWatchlist(address user) public view returns (NFT[] memory) {
        return userWatchlists[user];
    }

    // NEUE FUNKTION: Anzahl der Benutzer, die ein NFT zur Watchlist hinzugefügt haben
    function getNFTWatchlistCount(address _contractAddress, uint256 _tokenId) public view returns (uint256) {
        return nftWatchlistCounts[_contractAddress][_tokenId];
    }

     function isNFTInWatchlist(address user, address _contractAddress, uint256 _tokenId) public view returns (bool) {
        return userWatchlistFlags[user][_contractAddress][_tokenId];
    }
}
