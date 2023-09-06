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

const { keccak256 } = require('@ethersproject/keccak256');
const { defaultAbiCoder } = require('@ethersproject/abi');
const { HashZero } = require('@ethersproject/constants');

const { mnemonic, alchemyKey } = require('./secrets.json');
const l1BridgeAbi = require('./abi/l1standardbridge.json');
const tokenAbi = require('./abi/erc20.json');
const l2BridgeAbi = require('./abi/l2standardbridge.json');
const l2Tol1MessagePasserAbi = require('./abi/l2tol1messagepasser.json');
const l2OuputOracleAbi = require('./abi/l2OutputOracle.json');
const optimismPortalAbi = require('./abi/optimismPortal.json');

require('@nomicfoundation/hardhat-toolbox');
require('@nomicfoundation/hardhat-ethers');

const l2ExplorerApi = 'https://base-goerli.blockscout.com/api';
const l1StandardBridge = '0xfA6D8Ee5BE770F84FC001D098C4bD604Fe01284a';
const l2Bridge = '0x4200000000000000000000000000000000000010';
const l2ToL1MessagePasser = '0x4200000000000000000000000000000000000016';
const l2OutputOracle = '0x2A35891ff30313CcFa6CE88dcf3858bb075A2298';
const optimismPortal = '0xe93c8cD0D409341205A592f8c4Ac1A5fe5585cfA';

const defaultGasAmount = '100000';
const emptyData = '0x';

const getBaseWallet = () => {
  // Create a wallet from the mnemonic
  const wallet = ethers.Wallet.fromPhrase(mnemonic);

  // Create a provider using the wallet
  const provider = new ethers.JsonRpcProvider(
    hreConfig.networks['base-goerli'].url
  ); // Replace with your Infura Project ID or your preferred Ethereum node URL

  // Set the provider for the wallet
  const signer = wallet.connect(provider);

  return signer;
};

const getL1Wallet = () => {
  // Create a wallet from the mnemonic
  const wallet = ethers.Wallet.fromPhrase(mnemonic);

  // Create a provider using the wallet
  const provider = new ethers.JsonRpcProvider(hreConfig.networks['goerli'].url); // Replace with your Infura Project ID or your preferred Ethereum node URL

  // Set the provider for the wallet
  const signer = wallet.connect(provider);

  return signer;
};

const getPortalContract = (signer) => {
  const portalContract = new ethers.Contract(
    optimismPortal,
    optimismPortalAbi,
    signer
  );
  return portalContract;
};

const getOracleContract = (signer) => {
  const oracleContract = new ethers.Contract(
    l2OutputOracle,
    l2OuputOracleAbi,
    signer
  );
  return oracleContract;
};

const getMessageContract = (signer) => {
  const messageContract = new ethers.Contract(
    l2ToL1MessagePasser,
    l2Tol1MessagePasserAbi,
    signer
  );
  return messageContract;
};

const getL1StandardBridgeContract = (signer) => {
  const bridgeContract = new ethers.Contract(
    l1StandardBridge,
    l1BridgeAbi,
    signer
  );
  return bridgeContract;
};

const makeStateTrieProof = async (provider, blockNumber, address, slot) => {
  const proof = await provider.send('eth_getProof', [
    address,
    [slot],
    blockNumber,
  ]);

  return {
    accountProof: proof.accountProof,
    storageProof: proof.storageProof[0].proof,
    storageValue: BigInt(proof.storageProof[0].value),
    storageRoot: proof.storageHash,
  };
};

const hashWithdrawal = (withdrawalMessage) => {
  const types = [
    'uint256',
    'address',
    'address',
    'uint256',
    'uint256',
    'bytes',
  ];
  const encoded = defaultAbiCoder.encode(types, [
    withdrawalMessage.nonce,
    withdrawalMessage.sender,
    withdrawalMessage.target,
    withdrawalMessage.value,
    withdrawalMessage.gasLimit,
    withdrawalMessage.data,
  ]);
  return keccak256(encoded);
};

