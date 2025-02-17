const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CardCollection", function () {
    let CardCollection, cardCollection, owner, addr1, addr2;

    beforeEach(async function () {
        CardCollection = await ethers.getContractFactory("CardCollection");
        [owner, addr1, addr2] = await ethers.getSigners();
        cardCollection = await CardCollection.deploy();
        await cardCollection.waitForDeployment();
    });

    it("Should mint a new card successfully", async function () {
        const tokenURI = "ipfs://QmRFyKNgBpTXc29VeGbN2w8P4rPiN8vdRSKRQ5WDZ3JyR6";
        const level = "Legendary";
        const ipfsHash = "QmRFyKNgBpTXc29VeGbN2w8P4rPiN8vdRSKRQ5WDZ3JyR6";

        // Mint a card
        const tx = await cardCollection.mintCard(tokenURI, level, ipfsHash);
        await tx.wait();

        // Check token ownership
        expect(await cardCollection.ownerOf(0)).to.equal(owner.address);

        // Check token URI
        expect(await cardCollection.tokenURI(0)).to.equal(tokenURI);

        // Check level and IPFS hash
        expect(await cardCollection.getLevel(0)).to.equal(level);
        expect(await cardCollection.getIpfsHash(0)).to.equal(ipfsHash);
    });

    it("Should allow trading a card and update previous owners", async function () {
        const tokenURI = "ipfs://QmRFyKNgBpTXc29VeGbN2w8P4rPiN8vdRSKRQ5WDZ3JyR6";
        const level = "Epic";
        const ipfsHash = "QmSomeHash";

        // Mint a card to owner
        await cardCollection.mintCard(tokenURI, level, ipfsHash);

        // Trade the card to addr1
        await expect(cardCollection.tradeCard(0, addr1.address))
            .to.emit(cardCollection, "Transfer")
            .withArgs(owner.address, addr1.address, 0);

        // Check new owner
        expect(await cardCollection.ownerOf(0)).to.equal(addr1.address);

        // Check previous owner list
        const previousOwners = await cardCollection.getPreviousOwners(0);
        expect(previousOwners.length).to.equal(1);
        expect(previousOwners[0]).to.equal(owner.address);
    });

    it("Should not allow trading a card before cooldown expires", async function () {
        const tokenURI = "ipfs://QmRFyKNgBpTXc29VeGbN2w8P4rPiN8vdRSKRQ5WDZ3JyR6";
        const level = "Rare";
        const ipfsHash = "QmSomeOtherHash";

        await cardCollection.connect(addr1).mintCard(tokenURI, level, ipfsHash);

        await cardCollection.connect(addr1).tradeCard(0, addr2.address);

        await expect(
            cardCollection.connect(addr2).tradeCard(0, addr1.address)
        ).to.be.revertedWith("Cooldown active");
    });

    it("Should fail if minting exceeds ownership limit", async function () {
        const tokenURI = "ipfs://QmRFyKNgBpTXc29VeGbN2w8P4rPiN8vdRSKRQ5WDZ3JyR6";
        const level = "Rare";
        const ipfsHash = "QmSomethingElse";

        for (let i = 0; i < 4; i++) {
            await cardCollection.mintCard(tokenURI, level, ipfsHash);
        }

        await expect(
            cardCollection.mintCard(tokenURI, level, ipfsHash)
        ).to.be.revertedWith("Ownership limit reached");
    });
});
