/**
 * Copyright 2023 Coinbase Global, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *  http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const hre = require('hardhat');
const fs = require('fs');
const { deploymentFile } = require('../config');
const deploymentData = fs.readFileSync(deploymentFile, 'utf-8');
const contracts = JSON.parse(deploymentData);

const nftContract = contracts[0].NftContract.address;
const registryContract = contracts[1].ERC6551Registry.address;
const accountImplementation = contracts[2].ERC6551Account.address;

async function getComputedAddress() {
  const chainId = (await hre.ethers.provider.getNetwork()).chainId;
  const ERC6551Registry = await hre.ethers.getContractAt(
    'ERC6551Registry',
    registryContract
  );
  const computedAddress = await ERC6551Registry.account(
    accountImplementation, //implementation address
    chainId,
    nftContract,
    0, //tokenId
    0 //salt
  );
  return computedAddress;
}

async function sendFundsToTokenAccount() {
  const computedAddress = await getComputedAddress();
  const balanceBefore = await hre.ethers.provider.getBalance(computedAddress);
  console.log(`Token account has ${balanceBefore} ETH`);

  const signer = await hre.ethers.provider.getSigner(0);
  const tx = {
    to: computedAddress,
    value: hre.ethers.parseEther('0.0125'),
  };

  await signer.sendTransaction(tx);
  const tokenAccountBalance = Number(
    await hre.ethers.provider.getBalance(computedAddress)
  );
  console.log(`Token account has ${tokenAccountBalance} ETH`);
}

async function transferToken() {
  const signer1 = await hre.ethers.provider.getSigner(0);
  const signer2 = await hre.ethers.provider.getSigner(1);
  const ERC721Contract = await hre.ethers.getContractAt('Token', nftContract);
  const tokenId = 0;
  const currentOwner = await ERC721Contract.ownerOf(tokenId);
  console.log(`Current owner of tokenId ${tokenId} is ${currentOwner}`);
  const ownerContract = ERC721Contract.connect(signer2);
  await ownerContract.transferFrom(signer2.address, signer1.address, tokenId);
  const newOwner = await ERC721Contract.ownerOf(tokenId);
  console.log(`New owner of tokenId ${tokenId} is ${newOwner}`);
}

async function main() {
  sendFundsToTokenAccount();
  transferToken();
}

main();
