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
const { expect, assert } = require('chai');
require('dotenv').config();

describe('Contract deployments', () => {
  it('Deploys an ERC721 Token', async () => {
    const contract = await hre.ethers.deployContract('Token');
    await contract.waitForDeployment();
    assert.ok(contract.target);
    console.log(contract.target);
  });
  it('Deploys an ERC6551 Registry', async () => {
    const contract = await hre.ethers.deployContract('ERC6551Registry');
    await contract.waitForDeployment();
    assert.ok(contract.target);
    console.log(contract.target);
  });
  it('Deploys an ERC6551 Account Implementation', async () => {
    const contract = await hre.ethers.deployContract('ERC6551Account');
    await contract.waitForDeployment();
    assert.ok(contract.target);
    console.log(contract.target);
  });
});

describe('ERC721 Ownership', () => {
  let nftContract;
  let address;
  let provider;
  let signer;
  beforeEach(async () => {
    provider = ethers.provider;
    signer = await provider.getSigner(0);
    address = signer.address;
    nftContract = await hre.ethers.deployContract('Token');
    await nftContract.waitForDeployment();
  });
  it('Mints a token to the signer', async () => {
    await nftContract.mint(address);
    const expected = address;
    const actual = await nftContract.ownerOf(0);
    assert.equal(actual, expected, 'owner is the signer');
  });
  it('Returns correct token count', async () => {
    await nftContract.mint(address);
    const actual = Number(await nftContract.getTokenIds());
    const expected = 1;
    assert.equal(actual, expected, 'returns correct supply');
    console.log('Total supply: ', actual);
  });
});

describe('Registry Contract', () => {
  let nftContract;
  let registryContract;
  let erc6551Implementation;
  let provider;
  let signer;
  let chainId;
  beforeEach(async () => {
    provider = ethers.provider;
    signer = await provider.getSigner(0);
    chainId = (await hre.ethers.provider.getNetwork()).chainId;
    nftContract = await hre.ethers.deployContract('Token');
    registryContract = await hre.ethers.deployContract('ERC6551Registry');
    erc6551Implementation = await hre.ethers.deployContract('ERC6551Account');
    nftContract.waitForDeployment();
    registryContract.waitForDeployment();
    erc6551Implementation.waitForDeployment();
  });
  it('creates a smart contract account', async () => {
    await nftContract.mint(signer.address);
    const tokenId = Number(await nftContract.getTokenIds()) - 1;
    const computedAddress = await registryContract.account(
      erc6551Implementation.target,
      chainId,
      nftContract.target,
      tokenId,
      0
    );

    const tx = await registryContract.createAccount(
      erc6551Implementation.target,
      chainId,
      nftContract.target,
      tokenId,
      0,
      '0x'
    );

    await tx.wait(1);
    assert.ok(ethers.isAddress(computedAddress));
  });
  it('can send and receive ETH', async () => {
    await nftContract.mint(signer.address);
    const tokenId = Number(await nftContract.getTokenIds()) - 1;
    const computedAddress = await registryContract.account(
      erc6551Implementation.target,
      chainId,
      nftContract.target,
      tokenId,
      0
    );
    await registryContract.createAccount(
      erc6551Implementation.target,
      chainId,
      nftContract.target,
      tokenId,
      0,
      '0x'
    );
    const value = hre.ethers.parseEther('0.0125');
    const balanceBefore = await provider.getBalance(computedAddress);
    console.log('Balance before: ', balanceBefore);
    await signer.sendTransaction({ to: computedAddress, value: value });
    const balanceAfter = await provider.getBalance(computedAddress);
    assert.equal(Number(balanceAfter - value), 0);
  });
});

describe('Token bound account access control', () => {
  let signer;
  let receipient;
  let chainId;
  let nftContract;
  let registryContract;
  let erc6551Implementation;
  let computedAddress;
  let tokenId;
  beforeEach(async () => {
    signer = await ethers.provider.getSigner(0);
    receipient = process.env.WALLET2_ADDR;
    chainId = (await hre.ethers.provider.getNetwork()).chainId;
    nftContract = await hre.ethers.deployContract('Token');
    registryContract = await hre.ethers.deployContract('ERC6551Registry');
    erc6551Implementation = await hre.ethers.deployContract('ERC6551Account');
    await nftContract.mint(receipient);
    tokenId = Number(await nftContract.getTokenIds()) - 1;
    await registryContract.createAccount(
      erc6551Implementation.target,
      chainId,
      nftContract.target,
      tokenId,
      0,
      '0x'
    );
    computedAddress = await registryContract.account(
      erc6551Implementation.target,
      chainId,
      nftContract.target,
      tokenId,
      0
    );
  });
  it('only allows owner to transfer funds', async () => {
    const value = hre.ethers.parseEther('0.0125');
    const balanceBefore = await hre.ethers.provider.getBalance(computedAddress);
    console.log('Balance before: ', balanceBefore);
    await signer.sendTransaction({ to: computedAddress, value: value });
    const balanceAfter = await hre.ethers.provider.getBalance(computedAddress);
    console.log(balanceAfter);
    console.log('token owner: ', await nftContract.ownerOf(tokenId));
    await expect(
      erc6551Implementation.send(signer.address, hre.ethers.parseEther('.005'))
    ).to.be.reverted;
  });
});
