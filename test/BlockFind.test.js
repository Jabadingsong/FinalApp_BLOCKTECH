const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("BlockFind", function () {
  let blockFind;
  let owner, finder, other;

  beforeEach(async function () {
    [owner, finder, other] = await ethers.getSigners();
    const BlockFind = await ethers.getContractFactory("BlockFind");
    blockFind = await BlockFind.deploy();
    await blockFind.waitForDeployment();
  });

  describe("Registration", function () {
    it("should register an item and increment itemCount", async function () {
      await blockFind.registerItem("Laptop", "MacBook Pro 14-inch", "owner@email.com", "hash123", "img_url");
      expect(await blockFind.itemCount()).to.equal(1);
    });

    it("should store correct item data including timestamp and qrHash", async function () {
      await blockFind.registerItem("Phone", "iPhone 15", "john@email.com", "hash456", "img_url");
      const item = await blockFind.getItem(1);

      expect(item.id).to.equal(1);
      expect(item.name).to.equal("Phone");
      expect(item.description).to.equal("iPhone 15");
      expect(item.owner).to.equal(owner.address);
      expect(item.contactInfo).to.equal("john@email.com");
      expect(item.status).to.equal(0); // Registered
      expect(item.timestamp).to.be.gt(0); // Should have a block timestamp
      expect(item.qrHash).to.equal("hash456");
      expect(item.image).to.equal("img_url");
    });

    it("should emit ItemRegistered event", async function () {
      await expect(blockFind.registerItem("Wallet", "Brown leather", "test@email.com", "hash789", "img_url"))
        .to.emit(blockFind, "ItemRegistered")
        .withArgs(1, "Wallet", owner.address);
    });

    it("should reject registration if name is empty", async function () {
      await expect(blockFind.registerItem("", "desc", "contact", "hash1", "img_url"))
        .to.be.revertedWith("Name required");
    });

    it("should reject registration if QR hash is empty", async function () {
      await expect(blockFind.registerItem("Item", "desc", "contact", "", "img_url"))
        .to.be.revertedWith("QR hash required");
    });

    it("should reject duplicate QR hashes", async function () {
      await blockFind.registerItem("Item 1", "Desc", "contact", "uniqueHash", "img1");
      await expect(blockFind.registerItem("Item 2", "Desc", "contact", "uniqueHash", "img2"))
        .to.be.revertedWith("QR hash already registered");
    });
  });

  describe("Ownership Verification", function () {
    beforeEach(async function () {
      await blockFind.registerItem("Keys", "House keys", "owner@email.com", "keysHash", "img_url");
    });

    it("should verify correct owner", async function () {
      expect(await blockFind.verifyOwnership(1, owner.address)).to.be.true;
    });

    it("should reject incorrect owner", async function () {
      expect(await blockFind.verifyOwnership(1, other.address)).to.be.false;
    });

    it("should revert for non-existent item", async function () {
      await expect(blockFind.verifyOwnership(99, owner.address)).to.be.revertedWith("Item does not exist");
    });
  });

  describe("Report Lost", function () {
    beforeEach(async function () {
      await blockFind.registerItem("Phone", "iPhone 15", "owner@email.com", "phoneHash", "img_url");
    });

    it("should allow owner to report item as lost", async function () {
      await blockFind.reportLost(1);
      const item = await blockFind.getItem(1);
      expect(item.status).to.equal(1); // Lost
    });

    it("should reject non-owner from reporting lost", async function () {
      await expect(
        blockFind.connect(other).reportLost(1)
      ).to.be.revertedWith("Not owner");
    });
  });

  describe("Mark Found", function () {
    beforeEach(async function () {
      await blockFind.registerItem("Phone", "iPhone 15", "owner@email.com", "phoneHash", "img_url");
      await blockFind.reportLost(1);
    });

    it("should allow anyone to mark item as found", async function () {
      await blockFind.connect(finder).markFound(1);
      const item = await blockFind.getItem(1);
      expect(item.status).to.equal(2); // Found
    });
  });

  describe("Mark Returned", function () {
    beforeEach(async function () {
      await blockFind.registerItem("Phone", "iPhone 15", "owner@email.com", "phoneHash", "img_url");
      await blockFind.reportLost(1);
      await blockFind.connect(finder).markFound(1);
    });

    it("should allow owner to mark item as returned", async function () {
      await blockFind.markReturned(1);
      const item = await blockFind.getItem(1);
      expect(item.status).to.equal(3); // Returned
    });

    it("should reject non-owner from marking returned", async function () {
      await expect(
        blockFind.connect(finder).markReturned(1)
      ).to.be.revertedWith("Not owner");
    });
  });

  describe("Item Deletion", function () {
    beforeEach(async function () {
      await blockFind.registerItem("Laptop", "MacBook Base", "contact@email.com", "deleteHash", "img_url");
    });

    it("should allow owner to delete item", async function () {
      await expect(blockFind.deleteItem(1))
        .to.emit(blockFind, "ItemDeleted")
        .withArgs(1);

      const item = await blockFind.getItem(1);
      // When deleted, owner addresses default back to standard zero-address
      expect(item.owner).to.equal(ethers.ZeroAddress);
    });

    it("should reject non-owner from deleting", async function () {
      await expect(
        blockFind.connect(other).deleteItem(1)
      ).to.be.revertedWith("Not owner");
    });

    it("should allow reusing a QR hash after deletion", async function () {
      await blockFind.deleteItem(1);
      // Wait, let's verify if the QR hash is truly cleared by trying to register it again
      await expect(
        blockFind.registerItem("New Laptop", "Air", "contact@email.com", "deleteHash", "img_url")
      ).to.not.be.reverted;
    });

    it("should revert if item is already deleted or doesn't exist", async function () {
      await expect(blockFind.deleteItem(99)).to.be.revertedWith("Item does not exist");
      
      await blockFind.deleteItem(1);
      await expect(blockFind.deleteItem(1)).to.be.revertedWith("Item already deleted");
    });
  });
});
