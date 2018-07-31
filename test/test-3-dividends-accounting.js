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

  it(`initial totalRevenue are zero`, async () => {
    const initialtotalRevenue = await wavSharing.totalRevenue.call()
    assert.bignumEqual(initialtotalRevenue, 0)
  })

  it(`initial shareholder balances are zero`, async () => {
    for (let shareholder of addr.shareholders) {
      const balance = await wavSharing.ownedShareOf.call(shareholder)
      assert.bignumEqual(balance, 0)
    }
  })

  it(`increases totalRevenue after token transfer to revenue sharing contract`, async () => {
    const newDividends = revenue[0]
    await token.transfer(wavSharing.address, newDividends)
    const totalRevenue = await wavSharing.totalRevenue.call()
    assert.bignumEqual(totalRevenue, newDividends)
  })

  it(`sets correct shareholder balances after token transfer to revenue sharing contract`, async () => {
    for (let i = 0; i < addr.shareholders.length; i++) {
      const shareholder = addr.shareholders[i]
      const balance = await wavSharing.ownedShareOf.call(shareholder)
      assert.bignumEqual(
        balance,
        BigNumber(revenue[0])
          .multipliedBy(shares[i])
          .dividedBy(1000),
      )
    }
  })

  it(`doesn't change totalRevenue after payout to first shareholder`, async () => {
    const totalRevenueBefore = await wavSharing.totalRevenue.call()
    const firstShareholder = addr.shareholders[0]

    await wavSharing.claimShare({from: firstShareholder})

    const totalRevenueAfter = await wavSharing.totalRevenue.call()
    assert.bignumEqual(totalRevenueBefore, totalRevenueAfter)
  })

  it(`sets first shareholder balance to zero after payout`, async () => {
    const firstShareholder = addr.shareholders[0]
    const balance = await wavSharing.ownedShareOf.call(firstShareholder)
    assert.bignumEqual(balance, 0)
  })

  it(`doesn't change balances for second and third shareholders after payout to first one`, async () => {
    for (let i = 1; i < addr.shareholders.length; i++) {
      const shareholder = addr.shareholders[i]
      const balance = await wavSharing.ownedShareOf.call(shareholder)
      assert.bignumEqual(
        balance,
        BigNumber(revenue[0])
          .multipliedBy(shares[i])
          .dividedBy(1000),
      )
    }
  })

  it(`increases totalRevenue after second token transfer to sharing contract`, async () => {
    await token.transfer(wavSharing.address, revenue[1])

    const totalRevenue = await wavSharing.totalRevenue.call()
    assert.bignumEqual(totalRevenue, BigNumber(revenue[0]).plus(revenue[1]))
  })

  it(`doesn't change totalRevenue after payout to second shareholder`, async () => {
    const totalRevenueBefore = await wavSharing.totalRevenue.call()
    const secondShareholder = addr.shareholders[1]

    await wavSharing.claimShare({from: secondShareholder})

    const totalRevenueAfter = await wavSharing.totalRevenue.call()
    assert.bignumEqual(totalRevenueBefore, totalRevenueAfter)
  })

  it(`doesn't change totalRevenue after second payout to first shareholder`, async () => {
    const totalRevenueBefore = await wavSharing.totalRevenue.call()
    const firstShareholder = addr.shareholders[0]

    await wavSharing.claimShare({from: firstShareholder})

    const totalRevenueAfter = await wavSharing.totalRevenue.call()
    assert.bignumEqual(totalRevenueBefore, totalRevenueAfter)
  })

  it(`doesn't change totalRevenue after payout to third shareholder`, async () => {
    const totalRevenueBefore = await wavSharing.totalRevenue.call()
    const thirdShareholder = addr.shareholders[2]

    await wavSharing.claimShare({from: thirdShareholder})

    const totalRevenueAfter = await wavSharing.totalRevenue.call()
    assert.bignumEqual(totalRevenueBefore, totalRevenueAfter)
  })
})
