// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract CardCollection is ERC721URIStorage, Ownable {
    uint256 public nextTokenId;
    uint256 public constant MAX_OWNED_CARDS = 4;
    uint256 private constant TRADE_COOLDOWN = 5 minutes;

    struct Card {
        string level;
        string ipfsHash;
        uint256 mintedAt;
        uint256 lastTradedAt;
        address[] previousOwners;
    }

    mapping(uint256 => Card) private _cards;
    mapping(address => uint256) public cooldowns;

    constructor() ERC721("CardCollection", "CARD") Ownable(msg.sender) {}

    function mintCard(string memory tokenURI, string memory level, string memory ipfsHash) external {
        require(balanceOf(msg.sender) < MAX_OWNED_CARDS, "Ownership limit reached");

        uint256 tokenId = nextTokenId++;
        _safeMint(msg.sender, tokenId);
        _setTokenURI(tokenId, tokenURI);

        _cards[tokenId] = Card({
            level: level,
            ipfsHash: ipfsHash,
            mintedAt: block.timestamp,
            lastTradedAt: block.timestamp,
            previousOwners: new address[](0)  //ected initialization
        });
    }

    function tradeCard(uint256 tokenId, address to) external {
        require(ownerOf(tokenId) == msg.sender, "Not the owner");
        require(block.timestamp >= cooldowns[msg.sender], "Cooldown active");
        require(balanceOf(to) < MAX_OWNED_CARDS, "Recipient at max ownership");
        
        cooldowns[to] = block.timestamp + 5 minutes;

        _cards[tokenId].previousOwners.push(msg.sender);
        _transfer(msg.sender, to, tokenId);
    }

    function getPreviousOwners(uint256 tokenId) external view returns (address[] memory) {
        return _cards[tokenId].previousOwners;
    }

    function getLevel(uint256 tokenId) public view returns (string memory) {
        return _cards[tokenId].level;
    }

    function getIpfsHash(uint256 tokenId) public view returns (string memory) {
        return _cards[tokenId].ipfsHash;
    }

    function getCardInfo(uint256 tokenId) external view returns (
        string memory level,
        string memory ipfsHash,
        uint256 mintedAt,
        uint256 lastTradedAt,
        address[] memory previousOwners
    ) {
        Card storage card = _cards[tokenId];
        return (card.level, card.ipfsHash, card.mintedAt, card.lastTradedAt, card.previousOwners);
    }
}
