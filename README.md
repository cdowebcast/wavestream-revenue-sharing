# Wavestream revenue sharing contract

Ethereum contracts for [Wavestream](https://wavestream.io/) platform revenue sharing. Check out [off-whitepaper](https://wavestream.io/whitepaper/) for details on how WAV token is used to create a zero-cost, adfree music listening experience built on interactive features, fair, transparent artist compensation, and community-driven development.

![wavestream](wavestream.png)

## Revenue sharing mechanics

The `WavSharing contract` is designed for trustless distribution of revenue from music streaming on WaveStream platform. The platform and the contract use WAV token for accounting and value transfer.

Contract holds immutable list of shareholders (musicians, producers, music labels, etc.) and their shares. For any changes platform should deploy new instance of the contract and stop sending WAV tokens to the original one. Any shareholder could claim her share of WAV revenue any time by calling `claimShare` Smart contract method. In case all due tokens are already sent to the shareholder address, nothing happens.

Contract calculates due WAV amount for every claim as follows:

```
WAV_share = (totalRevenue - lastShareholderPayoutRevenue) * share
```

Here `totalRevenue` is contract-wide counter of all the revenue received by the contract; `lastShareholderPayoutRevenue` is the value of `totalRevenue` counter from the previous time the shareholder has claimed her share, and the `share` is proportion of revenue assigned to the shareholder. Note that due to specifics of Solidity language used for `WavSharing` Smart contract shares are specified as thousandths fractions, so for instance `250` share in Smart contract translates to 25% of revenue.

## Wavestream platform integration

For every list of revenue shareholders platform would deploy the contract. Every once in a defined time period platform would calculate revenue associated with the contract and send WAV tokens to its address. Shareholders could then claim their revenue share in a trustless manner. To change the list of shareholders or their shares platform ought to deploy new contract and change internal associations.

## Smart contract security notes

`WavSharing` Smart contract is tested to 100% branch coverage, checked with `solium` linter with `security` plugin. To ensure protection from integer overflow errors `SafeMath` library from `OpenZepplin` framework is used.

Note that generally speaking `WavSharing` contract could be exposed to reentrancy attack via `claimShare` method if purposelly coded token contract is used. In real-life scenarios `WavSharing` contract would be used by WaveStream platform with its own WAV token contract, thus negating potential vulnerability.

## Repository structure

Contracts:

* [WavSharing.sol](contracts/WavSharing.sol): revenue sharing contract.

Tests/specification:

* [test-1-happy-path.js](test/test-1-happy-path.js): specification/documentation covering basic usage of revenue sharing contract.
* [test-2-contract-deployment.js](test/test-2-contract-deployment.js): tests for contract pre-deployment checks.
* [test-3-dividends-accounting.js](test/test-3-dividends-accounting.js): tests for total revenue accounting.
* [test-4-shareholder-payouts.js](test/test-4-shareholder-payouts.js): tests for payout amounts and accessibility.

## Development

To deploy contracts, run tests and generate coverage report, you need to install dependencies first. Node.js v8.3.0 or later is required (v9.8.0 or later is recommended). After making sure Node.js is installed, install NPM dependencies:

```
npm install
```

## Dev utilities

#### Running tests

```
npm run test
```

#### Generating test coverage report

```
npm run coverage
```

Coverage report will be located at `coverage.json` and `coverage/index.html`. It is generated with [solidity-coverage](https://github.com/sc-forks/solidity-coverage).

#### Linting Solidity code

```
npm run lint
```

Linting is done using [Solium](https://github.com/duaraghav8/Solium), with additional rules from [security plugin](https://github.com/duaraghav8/solium-plugin-security) and [OpenZeppelin plugin](https://github.com/OpenZeppelin/solium-plugin-zeppelin).

#### Auto-formatting code

```sh
# Fixes Solidity code
npm run tix-sol

# Fixes JavaScript code
npm run fix-js

# Fixes Solidity and JavaScript code
npm run fix
```

## Pre-commit hooks

This project has pre-commit hooks configured. Each time you attempt to commit some code, Solium linter will be ran on all staged Solidity contracts, and Prettier will be ran on all staged JavaScript files in linter mode.

If there are any linter errors or any changes Prettier would make, committing will fail. In this case, inspect commit command output, fix all errors, stage the changes and commit again. Running `npm run fix` will probably fix most of the stuff, but some errors will require manual fixing, e.g. shadowing contract state variable by function-local variable.
