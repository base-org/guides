### [Home](../README.md) | [Previous](../ethereum/index.md) | [Next](../base/index.md)

# Smart Contracts and Solidity

<p><img src="./logo.svg"/></p>

Smart Contracts are coded contracts deployed onto a blockchain network. These
contracts are immutable and transactions executed on a smart contract are
irreversible. Understanding how smart contracts work is key to understanding how
Ethereum and Base work. The most popular language for writing smart contracts is
Solidity, which is a high-level, curly bracket, statically typed language. All of
the guides linked below use Solidity as their language of choice, and the best
reference for the language is the docs portal. Anytime you run into an issue with
Solidity, this is the first place to look for answers.

[Base Camp](https://docs.base.org/base-camp/docs/introduction-to-solidity/introduction-to-solidity-overview)
(2 hours) provides a good introduction to Solidity development with specific modules for
token development and building with Hardhat, a popular framework for Ethereum
development. You should complete the full set of tutorials before moving forward.

The Ethereum foundation provides a guide to the ETH Stack. Most of the material
on specific tools are covered in the Base Camp tutorials, so the most important
articles from this are listed below:

| Title                                                                                           | Description                                                                                          |
| ----------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| [Intro to the Stack](https://ethereum.org/en/developers/docs/ethereum-stack/)                   | High level overview of the Ethereum Stack from the EVM up to End-User Dapps                          |
| [Smart Contracts](https://ethereum.org/en/developers/docs/smart-contracts/)                     | Overview of how Smart Contracts work                                                                 |
| [Smart Contracts Languages](https://ethereum.org/en/developers/docs/smart-contracts/languages/) | Covers the programming languages used to develop Smart Contracts on the EVM                          |
| [Smart Contract Anatomy](https://ethereum.org/en/developers/docs/smart-contracts/anatomy/)      | Describes the technical components within a smart contract including storage, functions, events, etc |
| [Smart Contract Libraries](https://ethereum.org/en/developers/docs/smart-contracts/libraries/)  | Explains what Smart Contract libraries are and why they are used                                     |
| [Testing Smart Contracts](https://ethereum.org/en/developers/docs/smart-contracts/testing/)     | The why and how with regards to testing a Smart Contract                                             |
| [Decentralized Storage](https://ethereum.org/en/developers/docs/storage/)                       | How storage works in a decentralized blockchain network                                              |

There are several long tutorials/bootcamps for learning how to develop with
Solidity and Ethereum beyond Base Camp. Alchemy University is a free 7 week full
bootcamp that starts with building on data structures through various Solidity
development modules.

[Devpill.me](https://Devpill.me) is a fantastic resource for learning all aspects of
development on blockchains. It covers not only Solidity/Smart Contract
development but also Frontend, Backend and more roles within the blockchain
ecosystem.

For a fun learning experience of building a game,
[CryptoZombies](https://cryptozombies.io/) teaches how to
build blockchain dapps via simple games.

Before we move on to learning about Base and Optimistic Rollups, there are a
couple of smart contract patterns you should be familiar with. These are
frequently used for upgradeability onchain. Given that deployed contracts are
immutable, several patterns have been developed to allow for versioning between
different deployed versions of a smart contract.

| Pattern           | EIP                                                 | Examples                                                                                                                                                  |
| ----------------- | --------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Upgradeable Proxy | [EIP-1967](https://eips.ethereum.org/EIPS/eip-1967) | [Solidity By Example](https://solidity-by-example.org/app/upgradeable-proxy/)                                                                             |
| Diamond Pattern   | [EIP-2535](https://eips.ethereum.org/EIPS/eip-2535) | [Medium Article on Pattern](https://medium.com/@solidity101/exploring-the-diamond-standard-eip-2535-for-advanced-smart-contract-development-c4f19d7d015e) |

Most if not all smart contract patterns are added to Ethereum through the EIP
process as detailed on their doc site under Standards. Ethereum is always under
development, and new proposals add great features to the blockchain. Because Base
is built on top of Ethereum, these proposals add features that can be
asynchronously integrated onto Base as well. To learn more about how EIPs
propagate to layer 2s, read this article by

Going forward many of the articles will link to specific smart contracts and
EIPs. If you’re curious on how that works in code, Solidity By Example has many
reference examples, and we’ll be calling out specific ones along with articles
explaining how they work.
