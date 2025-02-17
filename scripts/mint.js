const hre = require("hardhat");

async function main() {
    const CardCollection = await hre.ethers.getContractFactory("CardCollection");
  
    const cardCollectionAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; 
    const cardCollection = await CardCollection.attach(cardCollectionAddress);
  
    const tokenURI = "ipfs://QmRFyKNgBpTXc29VeGbN2w8P4rPiN8vdRSKRQ5WDZ3JyR6";
    const level = "Legendary";
    const ipfsHash = "QmRFyKNgBpTXc29VeGbN2w8P4rPiN8vdRSKRQ5WDZ3JyR6";

    const tx = await cardCollection.mintCard(tokenURI, level, ipfsHash);
  
    console.log("Minting card...");
  
    await tx.wait();
    console.log("Card minted successfully!");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });