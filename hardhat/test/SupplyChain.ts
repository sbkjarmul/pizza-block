import { ethers } from "hardhat";

const { expect } = require("chai");

import { SupplyChain } from "../typechain-types/SupplyChain";

enum Role {
	COOK = "COOK",
	DELIVERY_MAN = "DELIVERY_MAN",
	CUSTOMER = "CUSTOMER"
}

enum Status {
	NOT_EXISTS = 0,
	PLACED = 1,
	PREPARING = 2,
	READY = 3,
	DELIVERING = 4,
	COMPLETED = 5
}

enum RevertMessage {
	ONLY_OWNER = "Only owner can call this function",
	ONLY_EMPLOYEE = "Only employees can call this function",
	EMPLOYEE_ZERO_ADDRESS = "Employee address cannot be zero address",
	COMPANY_WALLET_ZERO_ADDRESS = "Company wallet address cannot be zero address",
	PRICE_GREATER_THAN_ZERO = "Price must be greater than 0",
	ORDER_MUST_BE_PLACED = "Order must be in PLACED status",
	ORDER_MUST_BE_PREPARING = "Order must be in PREPARING status",
	ORDER_MUST_BE_READY = "Order must be in READY status",
	ORDER_MUST_BE_DELIVERING = "Order must be in DELIVERING status",
	ORDER_MUST_BE_COMPLETED = "Order must be in COMPLETED status",
	ORDER_NOT_EXISTS = "Order does not exist with this id",
	EMPLOYEE_ROLE = "Employee role is not valid",
}

describe("SupplyChain", function () {
	let supplyChainInstance: SupplyChain;

	beforeEach(async function () {
		const SupplyChainFactory = await ethers.getContractFactory("SupplyChain");
		supplyChainInstance = await SupplyChainFactory.deploy();
		await supplyChainInstance.deployed();
	});

	describe("updateCompanyWalletAddress", function () {
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
			).to.be.revertedWith(RevertMessage.ONLY_OWNER);
		});
	
		it("Should revert if company wallet address is zero address", async function () {
			await expect(
				supplyChainInstance.updateCompanyWalletAddress(
				ethers.constants.AddressZero
				)
			).to.be.revertedWith(RevertMessage.COMPANY_WALLET_ZERO_ADDRESS);
		});
	});

	describe("addEmplyee", function () {
		it("Should add employee", async function () {
			const [, employee] = await ethers.getSigners();
			await supplyChainInstance.addEmployee(employee.address, Role.COOK);
			const [employeeAddress, employeeRole] = await supplyChainInstance.employees(
				employee.address
			);
			expect(employeeAddress).to.equal(employee.address);
			expect(employeeRole).to.equal(1);
		});
	
		it("Should revert if not owner tries to add employee", async function () {
			const [_, employee] = await ethers.getSigners();
			await expect(
				supplyChainInstance
				.connect(employee)
				.addEmployee(employee.address, Role.COOK)
			).to.be.revertedWith(RevertMessage.ONLY_OWNER);
		});
	
		it("Should revert if employee address is zero address", async function () {
			await expect(
				supplyChainInstance.addEmployee(ethers.constants.AddressZero, Role.COOK)
			).to.be.revertedWith(RevertMessage.EMPLOYEE_ZERO_ADDRESS);
		});
	
		it("Should revert if employee role is not valid", async function () {
			const [, employee] = await ethers.getSigners();
			await expect(
				supplyChainInstance.addEmployee(employee.address, "INVALID_ROLE")
			).to.be.revertedWith(RevertMessage.EMPLOYEE_ROLE);
		});
	});

	describe("removeEmployee", function () {
		it("Should remove employee", async function () {
			const [, employee] = await ethers.getSigners();
			await supplyChainInstance.addEmployee(employee.address, Role.COOK);
			await supplyChainInstance.removeEmployee(employee.address);
			const [employeeAddress] = await supplyChainInstance.employees(
				employee.address
			);
			expect(employeeAddress).to.equal(ethers.constants.AddressZero);
		});

		it("Should revert if not owner tries to remove employee", async function () {
			const [_, employee] = await ethers.getSigners();
			await expect(
				supplyChainInstance
				.connect(employee)
				.removeEmployee(employee.address)
			).to.be.revertedWith(RevertMessage.ONLY_OWNER);
		});

		it("Should revert if employee address is zero address", async function () {
			await expect(
				supplyChainInstance.removeEmployee(ethers.constants.AddressZero)
			).to.be.revertedWith(RevertMessage.EMPLOYEE_ZERO_ADDRESS);
		});

		it("Should revert if employee does not exist", async function () {
			const [, employee] = await ethers.getSigners();
			await expect(
				supplyChainInstance.removeEmployee(employee.address)
			).to.be.revertedWith("Employee does not exist with this address");
		});
  	});

	describe("placeOrder", function () {
		it("Should place order successfully", async function () {
			const orderPrice = ethers.utils.parseEther("1");
			const [_, customer] = await ethers.getSigners();

			const result = await supplyChainInstance
				.connect(customer)
				.placeOrder({ value: orderPrice });
			await expect(result).to.emit(supplyChainInstance, "OrderPlaced");
			const order = await supplyChainInstance.orders(1);

			expect(order.customer).to.equal(customer.address);
			expect(order.status).to.equal(Status.PLACED);
			expect(order.price).to.equal(orderPrice);
		});

		it("Should revert if order price is zero", async function () {
			const [_, customer] = await ethers.getSigners();
			await expect(
				supplyChainInstance.connect(customer).placeOrder({ value: 0 })
			).to.be.revertedWith(RevertMessage.PRICE_GREATER_THAN_ZERO);
		});		
	});

	describe("prepareOrder", function () {
		it("Should prepare order successfully", async function () {
			const orderPrice = ethers.utils.parseEther("1");
			const [_, customer, cook] = await ethers.getSigners();

			await supplyChainInstance.addEmployee(cook.address, Role.COOK);
			await supplyChainInstance.connect(customer).placeOrder({ value: orderPrice });
			const result = await supplyChainInstance.connect(cook).prepareOrder(1);
			await expect(result).to.emit(supplyChainInstance, "OrderPreparing");

			const order = await supplyChainInstance.orders(1);
			expect(order.status).to.equal(Status.PREPARING);
			expect(order.cook).to.equal(cook.address);
		});

		it("Should revert if not employee tries to prepare order", async function () {
			const orderPrice = ethers.utils.parseEther("1");
			const [_, customer] = await ethers.getSigners();
			await supplyChainInstance.connect(customer).placeOrder({ value: orderPrice });
			await expect(
				supplyChainInstance.connect(customer).prepareOrder(1)
			).to.be.revertedWith(RevertMessage.ONLY_EMPLOYEE);
		});

		it("Should revert if order does not exist", async function () {
			const [_, cook] = await ethers.getSigners();
			await supplyChainInstance.addEmployee(cook.address, Role.COOK);
			await expect(supplyChainInstance.connect(cook).prepareOrder(1)).to.be.revertedWith(
				RevertMessage.ORDER_NOT_EXISTS
			);
		});

		it("Should revert if order is not in PLACED status", async function () {
			const orderPrice = ethers.utils.parseEther("1");
			const [_, customer, cook] = await ethers.getSigners();
			await supplyChainInstance.addEmployee(cook.address, Role.COOK);
			await supplyChainInstance.connect(customer).placeOrder({ value: orderPrice });
			await supplyChainInstance.connect(cook).prepareOrder(1);
			await expect(
				supplyChainInstance.connect(cook).prepareOrder(1)
			).to.be.revertedWith(RevertMessage.ORDER_MUST_BE_PLACED);
		});
	});

	describe("readyOrder", function () {
		it("Should ready order successfully", async function () {
			const orderPrice = ethers.utils.parseEther("1");
			const [_, customer, cook] = await ethers.getSigners();

			await supplyChainInstance.addEmployee(cook.address, Role.COOK);
			await supplyChainInstance.connect(customer).placeOrder({ value: orderPrice });
			await supplyChainInstance.connect(cook).prepareOrder(1);
			const result = await supplyChainInstance.connect(cook).readyOrder(1);
			await expect(result).to.emit(supplyChainInstance, "OrderReady");

			const order = await supplyChainInstance.orders(1);
			expect(order.status).to.equal(Status.READY);
		});

		it("Should revert if not employee tries to ready order", async function () {
			const orderPrice = ethers.utils.parseEther("1");
			const [_, customer] = await ethers.getSigners();
			await supplyChainInstance.connect(customer).placeOrder({ value: orderPrice });
			await expect(
				supplyChainInstance.connect(customer).readyOrder(1)
			).to.be.revertedWith(RevertMessage.ONLY_EMPLOYEE);
		});

		it("Should revert if order does not exist", async function () {
			const [_, cook] = await ethers.getSigners();
			await supplyChainInstance.addEmployee(cook.address, Role.COOK);
			await expect(supplyChainInstance.connect(cook).readyOrder(1)).to.be.revertedWith(
				RevertMessage.ORDER_NOT_EXISTS
			);
		});

		it("Should revert if order is not in PREPARING status", async function () {
			const orderPrice = ethers.utils.parseEther("1");
			const [_, customer, cook] = await ethers.getSigners();
			await supplyChainInstance.addEmployee(cook.address, Role.COOK);
			await supplyChainInstance.connect(customer).placeOrder({ value: orderPrice });
			await expect(
				supplyChainInstance.connect(cook).readyOrder(1)
			).to.be.revertedWith(RevertMessage.ORDER_MUST_BE_PREPARING);
		});
	});
	
	describe("deliverOrder", function () {
		it("Should deliver order successfully", async function () {
			const orderPrice = ethers.utils.parseEther("1");
			const [_, customer, cook, deliveryMan] = await ethers.getSigners();
			await supplyChainInstance.addEmployee(cook.address, Role.COOK);
			await supplyChainInstance.addEmployee(deliveryMan.address, Role.DELIVERY_MAN);
			await supplyChainInstance.connect(customer).placeOrder({ value: orderPrice });
			await supplyChainInstance.connect(cook).prepareOrder(1);
			await supplyChainInstance.connect(cook).readyOrder(1);
			const result = await supplyChainInstance.connect(deliveryMan).deliverOrder(1);
			await expect(result).to.emit(supplyChainInstance, "OrderInDelivery");

			const order = await supplyChainInstance.orders(1);
			expect(order.status).to.equal(Status.DELIVERING);
			expect(order.deliveryMan).to.equal(deliveryMan.address);
		});

		it("Should revert if not employee tries to deliver order", async function () {
			const orderPrice = ethers.utils.parseEther("1");
			const [_, customer] = await ethers.getSigners();
			await supplyChainInstance.connect(customer).placeOrder({ value: orderPrice });
			await expect(
				supplyChainInstance.connect(customer).deliverOrder(1)
			).to.be.revertedWith(RevertMessage.ONLY_EMPLOYEE);
		});

		it("Should revert if order does not exist", async function () {
			const [_, cook] = await ethers.getSigners();
			await supplyChainInstance.addEmployee(cook.address, Role.COOK);
			await expect(supplyChainInstance.connect(cook).deliverOrder(1)).to.be.revertedWith(
				RevertMessage.ORDER_NOT_EXISTS
			);
		});

		it("Should revert if order is not in READY status", async function () {
			const orderPrice = ethers.utils.parseEther("1");
			const [_, customer, cook, deliveryMan] = await ethers.getSigners();
			await supplyChainInstance.addEmployee(cook.address, Role.COOK);
			await supplyChainInstance.addEmployee(deliveryMan.address, Role.DELIVERY_MAN);
			await supplyChainInstance.connect(customer).placeOrder({ value: orderPrice });
			await expect(
				supplyChainInstance.connect(deliveryMan).deliverOrder(1)
			).to.be.revertedWith(RevertMessage.ORDER_MUST_BE_READY);
		});
	});
});
