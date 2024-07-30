// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/IERC721Metadata.sol";

contract NFTMarketplace {
    struct NFT {
        address contractAddress;
        uint256 tokenId;
        address payable seller;
        uint256 price;
    }

    NFT[] public nftsForSale;
    mapping(address => mapping(uint256 => uint256)) public nftPrice; // Mapping für die Preisabfrage

    // Events
    event NFTListed(address indexed seller, address indexed contractAddress, uint256 tokenId, uint256 price);
    event NFTSold(address indexed buyer, address indexed seller, address indexed contractAddress, uint256 tokenId, uint256 price);
    event NFTListingCancelled(address indexed seller, address indexed contractAddress, uint256 tokenId);

    // Funktion, um ein NFT zum Verkauf anzubieten
    function listNFT(address _contractAddress, uint256 _tokenId, uint256 _price) public {
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
    function buyNFT(uint256 _index) public payable {
        require(_index < nftsForSale.length, "Invalid index");
        NFT memory nft = nftsForSale[_index];
        require(msg.value == nft.price, "Incorrect price sent");

        IERC721(nft.contractAddress).safeTransferFrom(nft.seller, msg.sender, nft.tokenId);
        nft.seller.transfer(msg.value);

        emit NFTSold(msg.sender, nft.seller, nft.contractAddress, nft.tokenId, nft.price);

        // Preis im Mapping auf 0 setzen oder entfernen
        delete nftPrice[nft.contractAddress][nft.tokenId];

        removeNFT(_index);
    }

    // Funktion, um alle NFTs zum Verkauf abzurufen
    function getNFTsForSale() public view returns (NFT[] memory) {
        return nftsForSale;
    }

    // Funktion, um ein NFT aus der Verkaufsliste zu entfernen und den Verkauf abzubrechen
    function cancelListing(uint256 _index) public {
        require(_index < nftsForSale.length, "Invalid index");
        require(nftsForSale[_index].seller == msg.sender, "You are not the seller of this NFT");

        emit NFTListingCancelled(msg.sender, nftsForSale[_index].contractAddress, nftsForSale[_index].tokenId);

        // Preis im Mapping auf 0 setzen oder entfernen
        delete nftPrice[nftsForSale[_index].contractAddress][nftsForSale[_index].tokenId];

        removeNFT(_index);
    }

    // Funktion, um ein NFT aus der Verkaufsliste zu entfernen
    function removeNFT(uint256 _index) internal {
        require(_index < nftsForSale.length, "Invalid index");
        nftsForSale[_index] = nftsForSale[nftsForSale.length - 1];
        nftsForSale.pop();
    }

    // Funktion, um Details eines NFTs abzurufen, einschließlich des Preises
    function getNFTDetails(address _contractAddress, uint256 _tokenId) public view returns (string memory name, string memory symbol, string memory tokenURI, address owner, uint256 price) {
        IERC721Metadata nft = IERC721Metadata(_contractAddress);
        
        name = nft.name();
        symbol = nft.symbol();
        tokenURI = nft.tokenURI(_tokenId);
        owner = nft.ownerOf(_tokenId);
        price = nftPrice[_contractAddress][_tokenId]; // Preis aus dem Mapping abrufen
    }

    // Neue Funktion, um den Index eines NFTs zu erhalten
    function getNFTIndex(address _contractAddress, uint256 _tokenId) public view returns (uint256) {
        for (uint256 i = 0; i < nftsForSale.length; i++) {
            if (nftsForSale[i].contractAddress == _contractAddress && nftsForSale[i].tokenId == _tokenId) {
                return i;
            }
        }
        revert("NFT not found in sale list");
    }

    // Funktion, um alle NFTs eines Verkäufers automatisch zum Verkauf anzubieten
    function listAllNFTsForSale(address _contractAddress, uint256[] memory _tokenIds, uint256 _price) public {
        IERC721 nft = IERC721(_contractAddress);
        require(nft.isApprovedForAll(msg.sender, address(this)), "Contract not approved to transfer NFTs");

        for (uint256 i = 0; i < _tokenIds.length; i++) {
            require(nft.ownerOf(_tokenIds[i]) == msg.sender, "You are not the owner of all listed NFTs");
            bool alreadyListed = false;
            for (uint256 j = 0; j < nftsForSale.length; j++) {
                if (nftsForSale[j].contractAddress == _contractAddress && nftsForSale[j].tokenId == _tokenIds[i]) {
                    alreadyListed = true;
                    break;
                }
            }
            if (!alreadyListed) {
                nftsForSale.push(NFT({
                    contractAddress: _contractAddress,
                    tokenId: _tokenIds[i],
                    seller: payable(msg.sender),
                    price: _price
                }));

                // Mapping aktualisieren
                nftPrice[_contractAddress][_tokenIds[i]] = _price;

                emit NFTListed(msg.sender, _contractAddress, _tokenIds[i], _price);
            }
        }
    }
}
