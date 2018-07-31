import chai from 'chai'
import BigNumber from 'bignumber.js'
import traverse from 'traverse'

export const assert = chai.assert

export function getAddresses(accounts) {
  const [owner, shareHolder1, shareHolder2, shareHolder3, anonymous] = accounts
  return {
    owner,
    shareholders: [shareHolder1, shareHolder2, shareHolder3],
    anonymous,
  }
}

export async function assertRevert(promise, message) {
  try {
    await promise
  } catch (error) {
    const revertFound = error.message.search('revert') >= 0
    assert(
      revertFound,
      `Expected "revert", got ${error} instead${
        message ? ` (${message})` : ''
      }`,
    )
    return
  }
  assert(false, 'Expected revert not received')
}

assert.bignumEqual = function assertBignumEqual(actual, expected, message) {
  const actualStr = new BigNumber(actual.toString()).toString()
  const expectedStr = new BigNumber(expected.toString()).toString()
  assert.equal(actualStr, expectedStr, message)
}

export async function assertTxSucceedsGeneratingEvents(
  txResultPromise,
  expectedEvents,
  message,
) {
  const txProps = await assertTxSucceeds(txResultPromise, message)
  assertTxEvents(txProps.events, expectedEvents, message)
  return txProps
}

export function assertTxEvents(events, expectedEvents, message) {
  const stringifiedExpectedEvents = recursivelyStringifyBigNumbers(
    expectedEvents,
  )

  const stringifiedTxEvents = recursivelyStringifyBigNumbers(events)

  assert.deepEqual(
    stringifiedTxEvents,
    stringifiedExpectedEvents,
    message ? `${message}, tx events` : `tx events`,
  )
}

export async function inspectTransaction(txResultPromise) {
  const txResult = await txResultPromise
  const tx = await promisifyCall(web3.eth.getTransaction, web3.eth, [
    txResult.tx,
  ])
  const {receipt} = txResult
  const success =
    receipt.status !== undefined
      ? +toBigNumber(receipt.status, 0) === 1 // Since Byzantium fork
      : receipt.gasUsed < tx.gas // Before Byzantium fork (current version of TestRPC)
  const txPriceWei = new BigNumber(tx.gasPrice).times(receipt.gasUsed)
  const events = txResult.logs
    .map(log => (log.event ? {name: log.event, args: fixArgs(log.args)} : null))
    .filter(x => !!x)
  return {result: txResult, success, txPriceWei, events}
}

// See: https://github.com/trufflesuite/truffle-contract/issues/106.
// There needs to be deep inspection instead of shallow one to handle arrays of BNs.
function fixArgs(args) {
  const result = {}

  Object.keys(args).forEach(key => {
    const val = args[key]
    result[key] = Array.isArray(val) ? val.map(item => fixBN(item)) : fixBN(val)
  })

  return result
}

function fixBN(val) {
  // Sometimes, truffle returns objects representing big numbers, but which are
  // not web3.BigNumbers. We need to convert them to our version of BigNumber
  // as well.
  return val instanceof web3.BigNumber ||
    (val && val.constructor && val.constructor.isBN)
    ? new BigNumber('0x' + val.toString(16))
    : val
}

function toBigNumber(val, defaultVal) {
  try {
    return new BigNumber(val)
  } catch (err) {
    return new BigNumber(defaultVal)
  }
}

export async function assertTxSucceeds(txResultPromise, message) {
  let txProps
  try {
    txProps = await inspectTransaction(txResultPromise)
  } catch (err) {
    assert(
      false,
      `${message ? message + ': ' : ''}transaction was expected to ` +
        `succeed but failed: ${err.message}`,
    )
  }
  if (!txProps.success) {
    assert(
      false,
      `${
        message ? message + ': ' : ''
      }transaction was expected to succeed but failed`,
    )
  }
  return txProps
}

function recursivelyStringifyBigNumbers(obj) {
  return traverse(obj).map(function(x) {
    // version of BigNumber bundled into web3 doesn't have isBigNumber function
    if (BigNumber.isBigNumber(x) || x instanceof web3.BigNumber) {
      this.update(x.toString(10))
    }
  })
}

function promisifyCall(fn, ctx, args = []) {
  return new Promise((resolve, reject) => {
    args.push((err, result) => {
      if (err) {
        reject(err)
      } else {
        resolve(result)
      }
    })
    fn.apply(ctx, args)
  })
}
