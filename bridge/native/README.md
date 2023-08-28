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

## Add your token to Base

If you already have an ERC20 on Ethereum and want to bridge to Base, a guide is available [here](https://docs.base.org/tokens/list)
