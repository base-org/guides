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
const storeDeploymentData = require('../storeDeploymentData');
const deploymentData = fs.readFileSync(deploymentFile, 'utf-8');
const contracts = JSON.parse(deploymentData);
const wallet2 = process.env.WALLET2_ADDR;
const contractAddress = contracts[0].NftContract.address;

async function mint() {
  console.log(contractAddress);
  const ERC721Contract = await hre.ethers.getContractAt(
    'Token',
    contractAddress
  );
  console.log('Minting NFT...');
  await ERC721Contract.mint(wallet2);
  const tokenId = Number(await ERC721Contract.getTokenIds()) - 1;
  const owner = await ERC721Contract.ownerOf(tokenId);
  console.log(`TokenId ${tokenId} is owned by address:  ${owner}`);
}

mint().catch((error) => {
  console.log(error);
  process.exitCode = 1;
});
