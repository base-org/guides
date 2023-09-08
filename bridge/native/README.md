# Native Bridge Examples

This repository collects a couple examples of how to call the smart contracts to bridge native ETH and ERC20 tokens to Base.

## UI

This is a simple example using OP SDK to bridge native ETH.

[Demo](https://op-stack-bridge-example.vercel.app/)

[Code](https://github.com/wilsoncusack/op-stack-bridge-example)

## Hardhat Scripts

Copy secrets.json.sample to secrets.json

```
cp secrets.json.sample secrets.json
```

Add in your test wallet mnemonic and an alchemy key

If you are new to alchemy, a quickstart is [available here](https://docs.alchemy.com/docs/alchemy-quickstart-guide)

To verify the values are correct, check the balance with.

```
npx hardhat balance
```

### Deposits

You can bridge ETH.

```
npx hardhat bridge --amount 0.1
```

You can bridge any supported ERC20 token.

WETH on goerli: 0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6

WETH on base-goerli: 0x4200000000000000000000000000000000000006

If you need WETH, you can wrap easily on [uniswap](https://app.uniswap.org/#/swap?chain=goerli)

Cross-chain token addresses can be found in the [Optimism Token List](https://github.com/ethereum-optimism/ethereum-optimism.github.io)

You bridge a token with

```
npx hardhat bridgeToken --amount 0.01 --l1token 0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6 --l2token 0x4200000000000000000000000000000000000006
```

### Withdrawals

You can fetch existing withdrawals with

```
npx hardhat fetchWithdrawals
```

Withdrawals will have 4 booleans to indicate it's lifecycle.
isReadyToProve, isProven, isReadyToFinalize, and isFinalized

To initiate a native token withdrawal, start with

```
npx hardhat withdraw --amount 0.01
```

The withdrawal will enter a proposing onchain state. Once the withdrawal is proposed and messaged between layer one, the withdrawal can be verified.

```
npx hardhat proveWithdrawal --tx {your transaction hash from above}
```

Once the transaction is proven, the withdrawal has a holding period until it can be finalized. Currently in testnet, this is 12 seconds. Mainnet is 7 days.

Lastly, you can finalize the transaction with

```
npx hardhat finalizeWithdrawal --tx {your transaction hash from above}
```

The same flow can be used for ERC20 tokens. Make sure that the token is supported by the bridge by checking the l2 base, base-goerli addresses and l1 address ethereum, goerli addresses in the [optimism token list](https://github.com/ethereum-optimism/ethereum-optimism.github.io)

```
npx hardhat withdrawalToken --amount 0.01 --token 0x4200000000000000000000000000000000000006
```

## Add your token to Base

If you already have an ERC20 on Ethereum and want to bridge to Base, a guide is available [here](https://docs.base.org/tokens/list)
