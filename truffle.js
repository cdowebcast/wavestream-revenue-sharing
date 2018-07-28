require('babel-register')

const GWEI = 1000000000
const MAINNET_GAS_PRICE = 1 * GWEI

module.exports = {
  networks: {
    local: {
      host: 'localhost',
      port: 9545,
      network_id: 1337,
      gas: 4712388,
      gasPrice: 1 * GWEI,
    },
    rinkeby: {
      host: 'localhost',
      port: 9545,
      network_id: 4,
      gas: 6650000,
      gasPrice: 2 * GWEI,
    },
    live: {
      host: 'localhost',
      port: 8545,
      network_id: 1,
      gas: 7000000,
      gasPrice: MAINNET_GAS_PRICE,
    },
    coverage: {
      host: 'localhost',
      port: 8555,
      network_id: '*',
      gas: 0xfffffffffff,
      gasPrice: 1,
    },
  },
  mocha: {
    enableTimeouts: false,
  },
}
