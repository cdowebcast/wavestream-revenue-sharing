import BigNumber from 'bignumber.js'
import {assert, getAddresses} from './helpers'

const WavSharing = artifacts.require('./WavSharing.sol')
const TestToken = artifacts.require('./TestToken.sol')

contract(`WavSharing (shareholder payouts):`, accounts => {
  const addr = getAddresses(accounts)

  let token
  let wavSharing
  const shares = [200, 450, 350]
  const revenue = ['10000', '20000']

  before(async () => {
    token = await TestToken.new('1000000e18')
    const {shareholders} = addr
    wavSharing = await WavSharing.new(shareholders, shares, token.address)
    await token.transfer(wavSharing.address, revenue[0])
  })

  it(`sends nothing to non-shareholder`, async () => {
    const {anonymous} = addr
    const anonymousBalanceBefore = await token.balanceOf(anonymous)
    await wavSharing.claimDividend({from: anonymous})
    const anonymousBalanceAfter = await token.balanceOf(anonymous)
    assert.bignumEqual(anonymousBalanceBefore, anonymousBalanceAfter)
  })

  it(`sends share to first shareholder`, async () => {
    const firstShareholder = addr.shareholders[0]
    const firstShareholderTokenBalance = await token.balanceOf(firstShareholder)

    const firstShareholderShare = BigNumber(revenue[0])
      .multipliedBy(shares[0])
      .dividedBy(1000)

    await wavSharing.claimDividend({from: firstShareholder})

    const firstShareholderTokenBalanceAfter = await token.balanceOf(
      firstShareholder,
    )
    assert.bignumEqual(
      BigNumber(firstShareholderTokenBalance).plus(firstShareholderShare),
      firstShareholderTokenBalanceAfter,
    )
  })

  it(`sends second revenue payment to sharing contract`, async () => {
    await token.transfer(wavSharing.address, revenue[1])
  })

  it(`sends share to second shareholder after second revenue`, async () => {
    const secondShareholder = addr.shareholders[1]
    const secondShareholderTokenBalance = await token.balanceOf(
      secondShareholder,
    )

    const secondShareholderShare = BigNumber(revenue[0])
      .plus(revenue[1])
      .multipliedBy(shares[1])
      .dividedBy(1000)

    await wavSharing.claimDividend({from: secondShareholder})

    const secondShareholderTokenBalanceAfter = await token.balanceOf(
      secondShareholder,
    )
    assert.bignumEqual(
      BigNumber(secondShareholderTokenBalance).plus(secondShareholderShare),
      secondShareholderTokenBalanceAfter,
    )
  })

  it(`sends share to first shareholder after payout to second`, async () => {
    const firstShareholder = addr.shareholders[0]
    const firstShareholderTokenBalance = await token.balanceOf(firstShareholder)

    const firstShareholderShare = BigNumber(revenue[1])
      .multipliedBy(shares[0])
      .dividedBy(1000)

    await wavSharing.claimDividend({from: firstShareholder})

    const firstShareholderTokenBalanceAfter = await token.balanceOf(
      firstShareholder,
    )
    assert.bignumEqual(
      BigNumber(firstShareholderTokenBalance).plus(firstShareholderShare),
      firstShareholderTokenBalanceAfter,
    )
  })

  it(`sends share to the third shareholder after payouts to first and second`, async () => {
    const thirdShareholder = addr.shareholders[2]
    const thirdShareholderTokenBalance = await token.balanceOf(thirdShareholder)

    const thirdShareholderShare = BigNumber(revenue[0])
      .plus(revenue[1])
      .multipliedBy(shares[2])
      .dividedBy(1000)

    await wavSharing.claimDividend({from: thirdShareholder})

    const thirdShareholderTokenBalanceAfter = await token.balanceOf(
      thirdShareholder,
    )
    assert.bignumEqual(
      BigNumber(thirdShareholderTokenBalance).plus(thirdShareholderShare),
      thirdShareholderTokenBalanceAfter,
    )
  })

  it(`doesn't own tokens after all payouts`, async () => {
    const contractTokenBalance = await token.balanceOf(wavSharing.address)
    assert.bignumEqual(contractTokenBalance, '0')
  })

  it(`zeroes out shareholder balances after all payouts`, async () => {
    for (let shareholder of addr.shareholders) {
      const balance = await wavSharing.dividendBalanceOf.call(shareholder)
      assert.bignumEqual(balance, 0)
    }
  })
})
