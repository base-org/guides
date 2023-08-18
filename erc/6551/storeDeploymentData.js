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

const fs = require('fs');
function storeDeploymentData(
  contractName,
  contractAddress,
  deployer,
  deploymentHash,
  deploymentFile
) {
  const deploymentData = {
    [contractName]: {
      address: contractAddress,
      deployer: deployer,
      deploymentHash: deploymentHash,
    },
  };

  if (!fs.existsSync(deploymentFile)) {
    fs.closeSync(fs.openSync(deploymentFile, 'w'));
  }

  const file = fs.readFileSync(deploymentFile);

  if (file.length == 0) {
    fs.writeFileSync(deploymentFile, JSON.stringify([deploymentData]));
    console.log(`Saved deployment data to a new file: ${deploymentFile}`);
  } else {
    const json = JSON.parse(file.toString());
    json.push(deploymentData);
    console.log(json);
    fs.writeFileSync(deploymentFile, JSON.stringify(json));
    console.log(`Deployment data saved to: ${deploymentFile}`);
  }
}

module.exports = storeDeploymentData;
