# Wavestream revenue sharing contract

Ethereum contracts for [Wavestream](https://wavestream.io/) platform revenue sharing. Check out [off-whitepaper](https://wavestream.io/whitepaper/) for details on how WAV token is used to create a zero-cost, adfree music listening experience built on interactive features, fair, transparent artist compensation, and community-driven development.

![wavestream](wavestream.png)

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
