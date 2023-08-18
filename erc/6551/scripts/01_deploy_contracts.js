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
const { deploymentFile } = require('../config');
const storeDeploymentData = require('../storeDeploymentData');

const wallet2 = process.env.WALLET2_ADDR;
async function deploy() {
  const provider = new hre.ethers.JsonRpcProvider('http://127.0.0.1:8545/');
  const signer = new hre.ethers.Wallet(process.env.WALLET_KEY, provider);

  const ERC721Contract = await hre.ethers.deployContract('Token');
  await ERC721Contract.waitForDeployment();
  const ERC721ContractAddress = ERC721Contract.target;
  console.log(`ERC-721 Contract deployed at: ${ERC721ContractAddress}`);
  const ERC721DeploymentHash = ERC721Contract.deploymentTransaction().hash;
  storeDeploymentData(
    'NftContract',
    ERC721ContractAddress,
    signer.address,
    ERC721DeploymentHash,
    deploymentFile
  );

  const Registry = await hre.ethers.deployContract('ERC6551Registry');
  await Registry.waitForDeployment();
  const RegistryAddress = Registry.target;
  console.log(`Deployed registry contract at: ${RegistryAddress}`);
  const RegistryDeploymentHash = Registry.deploymentTransaction().hash;
  storeDeploymentData(
    'ERC6551Registry',
    RegistryAddress,
    signer.address,
    RegistryDeploymentHash,
    deploymentFile
  );

  console.log('Deploying Token Bound Account');
  const ERC6551Account = await hre.ethers.deployContract('ERC6551Account');
  await ERC6551Account.waitForDeployment();
  const ERC6551AccountAddress = ERC6551Account.target;
  const ERC6551ContractDeploymentHash =
    ERC6551Account.deploymentTransaction().hash;
  console.log(`Token bound account deployed at: ${ERC6551Account.target}`);
  storeDeploymentData(
    'ERC6551Account',
    ERC6551AccountAddress,
    signer.address,
    ERC6551ContractDeploymentHash,
    deploymentFile
  );
}

deploy().catch((error) => {
  console.log(error);
  process.exitCode = 1;
});
