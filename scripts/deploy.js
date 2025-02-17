const hre = require("hardhat");

async function main() {
    const CardCollection = await hre.ethers.getContractFactory("CardCollection");
    const cardCollection = await CardCollection.deploy();
    await cardCollection.waitForDeployment();
    console.log("Contract deployed to:", cardCollection.target);

}

// Run the script using Hardhat's environment
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
});
