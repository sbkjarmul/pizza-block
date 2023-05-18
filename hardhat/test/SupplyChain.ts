import { ethers } from "hardhat";
import { SupplyChain } from "../typechain-types";

const { expect } = require("chai");

enum Role {
  COOK = "COOK",
  DELIVERY_MAN = "DELIVERY_MAN",
  CUSTOMER = "CUSTOMER"
}

describe("SupplyChain", function () {
  let supplyChainInstance: SupplyChain;

  beforeEach(async function () {
    const SupplyChainFactory = await ethers.getContractFactory("SupplyChain");
    supplyChainInstance = await SupplyChainFactory.deploy();
    await supplyChainInstance.deployed();
  });

  it("Should set company wallet address and owner address", async function () {
    const [owner] = await ethers.getSigners();
    expect(await supplyChainInstance.getOwner()).to.equal(owner.address);
    expect(await supplyChainInstance.getCompanyWalletAddress()).to.equal(
      owner.address
    );
  });

  it("Should update company wallet address", async function () {
    const [_, newCompanyWallet] = await ethers.getSigners();
    await supplyChainInstance.updateCompanyWalletAddress(
      newCompanyWallet.address
    );
    expect(await supplyChainInstance.getCompanyWalletAddress()).to.equal(
      newCompanyWallet.address
    );
  });

  it("Should revert if not owner tries to update company wallet address", async function () {
    const [_, newCompanyWallet] = await ethers.getSigners();
    await expect(
      supplyChainInstance
        .connect(newCompanyWallet)
        .updateCompanyWalletAddress(newCompanyWallet.address)
    ).to.be.revertedWith("Only owner can call this function");
  });

  it("Should revert if company wallet address is zero address", async function () {
    await expect(
      supplyChainInstance.updateCompanyWalletAddress(
        ethers.constants.AddressZero
      )
    ).to.be.revertedWith("Company wallet address cannot be zero address");
  });

  it("Should add employee", async function () {
    const [, employee] = await ethers.getSigners();
    await supplyChainInstance.addEmployee(employee.address, Role.COOK);
    const [employeeAddress, employeeRole] = await supplyChainInstance.employees(
      employee.address
    );
    expect(employeeAddress).to.equal(employee.address);
    expect(employeeRole).to.equal(0);
  });

  it("Should revert if not owner tries to add employee", async function () {
    const [_, employee] = await ethers.getSigners();
    await expect(
      supplyChainInstance
        .connect(employee)
        .addEmployee(employee.address, Role.COOK)
    ).to.be.revertedWith("Only owner can call this function");
  });

  it("Should revert if employee address is zero address", async function () {
    await expect(
      supplyChainInstance.addEmployee(ethers.constants.AddressZero, Role.COOK)
    ).to.be.revertedWith("Employee address cannot be zero address");
  });

  it("Should revert if employee role is not valid", async function () {
    const [, employee] = await ethers.getSigners();
    await expect(
      supplyChainInstance.addEmployee(employee.address, "INVALID_ROLE")
    ).to.be.revertedWith("Employee role is not valid");
  });

  it("Should remove employee", async function () {
    const [, employee] = await ethers.getSigners();
    await supplyChainInstance.addEmployee(employee.address, Role.COOK);
    await supplyChainInstance.removeEmployee(employee.address);
    const [employeeAddress] = await supplyChainInstance.employees(
      employee.address
    );
    expect(employeeAddress).to.equal(ethers.constants.AddressZero);
  });
});