const getWithdrawalMessage = async (messageContract, withdrawal) => {
  const messageLog = withdrawal.logs.find((log) => {
    if (log.address === l2ToL1MessagePasser) {
      const parsed = messageContract.interface.parseLog(log);
      console.log('parsed', parsed);
      return parsed.name === 'MessagePassed';
    }
    return false;
  });
  console.log('messageLog', messageLog);

  const parsedLog = messageContract.interface.parseLog(messageLog);
  const withdrawalMessage = {
    nonce: parsedLog.args.nonce,
    sender: parsedLog.args.sender,
    target: parsedLog.args.target,
    value: parsedLog.args.value,
    gasLimit: parsedLog.args.gasLimit,
    data: parsedLog.args.data,
  };
  console.log('withdrawalMessage', withdrawalMessage);
  return withdrawalMessage;
};

const fetchTransactions = async (address) => {
  const params = {
    address,
    action: 'txlist',
    module: 'account',
    filterby: 'from',
    startblock: '0',
  };
  const searchParams = new URLSearchParams(params).toString();
  const url = new URL(l2ExplorerApi);
  url.search = searchParams;
  const transactions = await fetch(url, {
    headers: {
      Accept: 'application/json',
    },
  });
  const data = await transactions.json();
  return data;
};

task('balance', "Prints an account's balance").setAction(async (taskArgs) => {
  const signer = await ethers.provider.getSigner();
  const balance = await ethers.provider.getBalance(await signer.getAddress());

  console.log(ethers.formatEther(balance), 'ETH');
});

