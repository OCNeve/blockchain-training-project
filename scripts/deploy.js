const hre = require("hardhat");

async function main() {
    const CardCollection = await hre.ethers.getContractFactory("CardCollection");
    const cardCollection = await CardCollection.deploy();

    await cardCollection.deployed();
    console.log("CardCollection deployed to:", cardCollection.address);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
