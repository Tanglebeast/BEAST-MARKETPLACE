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

    struct HourlyPriceInfo {
        uint256 timestamp;
        uint256 averagePrice;
        uint256 totalSales;
        uint256 floorPrice;
    }

    NFT[] public nftsForSale;
    mapping(address => mapping(uint256 => uint256)) public nftPrice;
    mapping(address => string) public userNames;
    mapping(string => address) private userNameToAddress;
    mapping(address => string) public userProfilePictures;
    mapping(address => address) public collectionToArtistWallet;
    mapping(address => uint256) public collectionToArtistFee;
    mapping(address => HourlyPriceInfo[]) public collectionPriceHistory;

    uint256 public constant HISTORY_HOURS = 720;

    event NFTListed(address indexed seller, address indexed contractAddress, uint256 tokenId, uint256 price);
    event NFTSold(address indexed buyer, address indexed seller, address indexed contractAddress, uint256 tokenId, uint256 price);
    event NFTListingCancelled(address indexed seller, address indexed contractAddress, uint256 tokenId);
    event UserNameChanged(address indexed user, string newUserName);
    event ProfilePictureChanged(address indexed user, string newProfilePicture);

    function pause() external onlyOwner whenNotPaused {
        _pause();
    }

    function unpause() external onlyOwner whenPaused {
        _unpause();
    }

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

        nftPrice[_contractAddress][_tokenId] = _price;

        updateFloorPrice(_contractAddress);

        emit NFTListed(msg.sender, _contractAddress, _tokenId, _price);
    }

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

    IERC721(nft.contractAddress).safeTransferFrom(nft.seller, msg.sender, nft.tokenId);

    emit NFTSold(msg.sender, nft.seller, nft.contractAddress, nft.tokenId, nft.price);

    // Update average price on sale
    updateAveragePriceOnSale(nft.contractAddress, nft.price);

    // Remove the sold NFT from the sale list
    delete nftPrice[nft.contractAddress][nft.tokenId];
    removeNFT(_index);

    // Update the floor price after removing the sold NFT
    updateFloorPrice(nft.contractAddress);
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

        updateFloorPrice(contractAddress);
    }

    function removeNFT(uint256 _index) internal {
        require(_index < nftsForSale.length, "Invalid index");
        nftsForSale[_index] = nftsForSale[nftsForSale.length - 1];
        nftsForSale.pop();
    }

    function getNFTDetails(address _contractAddress, uint256 _tokenId) public view returns (string memory name, string memory symbol, string memory tokenURI, address owner, uint256 price) {
        IERC721Metadata nft = IERC721Metadata(_contractAddress);
        
        name = nft.name();
        symbol = nft.symbol();
        tokenURI = nft.tokenURI(_tokenId);
        owner = nft.ownerOf(_tokenId);
        price = nftPrice[_contractAddress][_tokenId];
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

    function setArtistWallet(address _contractAddress, address _artistWallet, uint256 _artistFeePercent) external onlyOwner {
        require(_artistFeePercent <= 100, "Artist fee percent must be between 0 and 100");
        collectionToArtistWallet[_contractAddress] = _artistWallet;
        collectionToArtistFee[_contractAddress] = _artistFeePercent;
    }

    function calculateCurrentFloorPrice(address _contractAddress) internal view returns (uint256) {
        uint256 floorPrice = type(uint256).max;
        for (uint256 i = 0; i < nftsForSale.length; i++) {
            if (nftsForSale[i].contractAddress == _contractAddress && nftsForSale[i].price < floorPrice) {
                floorPrice = nftsForSale[i].price;
            }
        }
        return floorPrice == type(uint256).max ? 0 : floorPrice;
    }

    function updateFloorPrice(address _contractAddress) internal {
        uint256 currentHour = block.timestamp - (block.timestamp % 1 hours);
        HourlyPriceInfo[] storage history = collectionPriceHistory[_contractAddress];

        uint256 newFloorPrice = calculateCurrentFloorPrice(_contractAddress);

        // Fall, wenn keine Transaktion in dieser Stunde stattfand
        if (history.length > 0 && history[history.length - 1].timestamp == currentHour) {
            history[history.length - 1].floorPrice = newFloorPrice;
        } else {
            // Wenn keine neuen Transaktionen, übernehme den Floorpreis aus der letzten Stunde
            uint256 lastFloorPrice = history.length > 0 ? history[history.length - 1].floorPrice : 0;

            if (history.length == HISTORY_HOURS) {
                for (uint i = 1; i < HISTORY_HOURS; i++) {
                    history[i - 1] = history[i];
                }
                history.pop();
            }
            history.push(HourlyPriceInfo(currentHour, 0, 0, newFloorPrice > 0 ? newFloorPrice : lastFloorPrice));
        }
    }


    function updateAveragePriceOnSale(address _contractAddress, uint256 _price) internal {
        uint256 currentHour = block.timestamp - (block.timestamp % 1 hours);
        HourlyPriceInfo[] storage history = collectionPriceHistory[_contractAddress];

        if (history.length == 0 || history[history.length - 1].timestamp < currentHour) {
            if (history.length == HISTORY_HOURS) {
                for (uint i = 1; i < HISTORY_HOURS; i++) {
                    history[i - 1] = history[i];
                }
                history.pop();
            }
            history.push(HourlyPriceInfo(currentHour, _price, 1, calculateCurrentFloorPrice(_contractAddress)));
        } else {
            HourlyPriceInfo storage currentHourInfo = history[history.length - 1];
            currentHourInfo.averagePrice = (currentHourInfo.averagePrice * currentHourInfo.totalSales + _price) / (currentHourInfo.totalSales + 1);
            currentHourInfo.totalSales++;
        }
    }

    function getAveragePriceInPeriod(address _contractAddress, uint256 _startTime, uint256 _endTime) public view returns (uint256) {
        HourlyPriceInfo[] memory history = collectionPriceHistory[_contractAddress];
        uint256 totalPrice = 0;
        uint256 totalSales = 0;
        
        for (uint256 i = 0; i < history.length; i++) {
            if (history[i].timestamp >= _startTime && history[i].timestamp <= _endTime) {
                totalPrice += history[i].averagePrice * history[i].totalSales;
                totalSales += history[i].totalSales;
            }
        }
        
        if (totalSales == 0) return 0;
        return totalPrice / totalSales;
    }

    function getFloorPriceInPeriod(address _contractAddress, uint256 _startTime, uint256 _endTime) public view returns (uint256) {
        HourlyPriceInfo[] memory history = collectionPriceHistory[_contractAddress];
        uint256 floorPrice = type(uint256).max;
        
        for (uint256 i = 0; i < history.length; i++) {
            if (history[i].timestamp >= _startTime && history[i].timestamp <= _endTime && history[i].floorPrice < floorPrice) {
                floorPrice = history[i].floorPrice;
            }
        }
        
        if (floorPrice == type(uint256).max) return 0;
        return floorPrice;
    }

    function getTotalSalesInPeriod(address _contractAddress, uint256 _startTime, uint256 _endTime) public view returns (uint256) {
        HourlyPriceInfo[] memory history = collectionPriceHistory[_contractAddress];
        uint256 totalSales = 0;

        for (uint256 i = 0; i < history.length; i++) {
            if (history[i].timestamp >= _startTime && history[i].timestamp <= _endTime) {
                totalSales += history[i].totalSales;
            }
        }

        return totalSales;
    }
}