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

require('@nomicfoundation/hardhat-toolbox');
require('dotenv').config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: '0.8.19',
  },
  networks: {
    // for mainnet
    'base-mainnet': {
      url: 'https://developer-access-mainnet.base.org',
      accounts: [process.env.WALLET_KEY, process.env.WALLET2_KEY],
      chainId: 8453,
    },
    // for testnet
    'base-goerli': {
      url: 'https://goerli.base.org',
      accounts: [process.env.WALLET_KEY, process.env.WALLET2_KEY],
      chainId: 84531,
      gasPrice: 'auto',
    },
    // for local dev environment
    'base-local': {
      url: 'http://127.0.0.1:8545/',
      accounts: [process.env.WALLET_KEY, process.env.WALLET2_KEY],
      chainId: 31337,
      gasPrice: 'auto',
    },
  },
  defaultNetwork: 'base-local',
};
