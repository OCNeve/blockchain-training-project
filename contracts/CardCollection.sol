pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract CardCollection is ERC721URIStorage, Ownable {
    uint256 public nextTokenId;
    uint256 public constant MAX_OWNED_CARDS = 4;
    mapping(address => uint256) public cooldowns;
    mapping(uint256 => address[]) public previousOwners;

    constructor() ERC721("CardCollection", "CARD") Ownable(msg.sender) {}

    function mintCard(string memory tokenURI) external {
        require(balanceOf(msg.sender) < MAX_OWNED_CARDS, "Ownership limit reached");
        
        uint256 tokenId = nextTokenId++;
        _safeMint(msg.sender, tokenId);
        _setTokenURI(tokenId, tokenURI);
    }

    function tradeCard(uint256 tokenId, address to) external {
        require(ownerOf(tokenId) == msg.sender, "Not the owner");
        require(block.timestamp >= cooldowns[msg.sender], "Cooldown active");
        require(balanceOf(to) < MAX_OWNED_CARDS, "Recipient at max ownership");

        cooldowns[msg.sender] = block.timestamp + 5 minutes;

        previousOwners[tokenId].push(msg.sender);
        _transfer(msg.sender, to, tokenId);
    }

    function getPreviousOwners(uint256 tokenId) external view returns (address[] memory) {
        return previousOwners[tokenId];
    }
}
