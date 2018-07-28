const path = require('path')
const fs = require('fs')

// Review and, if necessary, change these constants before deploy

const TOKEN = '0xc2157EedbFe1fA6b3bd072EF7156eA9B1427dcc2'

const SafeMath = artifacts.require('./SafeMath.sol')
const WavSharing = artifacts.require('./WavSharing.sol')

module.exports = async function(deployer, network, accounts) {
  await deployer.link(SafeMath, [WavSharing])

  if (process.env.TEST == '1') {
    return
  }

  //add params
  await deployer.deploy(WavSharing)

  console.log(`Saving WavSharing ABI...`)

  const sharingABI = JSON.stringify(WavSharing.abi) + '\n'
  const sharingABIPath = path.join(__dirname, '..', 'WavSharingABI.json')

  await new Promise((resolve, reject) => {
    fs.writeFile(
      sharingABIPath,
      sharingABI,
      err => (err ? reject(err) : resolve()),
    )
  })

  console.log(`\n`)
  console.log(`WavSharing address: ${WavSharing.address}`)
  console.log(`WavSharing ABI written to:`, path.resolve(sharingABIPath))
}
