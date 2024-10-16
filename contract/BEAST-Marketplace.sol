// SPDX-License-Identifier: MIT

pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/IERC721Metadata.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/IERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract NFTMarketplace is Ownable, Pausable, ReentrancyGuard {

    // Constants for payment tokens
    address public constant NATIVE_TOKEN_ADDRESS = address(0);
    address public constant SPECIAL_TOKEN_ADDRESS = 0x6852f7B4ba44667F2Db80E6f3A9f8A173b03cD15;

    constructor() Ownable(msg.sender) {}

    struct NFT {
        address contractAddress;
        uint256 tokenId;
        address payable seller;
        uint256 price;
        address paymentToken;
    }

    // Neue Struktur für Verkaufsinformationen
    struct Sale {
        uint256 timestamp;
        uint256 price;
        address paymentToken;
    }

    NFT[] public nftsForSale;
    mapping(address => mapping(uint256 => uint256)) public nftPrice;
    mapping(address => string) public userNames;
    mapping(string => address) private userNameToAddress;
    mapping(address => string) public userProfilePictures;
    mapping(address => address) public collectionToArtistWallet;
    mapping(address => uint256) public collectionToArtistFee;

    mapping(address => uint256) public collectionVolumeNative;
    mapping(address => uint256) public collectionVolumeSpecialToken;

    mapping(address => mapping(uint256 => uint256[])) public saleHistory;

    // Mappings für die Like-Funktionalität
    mapping(address => mapping(address => bool)) public userLikes; // user address => collection address => liked
    mapping(address => uint256) public collectionLikes; // collection address => number of likes

    // Neues Mapping für Verkäufe pro Kollektion
    mapping(address => Sale[]) public collectionSales;

    event NFTListed(address indexed seller, address indexed contractAddress, uint256 tokenId, uint256 price, address paymentToken);
    event NFTSold(address indexed buyer, address indexed seller, address indexed contractAddress, uint256 tokenId, uint256 price, address paymentToken);
    event NFTListingCancelled(address indexed seller, address indexed contractAddress, uint256 tokenId);
    event UserNameChanged(address indexed user, string newUserName);
    event ProfilePictureChanged(address indexed user, string newProfilePicture);
    event CollectionLiked(address indexed user, address indexed collection);
    event CollectionUnliked(address indexed user, address indexed collection);
    // Neues Event für Verkaufsaufzeichnung
    event SaleRecorded(address indexed collection, uint256 price, address paymentToken);

    function pause() external onlyOwner whenNotPaused {
        _pause();
    }

    function unpause() external onlyOwner whenPaused {
        _unpause();
    }

    function listNFT(address _contractAddress, uint256 _tokenId, uint256 _price, address _paymentToken) public whenNotPaused {
        IERC721 nft = IERC721(_contractAddress);
        
        require(nft.ownerOf(_tokenId) == msg.sender, "You are not the owner of this NFT");
        require(nft.isApprovedForAll(msg.sender, address(this)), "Contract not approved to transfer NFT");
        require(_price > 0, "Price must be greater than zero");
        require(_paymentToken == NATIVE_TOKEN_ADDRESS || _paymentToken == SPECIAL_TOKEN_ADDRESS, "Invalid payment token");

        nftsForSale.push(NFT({
            contractAddress: _contractAddress,
            tokenId: _tokenId,
            seller: payable(msg.sender),
            price: _price,
            paymentToken: _paymentToken
        }));

        nftPrice[_contractAddress][_tokenId] = _price;
        emit NFTListed(msg.sender, _contractAddress, _tokenId, _price, _paymentToken);
    }

    function buyNFT(uint256 _index) public payable whenNotPaused nonReentrant {
        require(_index < nftsForSale.length, "Invalid index");
        NFT memory nft = nftsForSale[_index];

        address artistWallet = collectionToArtistWallet[nft.contractAddress];
        uint256 artistFeePercent = collectionToArtistFee[nft.contractAddress];
        uint256 artistFee;

        if (nft.paymentToken == NATIVE_TOKEN_ADDRESS) {
            require(msg.value == nft.price, "Incorrect Ether value sent");

            if (artistWallet != address(0) && artistFeePercent > 0) {
                artistFee = (msg.value * artistFeePercent) / 100;
                uint256 halfArtistFee = artistFee / 2;

                (bool successOwner, ) = owner().call{value: halfArtistFee}("");
                require(successOwner, "Owner fee transfer failed");

                (bool successArtist, ) = artistWallet.call{value: halfArtistFee}("");
                require(successArtist, "Artist fee transfer failed");
            }

            (bool successSeller, ) = nft.seller.call{value: msg.value - artistFee}("");
            require(successSeller, "Ether transfer to seller failed");

            collectionVolumeNative[nft.contractAddress] += msg.value;
        } else {
            require(IERC20(nft.paymentToken).balanceOf(msg.sender) >= nft.price, "Insufficient token balance");
            require(IERC20(nft.paymentToken).allowance(msg.sender, address(this)) >= nft.price, "Insufficient token allowance");

            require(IERC20(nft.paymentToken).transferFrom(msg.sender, nft.seller, nft.price), "Token transfer to seller failed");

            collectionVolumeSpecialToken[nft.contractAddress] += nft.price;
        }

        IERC721(nft.contractAddress).safeTransferFrom(nft.seller, msg.sender, nft.tokenId);
        emit NFTSold(msg.sender, nft.seller, nft.contractAddress, nft.tokenId, nft.price, nft.paymentToken);
        
        saleHistory[nft.contractAddress][nft.tokenId].push(nft.price);

        // Neue Verkaufsinformation hinzufügen
        collectionSales[nft.contractAddress].push(Sale({
            timestamp: block.timestamp,
            price: nft.price,
            paymentToken: nft.paymentToken
        }));
        emit SaleRecorded(nft.contractAddress, nft.price, nft.paymentToken);

        removeNFT(_index);
    }

    function getNFTsForSale() public view returns (NFT[] memory) {
        return nftsForSale;
    }

    function cancelListing(uint256 _index) public whenNotPaused {
        require(_index < nftsForSale.length, "Invalid index");
        require(nftsForSale[_index].seller == msg.sender, "You are not the seller of this NFT");

        emit NFTListingCancelled(msg.sender, nftsForSale[_index].contractAddress, nftsForSale[_index].tokenId);

        address contractAddress = nftsForSale[_index].contractAddress;
        delete nftPrice[contractAddress][nftsForSale[_index].tokenId];
        removeNFT(_index);
    }

    function removeNFT(uint256 _index) internal {
        require(_index < nftsForSale.length, "Invalid index");
        nftsForSale[_index] = nftsForSale[nftsForSale.length - 1];
        nftsForSale.pop();
    }

    function setArtistWallet(address _collectionAddress, address _artistWallet, uint256 _artistFeePercent) external onlyOwner {
        require(_collectionAddress != address(0), "Invalid collection address");
        require(_artistWallet != address(0), "Invalid artist wallet address");
        require(_artistFeePercent <= 100, "Fee percent must be between 0 and 100");

        collectionToArtistWallet[_collectionAddress] = _artistWallet;
        collectionToArtistFee[_collectionAddress] = _artistFeePercent;
    }

    function getNFTDetails(address _contractAddress, uint256 _tokenId) public view returns (string memory name, string memory symbol, string memory tokenURI, address owner, uint256 price, address paymentToken) {
        IERC721Metadata nft = IERC721Metadata(_contractAddress);
        
        name = nft.name();
        symbol = nft.symbol();
        tokenURI = nft.tokenURI(_tokenId);
        owner = nft.ownerOf(_tokenId);
        
        for (uint256 i = 0; i < nftsForSale.length; i++) {
            if (nftsForSale[i].contractAddress == _contractAddress && nftsForSale[i].tokenId == _tokenId) {
                price = nftsForSale[i].price;
                paymentToken = nftsForSale[i].paymentToken;
                break;
            }
        }
    }

    function getNFTIndex(address _contractAddress, uint256 _tokenId) public view returns (uint256) {
        for (uint256 i = 0; i < nftsForSale.length; i++) {
            if (nftsForSale[i].contractAddress == _contractAddress && nftsForSale[i].tokenId == _tokenId) {
                return i;
            }
        }
        revert("NFT not found in sale list");
    }

    function changeUserName(string calldata newUserName) public whenNotPaused {
        require(bytes(newUserName).length > 0, "UserName cannot be empty");
        require(userNameToAddress[newUserName] == address(0) || userNameToAddress[newUserName] == msg.sender, "UserName already taken");

        string memory oldUserName = userNames[msg.sender];
        if (bytes(oldUserName).length > 0) {
            delete userNameToAddress[oldUserName];
        }

        userNames[msg.sender] = newUserName;
        userNameToAddress[newUserName] = msg.sender;

        emit UserNameChanged(msg.sender, newUserName);
    }

    function getUserName(address user) public view returns (string memory) {
        return userNames[user];
    }

    function setProfilePicture(address _contractAddress, uint256 _tokenId, string memory _imageUrl) public whenNotPaused {
        IERC721 nft = IERC721(_contractAddress);
        require(nft.ownerOf(_tokenId) == msg.sender, "You are not the owner of this NFT");

        userProfilePictures[msg.sender] = _imageUrl;

        emit ProfilePictureChanged(msg.sender, _imageUrl);
    }

    function getProfilePicture(address user) public view returns (string memory) {
        return userProfilePictures[user];
    }

    function getCollectionVolumeNative(address _collectionAddress) public view returns (uint256) {
        return collectionVolumeNative[_collectionAddress];
    }

    function getCollectionVolumeSpecialToken(address _collectionAddress) public view returns (uint256) {
        return collectionVolumeSpecialToken[_collectionAddress];
    }

    function getSaleHistory(address _contractAddress, uint256 _tokenId) public view returns (uint256[] memory) {
        return saleHistory[_contractAddress][_tokenId];
    }

    function likeCollection(address _collectionAddress) public whenNotPaused {
        require(_collectionAddress != address(0), "Invalid collection address");
        require(!userLikes[msg.sender][_collectionAddress], "Collection already liked");

        userLikes[msg.sender][_collectionAddress] = true;
        collectionLikes[_collectionAddress]++;

        emit CollectionLiked(msg.sender, _collectionAddress);
    }

    function unlikeCollection(address _collectionAddress) public whenNotPaused {
        require(_collectionAddress != address(0), "Invalid collection address");
        require(userLikes[msg.sender][_collectionAddress], "Collection not liked");

        userLikes[msg.sender][_collectionAddress] = false;
        collectionLikes[_collectionAddress]--;

        emit CollectionUnliked(msg.sender, _collectionAddress);
    }

    function getCollectionLikes(address _collectionAddress) public view returns (uint256) {
        return collectionLikes[_collectionAddress];
    }

    function hasUserLikedCollection(address _user, address _collectionAddress) public view returns (bool) {
        return userLikes[_user][_collectionAddress];
    }

    // Neue Funktion zum Abrufen der Verkäufe einer Kollektion
    function getCollectionSales(address _collectionAddress) public view returns (Sale[] memory) {
        return collectionSales[_collectionAddress];
    }
}