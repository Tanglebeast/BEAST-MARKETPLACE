// SPDX-License-Identifier: MIT
// Made by @Web3Club

pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract FreeMintToken is ERC721, ERC721URIStorage, Pausable, Ownable {
    uint256 public constant USER_LIMIT = 10;
    uint256 public constant MAX_SUPPLY = 42;

    uint256 private _currentTokenId = 0;
    uint256 public mintPrice; // Mint price in wei
    address payable public paymentWallet;
    uint256 public ownerShare; // Owner's share in percentage (e.g., 20 for 20%)

    constructor(address payable _paymentWallet, uint256 _initialMintPrice, uint256 _ownerShare) 
        ERC721("Last meal on Shimmer", "MEAL") 
        Ownable(msg.sender)
    {
        paymentWallet = _paymentWallet;
        mintPrice = _initialMintPrice;
        ownerShare = _ownerShare;
    }

    function setMintPrice(uint256 _price) external onlyOwner {
        mintPrice = _price;
    }

    function setPaymentWallet(address payable _wallet) external onlyOwner {
        paymentWallet = _wallet;
    }

    function setOwnerShare(uint256 _share) external onlyOwner {
        require(_share <= 100, "Invalid share percentage");
        ownerShare = _share;
    }

    function mint(uint256 quantity) external payable whenNotPaused {
        require(_currentTokenId + quantity <= MAX_SUPPLY, "Not more supply left");
        require(balanceOf(msg.sender) + quantity <= USER_LIMIT, "User limit reached");
        require(msg.value == mintPrice * quantity, "Incorrect payment amount");

        for (uint256 i = 0; i < quantity; i++) {
            _currentTokenId++;
            _safeMint(msg.sender, _currentTokenId);
            _setTokenURI(_currentTokenId, string(abi.encodePacked(_baseURI(), uint2str(_currentTokenId)))); // Optionally set URI
        }

        // Calculate shares
        uint256 totalAmount = msg.value;
        uint256 ownerAmount = (totalAmount * ownerShare) / 100;
        uint256 paymentAmount = totalAmount - ownerAmount;

        // Send the payment to the contract owner and the payment wallet
        (bool ownerSuccess, ) = owner().call{value: ownerAmount}("");
        require(ownerSuccess, "Owner payment transfer failed");

        (bool walletSuccess, ) = paymentWallet.call{value: paymentAmount}("");
        require(walletSuccess, "Payment wallet transfer failed");
    }

    function totalSupply() external view returns (uint256) {
        return _currentTokenId;
    }

    function _baseURI() internal view virtual override returns (string memory) {
        return "ipfs://QmUak7JUmvrchunLGPTHTEqBiAPqn6XRiYrFP8onoWiiQp/";
    }

    // Helper function to convert uint to string
    function uint2str(uint256 _i) internal pure returns (string memory) {
        if (_i == 0) return "0";
        uint256 j = _i;
        uint256 length;
        while (j != 0) {
            length++;
            j /= 10;
        }
        bytes memory bstr = new bytes(length);
        uint256 k = length;
        j = _i;
        while (j != 0) {
            bstr[--k] = bytes1(uint8(48 + j % 10));
            j /= 10;
        }
        return string(bstr);
    }

    function tokenByIndex(uint256 index) external view returns (uint256) {
        require(index < _currentTokenId, "Index out of bounds");
        return index + 1;
    }

    function tokenOfOwnerByIndex(address owner, uint256 index) external view returns (uint256) {
        require(index < balanceOf(owner), "Index out of bounds");

        uint256 tokenCount = 0;
        uint256 tokenId = 0;

        for (uint256 i = 1; i <= _currentTokenId; i++) {
            if (ownerOf(i) == owner) {
                if (tokenCount == index) {
                    tokenId = i;
                    break;
                }
                tokenCount++;
            }
        }

        require(tokenCount == index, "Token not found");
        return tokenId;
    }

    // Pause function
    function pause() external onlyOwner {
        _pause();
    }

    // Unpause function
    function unpause() external onlyOwner {
        _unpause();
    }

    // Override tokenURI function
    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }

    // Override supportsInterface function
    function supportsInterface(bytes4 interfaceId) public view virtual override(ERC721, ERC721URIStorage) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