task('bridge', 'Bridges ETH to base-goerli')
  .addParam('amount', 'The amount to bridge')
  .setAction(async (taskArgs) => {
    const signer = await ethers.provider.getSigner();

    const bridgeContract = getL1StandardBridgeContract(signer);

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

    const bridgeContract = getL1StandardBridgeContract(signer);

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
        l1StandardBridge
      );
      if (allowance < fmtAmount) {
        console.log('approve bridge to access token');
        const approveResult = await tokenContract.approve(
          l1StandardBridge,
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

task(
  'withdrawal',
  'Initiates a native token withdrawal from base-goerli to goerli'
)
  .addParam('amount', 'The amount to bridge')
  .setAction(async (taskArgs) => {
    const signer = await getBaseWallet();

    const messageContract = getMessageContract(signer);

    const nonce = await messageContract.messageNonce();
    console.log('messageNonce', nonce);

    const fmtAmount = ethers.parseUnits(taskArgs.amount);
    console.log('fmtAmount', fmtAmount);

    try {
      const bridgeResult = await messageContract.initiateWithdrawal(
        signer.address,
        defaultGasAmount,
        emptyData,
        { value: fmtAmount }
      );
      console.log('withdrawal result', bridgeResult);
      const transactionReceipt = await bridgeResult.wait();
      console.log('withdrawal transaction receipt', transactionReceipt);
    } catch (e) {
      console.log('withdrawal error', e);
    }
  });

task(
  'proveWithdrawal',
  'Proves a native token withdrawal from base-goerli to goerli'
)
  .addParam('tx', 'The transaction hash of the withdrawal')
  .setAction(async (taskArgs) => {
    const signer = await getBaseWallet();

    const l1Signer = await getL1Wallet();

    const oracleContract = getOracleContract(l1Signer);

    const messageContract = getMessageContract(signer);

    const portalContract = getPortalContract(l1Signer);

    const withdrawal = await signer.provider.getTransactionReceipt(taskArgs.tx);
    console.log('withdrawal receipt', withdrawal.blockNumber, withdrawal);

    const l2OutputIdx = await oracleContract.getL2OutputIndexAfter(
      withdrawal.blockNumber
    );
    console.log('l2OutputIdx', l2OutputIdx);

    const l2Output = await oracleContract.getL2Output(l2OutputIdx);
    console.log('l2Output', l2Output);

    const withdrawalMessage = await getWithdrawalMessage(
      messageContract,
      withdrawal
    );

    const hashedWithdrawal = hashWithdrawal(withdrawalMessage);

    const messageSlot = keccak256(
      defaultAbiCoder.encode(
        ['bytes32', 'uint256'],
        [hashedWithdrawal, HashZero]
      )
    );

    const l2BlockNumber = '0x' + BigInt(l2Output[2]).toString(16);

    const proof = await makeStateTrieProof(
      signer.provider,
      l2BlockNumber,
      l2ToL1MessagePasser,
      messageSlot
    );
    console.log('proof', proof);

    const block = await signer.provider.send('eth_getBlockByNumber', [
      l2BlockNumber,
      false,
    ]);
    console.log('block', block);

    const outputProof = {
      version: HashZero,
      stateRoot: block.stateRoot,
      messagePasserStorageRoot: proof.storageRoot,
      latestBlockhash: block.hash,
    };
    console.log('outputProof', outputProof);

    try {
      const proving = await portalContract.proveWithdrawalTransaction(
        withdrawalMessage,
        l2OutputIdx,
        outputProof,
        proof.storageProof
      );
      console.log('proving', proving);
      const result = await proving.wait();
      console.log('proving result', result);
    } catch (e) {
      console.log('withdrawal error', e);
    }
  });

task(
  'finalizeWithdrawal',
  'Finalizes a native token withdrawal from base-goerli to goerli'
)
  .addParam('tx', 'The transaction hash of the withdrawal')
  .setAction(async (taskArgs) => {
    const signer = await getBaseWallet();

    const l1Signer = await getL1Wallet();

    const portalContract = getPortalContract(l1Signer);

    const messageContract = getMessageContract(signer);

    const withdrawal = await signer.provider.getTransactionReceipt(taskArgs.tx);
    console.log('withdrawal receipt', withdrawal.blockNumber, withdrawal);

    const msg = await getWithdrawalMessage(messageContract, withdrawal);
    console.log('msg', msg);
    try {
      const finalizing = await portalContract.finalizeWithdrawalTransaction(
        msg
      );
      console.log('finalizing', finalizing);
      const result = await finalizing.wait();
      console.log('finalizing result', result);
    } catch (e) {
      console.log('finalize error', e);
    }
  });

task('fetchWithdrawals', 'Fetchs all withdrawals').setAction(
  async (taskArgs) => {
    const signer = await getBaseWallet();

    const l1Signer = await getL1Wallet();

    const portalContract = getPortalContract(l1Signer);

    const messageContract = getMessageContract(signer);

    const oracleContract = getOracleContract(l1Signer);

    try {
      const data = await fetchTransactions(await signer.getAddress());
      const withdrawals = data.result.filter((tx) => {
        if (tx.isError === '1') return false;
        if (tx.to === l2ToL1MessagePasser && tx.value !== '0') return true;
        if (tx.to === optimismPortal && tx.value !== '0') return true;
        return false;
      });
      console.log('raw transactions', withdrawals);

      const latestBlockNumber = await oracleContract.latestBlockNumber();
      const finalizationPeriod =
        await oracleContract.FINALIZATION_PERIOD_SECONDS();
      for (let i = 0; i < withdrawals.length; i++) {
        const withdrawal = withdrawals[i];
        const receipt = await signer.provider.getTransactionReceipt(
          withdrawal.hash
        );
        console.log('receipt', receipt);
        const wm = await getWithdrawalMessage(messageContract, receipt);
        const hash = hashWithdrawal(wm);
        const isFinalized = await portalContract.finalizedWithdrawals(hash);
        withdrawal.isFinalized = isFinalized;

        const rawProof = await portalContract.provenWithdrawals(hash);
        withdrawal.rawProof = rawProof;
        const isProven = rawProof[0] !== HashZero;
        withdrawal.isReadyToFinalize =
          Math.floor(Date.now() / 1000) > rawProof[1] + finalizationPeriod &&
          !isFinalized &&
          isProven;
        withdrawal.isProven = isProven;
        withdrawal.isReadyToProve =
          latestBlockNumber >= receipt.blockNumber && !isFinalized && !isProven;
      }

      console.log('withdrawals', withdrawals);
      const sorted = withdrawals.sort((a, b) => {
        return a.timeStamp > b.timeStamp;
      });
      const withdrawalTable = sorted.map((withdrawal) => ({
        hash:
          withdrawal.hash.substring(0, 6) +
          '...' +
          withdrawal.hash.substring(withdrawal.hash.length - 6),
        value: withdrawal.value,
        isReadyToProve: withdrawal.isReadyToProve,
        isProven: withdrawal.isProven,
        isReadyToFinalize: withdrawal.isReadyToFinalize,
        isFinalized: withdrawal.isFinalized,
      }));
      console.table(withdrawalTable);
    } catch (e) {
      console.log('fetch withdrawals error', e);
    }
  }
);

/** @type import('hardhat/config').HardhatUserConfig */
const hreConfig = {
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
module.exports = hreConfig;
