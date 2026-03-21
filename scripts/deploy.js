async function main() {
  const BlockFind = await ethers.getContractFactory("BlockFind");
  const contract = await BlockFind.deploy();

  await contract.waitForDeployment();

  console.log("Contract deployed to:", await contract.getAddress());
}

main();