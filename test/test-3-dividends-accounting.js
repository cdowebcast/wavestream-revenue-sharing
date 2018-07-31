import BigNumber from 'bignumber.js'
import {assert, getAddresses} from './helpers'

const WavSharing = artifacts.require('./WavSharing.sol')
const TestToken = artifacts.require('./TestToken.sol')

contract(`WavSharing (dividends accounting):`, accounts => {
  const addr = getAddresses(accounts)

  let token
  let wavSharing
  const shares = [200, 450, 350]
  const revenue = ['10000', '20000']

  before(async () => {
    token = await TestToken.new('1000000e18')
    wavSharing = await WavSharing.new(addr.shareholders, shares, token.address)
  })

  it(`initial totalDividends are zero`, async () => {
    const initialTotalDividends = await wavSharing.totalDividends.call()
    assert.bignumEqual(initialTotalDividends, 0)
  })

  it(`initial shareholder balances are zero`, async () => {
    for (let shareholder of addr.shareholders) {
      const balance = await wavSharing.dividendBalanceOf.call(shareholder)
      assert.bignumEqual(balance, 0)
    }
  })

  it(`increases totalDividends after token transfer to revenue sharing contract`, async () => {
    const newDividends = revenue[0]
    await token.transfer(wavSharing.address, newDividends)
    const totalDividends = await wavSharing.totalDividends.call()
    assert.bignumEqual(totalDividends, newDividends)
  })

  it(`sets correct shareholder balances after token transfer to revenue sharing contract`, async () => {
    for (let i = 0; i < addr.shareholders.length; i++) {
      const shareholder = addr.shareholders[i]
      const balance = await wavSharing.dividendBalanceOf.call(shareholder)
      assert.bignumEqual(
        balance,
        BigNumber(revenue[0])
          .multipliedBy(shares[i])
          .dividedBy(1000),
      )
    }
  })

  it(`doesn't change totalDividends after payout to first shareholder`, async () => {
    const totalDividendsBefore = await wavSharing.totalDividends.call()
    const firstShareholder = addr.shareholders[0]

    await wavSharing.claimDividend({from: firstShareholder})

    const totalDividendsAfter = await wavSharing.totalDividends.call()
    assert.bignumEqual(totalDividendsBefore, totalDividendsAfter)
  })

  it(`sets first shareholder balance to zero after payout`, async () => {
    const firstShareholder = addr.shareholders[0]
    const balance = await wavSharing.dividendBalanceOf.call(firstShareholder)
    assert.bignumEqual(balance, 0)
  })

  it(`doesn't change balances for second and third shareholders after payout to first one`, async () => {
    for (let i = 1; i < addr.shareholders.length; i++) {
      const shareholder = addr.shareholders[i]
      const balance = await wavSharing.dividendBalanceOf.call(shareholder)
      assert.bignumEqual(
        balance,
        BigNumber(revenue[0])
          .multipliedBy(shares[i])
          .dividedBy(1000),
      )
    }
  })

  it(`increases totalDividends after second token transfer to sharing contract`, async () => {
    await token.transfer(wavSharing.address, revenue[1])

    const totalDividends = await wavSharing.totalDividends.call()
    assert.bignumEqual(totalDividends, BigNumber(revenue[0]).plus(revenue[1]))
  })

  it(`doesn't change totalDividends after payout to second shareholder`, async () => {
    const totalDividendsBefore = await wavSharing.totalDividends.call()
    const secondShareholder = addr.shareholders[1]

    await wavSharing.claimDividend({from: secondShareholder})

    const totalDividendsAfter = await wavSharing.totalDividends.call()
    assert.bignumEqual(totalDividendsBefore, totalDividendsAfter)
  })

  it(`doesn't change totalDividends after second payout to first shareholder`, async () => {
    const totalDividendsBefore = await wavSharing.totalDividends.call()
    const firstShareholder = addr.shareholders[0]

    await wavSharing.claimDividend({from: firstShareholder})

    const totalDividendsAfter = await wavSharing.totalDividends.call()
    assert.bignumEqual(totalDividendsBefore, totalDividendsAfter)
  })

  it(`doesn't change totalDividends after payout to third shareholder`, async () => {
    const totalDividendsBefore = await wavSharing.totalDividends.call()
    const thirdShareholder = addr.shareholders[2]

    await wavSharing.claimDividend({from: thirdShareholder})

    const totalDividendsAfter = await wavSharing.totalDividends.call()
    assert.bignumEqual(totalDividendsBefore, totalDividendsAfter)
  })
})
