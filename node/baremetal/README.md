# Bare Metal Base Node Operation

The goal of this guide is to set up a fully synced Base node running on bare metal,
including an L1 Ethereum node to support the L1 -> L2 data feed.

The clients in use are as follows:

- Geth - L1 Ethereum execution client
- Prysm - L1 Ethereum consensus client
- OP-Geth - L2 execution client for Base
- OP-Node - L2 rollup client for Base

Base is built on top of the [Optimism Bedrock stack](https://community.optimism.io/docs/developers/bedrock/)
which is why the clients are referred to as OP-Geth and OP-Node. They are run
with ChainID 8453, which is the L2 chain ID for Base.

## Hardware Requirements

For running all 4 binaries (Eth Execution layer, Eth Consensus Layer, OP-Geth,
and OP-Node) on mainnet, we recommend the following specs:

- At least 32GB of RAM
- At least 2 TB of storage
- At least 4 CPU cores

Some recommended sources for good devices for home-labbing include
[Intel Nuc](https://www.intel.com/content/www/us/en/products/details/nuc.html)
and [System76](https://system76.com/).

## Software Requirements

This guide was built using Ubuntu 22.04.3 LTS. All commands are going to be run
using APT, but you can use your preferred package manager if on a different type of OS.

This configuration utilizes systemd to run the nodes as services. This will
ensure the nodes are always running in the background, and will automatically
restart on a system reboot. It also provides journald for automatic logging.

## Setup Ethereum

In order to get the latest L2 chain data on your Base node, you will need to have
an L1 source. This first section of the guide details setting up a full Ethereum
node locally, but if you want to use a third party provider, there are several
node providers listed [in the Base Documentation](https://docs.base.org/tools/node-providers).

1. First, ensure your system is updated and upgraded:

```bash
sudo apt update && sudo apt upgrade -y
```

2. Install Geth:

```bash
sudo add-apt-repository -y ppa:ethereum/ethereum
sudo apt install ethereum
```

3. Create a directory to hold the data for Ethereum:

```bash
sudo mkdir -p /opt/ethereum/geth/data
sudo mkdir /opt/ethereum/prysm
```

4. Install Prysm

```bash
# if not already installed
sudo apt install curl

cd /opt/ethereum/prysm
sudo curl https://raw.githubusercontent.com/prysmaticlabs/prysm/master/prysm.sh --output prysm.sh && chmod +x prysm.sh
```

and add a folder for data:

```bash
sudo mkdir /opt/ethereum/prysm/data
```

5. Create a JWT secret for Geth

```bash
cd /opt/ethereum/prysm
sudo ./prysm.sh beacon-chain generate-auth-secret
```

6. Configure systemd to run Geth

Add a new file called `/etc/systemd/system/geth.service`:

```bash
[Unit]
Description=Geth Mainnet Ethereum Client
Wants=prysm.service

[Service]
ExecStart=/usr/bin/geth --syncmode "snap" \
        --http \
        --http.api "eth,net,web3,personal" \
        --cache=2048 \
        --maxpeers=25 \
        --datadir PATHTO/ethereum/geth/data \
        --port 30303 \
        --http.port 8545 \
        --authrpc.jwtsecret /opt/ethereum/prysm/jwt.hex
Restart=always
RestartSec=60
TimeoutSec=180
KillMode=process

[Install]
WantedBy=multi-user.target
```

7. Configure systemd to run Prysm

Add a new file called `/etc/systemd/system/prysm.service`:

```bash
[Unit]
Description=Prysm Mainnet Consensus Client
After=network.target
After=geth.service
Wants=geth.service
Requires=network.target
StartLimitIntervalSec=0

[Service]
ExecStart=/bin/bash /opt/ethereum/prysm/prysm.sh beacon-chain \
        --execution-endpoint=http://localhost:8551 \
        --jwt-secret=PATHTO/ethereum/prysm/jwt.hex \
        --checkpoint-sync-url=https://sync-mainnet.beaconcha.in \
        --genesis-beacon-api-url=https://sync-mainnet.beaconcha.in \
        --datadir=PATHTO/ethereum/prysm/data
WorkingDirectory=/opt/ethereum/prysm
Restart=always
RestartSec=60
TimeoutSec=180
KillMode=process
Environment="USE_PRYSM_MODERN=true"

[Install]
WantedBy=multi-user.target
```

8. Enable the new services to run with the following commands:

```bash
sudo systemctl daemon-reload
sudo systemctl enable geth.service
sudo systemctl enable prysm.service
sudo systemctl start geth.service
```

The first command refreshes systemd to recognize the new services, and the second
command enables the services to run on startup. The third command starts the
services. You only need to call start on geth.service as it is set with
`Wants=prysm.service` and will trigger the startup of that service.

Before moving forward you can confirm the two services have started up using the
following command for geth:

```bash
sudo systemctl status geth
```

and the following command for prysm:

```bash
sudo systemctl status prysm
```

8. Wait for the L1 node to sync. This can take a day or so to fully catch up
   with the latest blocks.

## Set up Base Node

Base nodes are run as a combination of two clients. One is [OP-Geth](https://github.com/ethereum-optimism/op-geth),
which is a forked version of Geth that does the block creation for the L2. The
other is the [OP-Node](https://github.com/ethereum-optimism/optimism/tree/develop/op-node),
which handles the rollup processing from L1 sources as well as the L2 -> L1 data feed.

In order to run all of these as root, you will need to add `go` to the root path:

1. Edit the sudo config: `sudo visudo`
2. Locate the line staring with `Defaults    secure_path =`
3. Add `:/usr/local/go/bin` to the end of the line
4. Save with `^O` and exit with `^X`

This will let you build the necessary packages with golang as a root user.

After setting Go up to be runnable as root, Base can be set up with the correct
directory structure and packages:

1. Create the root `base` folder:

```bash
sudo mkdir /opt/base
```

2. Create the root base data folder:

```bash
sudo mkdir -p /opt/basedata/geth/chaindata
```

3. Clone the [OP-Geth repo](https://github.com/ethereum-optimism/op-geth) with the
   latest release:

```bash
cd /opt/base
sudo git clone https://github.com/ethereum-optimism/op-geth.git --branch v1.101200.1 --single-branch op-geth-repo
cd op-geth-repo
sudo git switch -c branch-v1.101200.1
```

3. Build the op-geth package and return to the root of the `base` folder

```bash
sudo go run build/ci.go install -static ./cmd/geth
cd ../
```

4. Clone the [OP-Node repo](https://github.com/ethereum-optimism/optimism/tree/develop/op-node)
   with the latest release used by Base:

```bash
sudo git clone https://github.com/ethereum-optimism/optimism.git --branch op-node/v1.1.4 --single-branch op-node-repo
cd op-node-repo
sudo git switch -c branch-op-node/v1.1.4
```

5. Build the op-node package and return back to the root of `base`:

```bash
cd op-node
sudo make op-node
cd ../../
```

6. Copy the execution commands to the base level folder:

```bash
sudo cp op-node-repo/op-node/bin/op-node .
sudo cp op-geth-repo/build/bin/geth .
```

7. Add a new environment variable file. For mainnet, `.env.mainnet` can be used
   to make it clear these are mainnet configurations:

```bash
sudo touch .env.mainnet
```

8. Add the following contents to the `.env.mainnet` file:

```bash
OP_GETH_GENESIS_FILE_PATH=mainnet/genesis-l2.json
OP_GETH_SEQUENCER_HTTP=https://mainnet-sequencer.base.org

# [optional] used to enable geth stats:
# OP_GETH_ETH_STATS=nodename:secret@host:port

# [recommended] replace with your preferred L1 (Ethereum, not Base) node RPC URL:
OP_NODE_L1_ETH_RPC=http://localhost:8545

OP_NODE_L2_ENGINE_AUTH=/opt/base/engine-auth-jwt
OP_NODE_L2_ENGINE_RPC=http://localhost:8553
OP_NODE_LOG_LEVEL=info
OP_NODE_METRICS_ADDR=0.0.0.0
OP_NODE_METRICS_ENABLED=true
OP_NODE_METRICS_PORT=7300
OP_NODE_P2P_AGENT=base
OP_NODE_P2P_BOOTNODES=enr:-J24QNz9lbrKbN4iSmmjtnr7SjUMk4zB7f1krHZcTZx-JRKZd0kA2gjufUROD6T3sOWDVDnFJRvqBBo62zuF-hYCohOGAYiOoEyEgmlkgnY0gmlwhAPniryHb3BzdGFja4OFQgCJc2VjcDI1NmsxoQKNVFlCxh_B-716tTs-h1vMzZkSs1FTu_OYTNjgufplG4N0Y3CCJAaDdWRwgiQG,enr:-J24QH-f1wt99sfpHy4c0QJM-NfmsIfmlLAMMcgZCUEgKG_BBYFc6FwYgaMJMQN5dsRBJApIok0jFn-9CS842lGpLmqGAYiOoDRAgmlkgnY0gmlwhLhIgb2Hb3BzdGFja4OFQgCJc2VjcDI1NmsxoQJ9FTIv8B9myn1MWaC_2lJ-sMoeCDkusCsk4BYHjjCq04N0Y3CCJAaDdWRwgiQG,enr:-J24QDXyyxvQYsd0yfsN0cRr1lZ1N11zGTplMNlW4xNEc7LkPXh0NAJ9iSOVdRO95GPYAIc6xmyoCCG6_0JxdL3a0zaGAYiOoAjFgmlkgnY0gmlwhAPckbGHb3BzdGFja4OFQgCJc2VjcDI1NmsxoQJwoS7tzwxqXSyFL7g0JM-KWVbgvjfB8JA__T7yY_cYboN0Y3CCJAaDdWRwgiQG,enr:-J24QHmGyBwUZXIcsGYMaUqGGSl4CFdx9Tozu-vQCn5bHIQbR7On7dZbU61vYvfrJr30t0iahSqhc64J46MnUO2JvQaGAYiOoCKKgmlkgnY0gmlwhAPnCzSHb3BzdGFja4OFQgCJc2VjcDI1NmsxoQINc4fSijfbNIiGhcgvwjsjxVFJHUstK9L1T8OTKUjgloN0Y3CCJAaDdWRwgiQG,enr:-J24QG3ypT4xSu0gjb5PABCmVxZqBjVw9ca7pvsI8jl4KATYAnxBmfkaIuEqy9sKvDHKuNCsy57WwK9wTt2aQgcaDDyGAYiOoGAXgmlkgnY0gmlwhDbGmZaHb3BzdGFja4OFQgCJc2VjcDI1NmsxoQIeAK_--tcLEiu7HvoUlbV52MspE0uCocsx1f_rYvRenIN0Y3CCJAaDdWRwgiQG
OP_NODE_P2P_LISTEN_IP=0.0.0.0
OP_NODE_P2P_LISTEN_TCP_PORT=9222
OP_NODE_P2P_LISTEN_UDP_PORT=9222
OP_NODE_ROLLUP_CONFIG=mainnet/rollup.json
OP_NODE_RPC_ADDR=0.0.0.0
OP_NODE_RPC_PORT=8549
OP_NODE_SNAPSHOT_LOG=/tmp/op-node-snapshot-log
OP_NODE_VERIFIER_L1_CONFS=4

# OP_NODE_L1_TRUST_RPC allows for faster syncing, but should be used *only* if your L1 RPC node
# is fully trusted. It also allows op-node to work with clients such as Erigon that do not
# support storage proofs:
# OP_NODE_L1_TRUST_RPC=true

OP_NODE_P2P_ADVERTISE_IP=
```

9. For the OP_NODE_P2P_ADVERTISE_IP, you will need to add the public IP address
   of your node. You can find this by running `curl ifconfig.me` on the node.
   Paste the output to the right of the `=` sign.

10. Clone the [Base Node repo](https://github.com/base-org/node):

```bash
sudo git clone https://github.com/base-org/node.git
```

11. Copy the mainnet directory out of this repository. This contains a genesis
    and rollup config file for the OP-Geth and OP-Node binaries:

```bash
sudo cp -r node/mainnet .
```

12. Init the OP-Geth data:

```bash
sudo ./geth --verbosity=3 init --datadir=/opt/basedata/geth/chaindata mainnet/genesis-l2.json
```

This should initialize the data folder with the genesis block and correct chain
data for OP-Geth to run as Base.

13. There needs to be a JWT secret for OP-Geth to run. Place the following in a
    file called `/opt/base/engine-auth-jwt`:

```bash
688f5d737bad920bdfb2fc2f488d6b6209eebda1dae949a8de91398d932c517a
```

Now that all of this configuration is complete, the systemd services can be set up

1. Create a new file called `/etc/systemd/system/op-geth.service`:

```bash
[Unit]
Description=Base Geth Mainnet Client
StartLimitIntervalSec=0
Wants=op-node.service
Requires=network.target
After=prysm.service

[Service]
ExecStart=/opt/base/geth \
        --datadir=/opt/basedata/geth/chaindata \
        --verbosity=3 \
        --http \
        --http.corsdomain="*" \
        --http.vhosts="*" \
        --http.addr=0.0.0.0 \
        --http.port=8547 \
        --http.api=web3,debug,eth,net,engine \
        --authrpc.addr=0.0.0.0 \
        --authrpc.port=8553 \
        --authrpc.vhosts="*" \
        --authrpc.jwtsecret="$OP_NODE_L2_ENGINE_AUTH" \
        --ws \
        --ws.addr=0.0.0.0 \
        --ws.port=8548 \
        --ws.origins="*" \
        --ws.api=debug,eth,net,engine \
        --metrics \
        --metrics.addr=0.0.0.0 \
        --metrics.port=6060 \
        --syncmode=full \
        --gcmode=archive \
        --nodiscover \
        --maxpeers=100 \
        --nat=extip:0.0.0.0 \
        --networkid="8453" \
        --rollup.sequencerhttp=https://mainnet-sequencer.base.org \
        --port=30305
WorkingDirectory=/opt/base
Restart=on-failure
RestartSec=3
EnvironmentFile=/opt/base/.env.mainnet

[Install]
WantedBy=multi-user.target
```

2. Create a new file called `/etc/systemd/system/op-node.service`:

```bash
[Unit]
Description=Base OP Node Client
After=network.target
After=op-geth.service
Requires=op-geth.service
Requires=network.target
StartLimitIntervalSec=0

[Service]
ExecStart=/opt/base/op-node
WorkingDirectory=/opt/base
Restart=on-failure
RestartSec=3
EnvironmentFile=/opt/base/.env.mainnet

[Install]
WantedBy=multi-user.target
```

3. Enable the systemd services:

```bash
sudo systemctl daemon-reload
sudo systemctl enable op-geth.service
sudo systemctl enable op-node.service
sudo systemctl start op-geth.service
```

This will configure the Base node to start automatically on system startup, and
will sequence the node startup as follows:

1. Geth starts
2. Prysm starts
3. OP-Geth starts
4. OP-Node starts

This will ensure the L1 is always running when the L2 starts, and the correct
sequence of each client is maintained.
