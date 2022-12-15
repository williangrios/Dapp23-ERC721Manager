const hre = require("hardhat");

async function main() {
  const ERC721Token = await hre.ethers.getContractFactory("ERC721Token");
  const erc721Token = await ERC721Token.deploy();

  await erc721Token.deployed();

  console.log(
    `Deployed to ${erc721Token.address}`
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
