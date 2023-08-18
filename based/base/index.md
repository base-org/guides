### [Home](../README.md) | [Previous](../solidity/index.md)

# Base

<p><img src="./Base_Wordmark_Blue.svg"/>

Now that we’ve covered core features of Ethereum as well as how Solidity and
Smart Contract development works, we can dive into learning about Base. To get
started here, read the Guide to Base which provides a well-rounded overview of
the entire protocol. We’ll be breaking down the pieces of this guide so that you
can fully understand how the protocol works.

## Layer 2 Networks

Base is built as a Layer 2 network on top of Ethereum. With the popularity of
Ethereum so high, demand has grown to where transaction speed has gone down and
gas costs have shot up significantly. The solution to scaling Ethereum is using
a Layer 2 blockchain, which is a network that fully functions on its own, but
settles all transactions ultimately to the Ethereum network. Base is a specific
implementation of L2 called an optimistic rollup. To better understand scaling
and optimistic rollups, read the following three articles by Ethereum Foundation:

| Title                                                                                     | Description                                                                                            |
| ----------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| [Scaling](https://ethereum.org/en/developers/docs/scaling/)                               | How Ethereum has scaling issues and the mechanisms to fix them onchain and offchain (Layer 2 Networks) |
| [Optimistic Rollups](https://ethereum.org/en/developers/docs/scaling/optimistic-rollups/) | How optimistic rollup networks work                                                                    |
| [Zero Knowledge Rollups](https://ethereum.org/en/developers/docs/scaling/zk-rollups/)     | How ZK Proof rollup networks work                                                                      |

## OP Bedrock

Base is built on top of the Bedrock upgrade to the Optimism (OP) Stack. To
better understand Optimism Bedrock, we’ll need to dive into Optimism’s
documentation.

| Title                                                                                 | Description                                                               |
| ------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| [Design Philosophy](https://community.optimism.io/docs/protocol/1-design-philosophy/) | Overall design philosophy on how Optimism was built with its core tenets  |
| [Rollup Protocol](https://community.optimism.io/docs/protocol/2-rollup-protocol/#)    | The design of the OP Stack's rollup protocol                              |
| [Bedrock Explainer](https://community.optimism.io/docs/developers/bedrock/)           | How OP Bedrock was designed, covering key information about the Sequencer |

The [Optimism repo](https://github.com/ethereum-optimism/optimism/blob/65ec61dde94ffa93342728d324fecf474d228e1f/specs/README.md) contains the full Bedrock spec.

The following articles cover the Bedrock Data Flows:

| Title                                                                           | Description                                |
| ------------------------------------------------------------------------------- | ------------------------------------------ |
| [Transaction Flow](https://community.optimism.io/docs/protocol/txn-flow/)       | How transactions flow through the OP Stack |
| [Deposit Flow](https://community.optimism.io/docs/protocol/deposit-flow/)       | How deposits work in OP Stack              |
| [Withdrawal Flow](https://community.optimism.io/docs/protocol/withdrawal-flow/) | How withdrawals work in OP Stack           |

Base being built on Bedrock makes it a part of the Superchain, a decentralized
network of chains that share bridging, decentralized governance, upgrades, a
communication layer and more. Optimism provides [this explainer](https://stack.optimism.io/docs/understand/explainer/) for their vision of the Superchain.

## Base Specific Documentation

Base has its own [doc site](https://docs.base.org/) which helps to explain the
specifics of what you need to know to build on the chain. Some highlights include:

| Title                                                            | Description                                                         |
| ---------------------------------------------------------------- | ------------------------------------------------------------------- |
| [Network Information](https://docs.base.org/network-information) | Network information for configuring developer environment endpoints |
| [Key Contract Addresses](https://docs.base.org/base-contracts)   | Addresses of key Smart Contracts deployed from OP Stack code        |
| [How Fees Work](https://docs.base.org/fees)                      | How fees work on the Base network                                   |

Coinbase published a [Guide to Base](https://www.coinbase.com/cloud/discover/protocol-guides/guide-to-base)
which highlights the core features and benefits of the network.

All code that's been open sourced related to Base can be found in [this repo](https://github.com/base-org)
