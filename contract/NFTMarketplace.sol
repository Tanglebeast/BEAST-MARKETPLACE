// SPDX-License-Identifier: MIT

pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/IERC721Metadata.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract NFTMarketplace is Ownable, Pausable, ReentrancyGuard {

    constructor() Ownable(msg.sender) {}

    struct NFT {
        address contractAddress;
        uint256 tokenId;
        address payable seller;
        uint256 price;
    }

    NFT[] public nftsForSale;
    mapping(address => mapping(uint256 => uint256)) public nftPrice; // Mapping für die Preisabfrage
    mapping(address => string) public userNames; // Mapping für die Benutzernamen
    mapping(string => address) private userNameToAddress; // Mapping für die Überprüfung der Eindeutigkeit der Benutzernamen
    mapping(address => string) public userProfilePictures; // Mapping für die Profilbilder
    mapping(address => address) public collectionToArtistWallet;
    mapping(address => uint256) public collectionToArtistFee; // Neues Mapping für den Prozentsatz

    // Events
    event NFTListed(address indexed seller, address indexed contractAddress, uint256 tokenId, uint256 price);
    event NFTSold(address indexed buyer, address indexed seller, address indexed contractAddress, uint256 tokenId, uint256 price);
    event NFTListingCancelled(address indexed seller, address indexed contractAddress, uint256 tokenId);
    event UserNameChanged(address indexed user, string newUserName);
    event ProfilePictureChanged(address indexed user, string newProfilePicture);

    // Funktion, um den Vertrag zu pausieren
    function pause() external onlyOwner whenNotPaused {
        _pause();
    }

    // Funktion, um den Vertrag fortzusetzen
    function unpause() external onlyOwner whenPaused {
        _unpause();
    }

    // Funktion, um ein NFT zum Verkauf anzubieten
    function listNFT(address _contractAddress, uint256 _tokenId, uint256 _price) public whenNotPaused {
        IERC721 nft = IERC721(_contractAddress);
        require(nft.ownerOf(_tokenId) == msg.sender, "You are not the owner of this NFT");
        require(nft.isApprovedForAll(msg.sender, address(this)), "Contract not approved to transfer NFT");

        nftsForSale.push(NFT({
            contractAddress: _contractAddress,
            tokenId: _tokenId,
            seller: payable(msg.sender),
            price: _price
        }));

        // Mapping aktualisieren
        nftPrice[_contractAddress][_tokenId] = _price;

        emit NFTListed(msg.sender, _contractAddress, _tokenId, _price);
    }

    // Funktion, um ein NFT zu kaufen
     function buyNFT(uint256 _index) public payable whenNotPaused nonReentrant {
        require(_index < nftsForSale.length, "Invalid index");
        NFT memory nft = nftsForSale[_index];
        require(msg.value == nft.price, "Incorrect price sent");

        address artistWallet = collectionToArtistWallet[nft.contractAddress];
        uint256 artistFeePercent = collectionToArtistFee[nft.contractAddress];
        uint256 artistFee = (nft.price * artistFeePercent) / 100;
        uint256 sellerProceeds = nft.price - artistFee;

        require(nft.price >= artistFee, "Artist fee cannot be more than the price");

        if (artistWallet != address(0)) {
            payable(artistWallet).transfer(artistFee);
        }
        payable(nft.seller).transfer(sellerProceeds);

        // NFT transfer
        IERC721(nft.contractAddress).safeTransferFrom(nft.seller, msg.sender, nft.tokenId);

        emit NFTSold(msg.sender, nft.seller, nft.contractAddress, nft.tokenId, nft.price);
        delete nftPrice[nft.contractAddress][nft.tokenId];
        removeNFT(_index);
    }


    // Get all NFTs for sale
    function getNFTsForSale() public view returns (NFT[] memory) {
        return nftsForSale;
    }

    // Remove NFT from NFTs for sale list
    function cancelListing(uint256 _index) public whenNotPaused {
        require(_index < nftsForSale.length, "Invalid index");
        require(nftsForSale[_index].seller == msg.sender, "You are not the seller of this NFT");

        emit NFTListingCancelled(msg.sender, nftsForSale[_index].contractAddress, nftsForSale[_index].tokenId);

        // Set price in mapping on 0
        delete nftPrice[nftsForSale[_index].contractAddress][nftsForSale[_index].tokenId];

        removeNFT(_index);
    }

    // Remove NFT from NFTs for sale list
    function removeNFT(uint256 _index) internal {
        require(_index < nftsForSale.length, "Invalid index");
        nftsForSale[_index] = nftsForSale[nftsForSale.length - 1];
        nftsForSale.pop();
    }

    // Get the details of an NFT
    function getNFTDetails(address _contractAddress, uint256 _tokenId) public view returns (string memory name, string memory symbol, string memory tokenURI, address owner, uint256 price) {
        IERC721Metadata nft = IERC721Metadata(_contractAddress);
        
        name = nft.name();
        symbol = nft.symbol();
        tokenURI = nft.tokenURI(_tokenId);
        owner = nft.ownerOf(_tokenId);
        price = nftPrice[_contractAddress][_tokenId]; // Preis aus dem Mapping abrufen
    }

    // Get NFT Index
    function getNFTIndex(address _contractAddress, uint256 _tokenId) public view returns (uint256) {
        for (uint256 i = 0; i < nftsForSale.length; i++) {
            if (nftsForSale[i].contractAddress == _contractAddress && nftsForSale[i].tokenId == _tokenId) {
                return i;
            }
        }
        revert("NFT not found in sale list");
    }

    // Change username
    function changeUserName(string calldata newUserName) public whenNotPaused {
        require(bytes(newUserName).length > 0, "UserName cannot be empty");
        require(userNameToAddress[newUserName] == address(0) || userNameToAddress[newUserName] == msg.sender, "UserName already taken");

        // Remove username
        string memory oldUserName = userNames[msg.sender];
        if (bytes(oldUserName).length > 0) {
            delete userNameToAddress[oldUserName];
        }

        // Set new username
        userNames[msg.sender] = newUserName;
        userNameToAddress[newUserName] = msg.sender;

        emit UserNameChanged(msg.sender, newUserName);
    }

    // Call username
    function getUserName(address user) public view returns (string memory) {
        return userNames[user];
    }

    // Change profileimage
    function setProfilePicture(address _contractAddress, uint256 _tokenId, string memory _imageUrl) public whenNotPaused {
        IERC721 nft = IERC721(_contractAddress);
        require(nft.ownerOf(_tokenId) == msg.sender, "You are not the owner of this NFT");

        userProfilePictures[msg.sender] = _imageUrl;

        emit ProfilePictureChanged(msg.sender, _imageUrl);
    }

    // Call profileimage
    function getProfilePicture(address user) public view returns (string memory) {
        return userProfilePictures[user];
    }

    // Set Artistfees
    function setArtistWallet(address _contractAddress, address _artistWallet, uint256 _artistFeePercent) external onlyOwner {
        require(_artistFeePercent <= 100, "Artist fee percent must be between 0 and 100");
        collectionToArtistWallet[_contractAddress] = _artistWallet;
        collectionToArtistFee[_contractAddress] = _artistFeePercent;
    }
}
