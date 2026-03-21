const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("BlockFindModule", (m) => {
  const blockFind = m.contract("BlockFind", []);
  return { blockFind };
});