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

const { mnemonic, alchemyKey } = require('./secrets.json');
const bridgeAbi = require('./abi/l1standardbridge.json');
const tokenAbi = require('./abi/erc20.json');

require('@nomicfoundation/hardhat-toolbox');
require('@nomicfoundation/hardhat-ethers');

const proxyContractAddress = '0xfA6D8Ee5BE770F84FC001D098C4bD604Fe01284a';
// for reference
const bridgeAddress = '0xFe0C2063146E0dFB1E27fc25918a2058bf5c2554';

const defaultGasAmount = '100000';
const emptyData = '0x';

task('balance', "Prints an account's balance").setAction(async (taskArgs) => {
  const signer = await ethers.provider.getSigner();
  const balance = await ethers.provider.getBalance(await signer.getAddress());

  console.log(ethers.formatEther(balance), 'ETH');
});

task('bridge', 'Bridges ETH to base-goerli')
  .addParam('amount', 'The amount to bridge')
  .setAction(async (taskArgs) => {
    const signer = await ethers.provider.getSigner();
    console.log('signer', signer);

    const bridgeContract = new ethers.Contract(
      proxyContractAddress,
      bridgeAbi,
      signer
    );

    const sender = await bridgeContract.l2TokenBridge();
    console.log('sender', sender);

    const fmtAmount = ethers.parseUnits(taskArgs.amount);
    console.log('fmtAmount', fmtAmount);

    try {
      const bridgeResult = await bridgeContract.bridgeETH(
        defaultGasAmount,
        emptyData,
        {
          value: fmtAmount,
        }
      );
      console.log('bridgeResult', bridgeResult);
      const transactionReceipt = await bridgeResult.wait();
      console.log('transactionReceipt', transactionReceipt);
    } catch (e) {
      console.log('bridgeResult error', e);
    }
  });

task('bridgeToken', 'Bridges erc20 token to base-goerli')
  .addParam('amount', 'The amount to bridge')
  .addParam('l1token', 'The token address on goerli')
  .addParam('l2token', 'The token address on base-goerli')
  .setAction(async (taskArgs) => {
    const signer = await ethers.provider.getSigner();
    console.log('signer', signer);

    const bridgeContract = new ethers.Contract(
      proxyContractAddress,
      bridgeAbi,
      signer
    );

    const sender = await bridgeContract.l2TokenBridge();
    console.log('sender', sender);

    const fmtAmount = ethers.parseUnits(taskArgs.amount);
    console.log('fmtAmount', fmtAmount);

    const tokenContract = new ethers.Contract(
      taskArgs.l1token,
      tokenAbi,
      signer
    );

    try {
      const allowance = await tokenContract.allowance(
        await signer.getAddress(),
        proxyContractAddress
      );
      if (allowance < fmtAmount) {
        console.log('approve bridge to access token');
        const approveResult = await tokenContract.approve(
          proxyContractAddress,
          fmtAmount
        );
        console.log('approve result', approveResult);
      } else {
        console.log('token is approved to deposit');
      }

      const bridgeResult = await bridgeContract.depositERC20(
        taskArgs.l1token,
        taskArgs.l2token,
        fmtAmount,
        defaultGasAmount,
        emptyData
      );
      console.log('bridge token result', bridgeResult);
      const transactionReceipt = await bridgeResult.wait();
      console.log('token transaction receipt', transactionReceipt);
    } catch (e) {
      console.log('bridge token result error', e);
    }
  });

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: '0.8.17',
  defaultNetwork: 'goerli',
  networks: {
    hardhat: {},
    goerli: {
      url: 'https://eth-goerli.g.alchemy.com/v2/' + alchemyKey,
      accounts: {
        mnemonic,
      },
      gasPrice: 1000000000,
    },
    'base-goerli': {
      url: 'https://goerli.base.org',
      accounts: {
        mnemonic,
      },
      gasPrice: 1000000000,
    },
  },
};
