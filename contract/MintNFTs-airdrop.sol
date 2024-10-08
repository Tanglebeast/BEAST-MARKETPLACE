// SPDX-License-Identifier: MIT

pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract FreeMintToken is ERC721Enumerable, Pausable, Ownable, ReentrancyGuard {
    using Strings for uint256;

    uint256 public constant USER_LIMIT = 15;
    uint256 public constant MAX_SUPPLY = 15;

    uint256 private _currentTokenId = 0;
    uint256 public mintPrice;
    address payable public paymentWallet;
    uint256 public ownerShare;

    constructor(address payable _paymentWallet, uint256 _initialMintPrice, uint256 _ownerShare) 
        ERC721("Tangle Beasts", "BEASTS") 
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

    function mint(uint256 quantity) external payable whenNotPaused nonReentrant {
        require(quantity > 0, "Quantity must be greater than 0");
        require(_currentTokenId + quantity <= MAX_SUPPLY, "Not more supply left");
        require(balanceOf(msg.sender) + quantity <= USER_LIMIT, "User limit reached");
        require(msg.value >= mintPrice * quantity, "Incorrect payment amount");

        for (uint256 i = 0; i < quantity; i++) {
            _currentTokenId++;
            _safeMint(msg.sender, _currentTokenId);
        }

        uint256 totalAmount = msg.value;
        uint256 ownerAmount = (totalAmount * ownerShare) / 100;
        uint256 paymentAmount = totalAmount - ownerAmount;

        (bool ownerSuccess, ) = owner().call{value: ownerAmount}("");
        require(ownerSuccess, "Owner payment transfer failed");

        (bool walletSuccess, ) = paymentWallet.call{value: paymentAmount}("");
        require(walletSuccess, "Payment wallet transfer failed");
    }

    function tokenIdsOfOwner(address owner) external view returns (uint256[] memory) {
        uint256 ownerTokenCount = balanceOf(owner);
        uint256[] memory tokenIds = new uint256[](ownerTokenCount);
        for (uint256 i = 0; i < ownerTokenCount; i++) {
            tokenIds[i] = tokenOfOwnerByIndex(owner, i);
        }
        return tokenIds;
    }

    function batchTransfer(address[] calldata recipients, uint256[] calldata tokenIds) external onlyOwner {
        require(recipients.length == tokenIds.length, "Recipients and token IDs array length must match");

        for (uint256 i = 0; i < recipients.length; i++) {
            require(ownerOf(tokenIds[i]) == msg.sender, "You do not own this token");
            _safeTransfer(msg.sender, recipients[i], tokenIds[i], "");
        }
    }

    function _baseURI() internal view virtual override returns (string memory) {
        return "ipfs://QmaTxGmEqrYvnmBh7bwvvHSFvcZDZAfkJoEUUkvKmht9xz/";
    }

    function tokenURI(uint256 tokenId) public view virtual override returns (string memory) {
        if (!_exists(tokenId)) revert("ERC721: invalid token ID");

        string memory baseURI = _baseURI();
        return bytes(baseURI).length > 0 ? string(abi.encodePacked(baseURI, tokenId.toString())) : "";
    }

    function _exists(uint256 tokenId) internal view virtual returns (bool) {
        return _ownerOf(tokenId) != address(0);
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    function supportsInterface(bytes4 interfaceId) public view virtual override(ERC721Enumerable) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
