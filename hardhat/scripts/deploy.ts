import { ethers } from "hardhat";

async function main() {
    const [deployer] = await ethers.getSigners();

    console.log("Deploying contracts with the account:", deployer.address);

    console.log("Account balance:", (await deployer.getBalance()).toString());

    const SupplyChain = await ethers.getContractFactory("SupplyChain");
    const supplyChainInstance = await SupplyChain.deploy();

    console.log("Contract address:", supplyChainInstance.address);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
