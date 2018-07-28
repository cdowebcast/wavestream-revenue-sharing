import BigNumber from 'bignumber.js'

import {
  assert,
  assertRevert,
  assertTxSucceedsGeneratingEvents,
  getRandomAddressWithZeroBalance,
  getEtherBalance,
  now,
} from './helpers'

import {getAddresses} from './helpers'

const WavSharing = artifacts.require('./WavSharing.sol')
const TestToken = artifacts.require('./TestToken.sol')

contract(`WavSharing (happy path):`, accounts => {
  const addr = getAddresses(accounts)

  let token
  let wavSharing
  const shares = [200, 450, 350]
  const revenue = ['10000', '20000']

  before(async () => {
    token = await TestToken.new('1000000e18')
  })

  it(`doesn't allow to register sharing with sum of shares less than 1`, async () => {
    const {shareholders} = addr
    const shares = [1, 1, 1]
    await assertRevert(WavSharing.new(shareholders, shares, token.address))
  })

  it(`doesn't allow to register sharing with single zero share`, async () => {
    const {shareholders} = addr
    const shares = [0, 500, 500]
    await assertRevert(WavSharing.new(shareholders, shares, token.address))
  })

  it(`doesn't allow to register sharing with single share bigger than 1000`, async () => {
    const {shareholders} = addr
    const shares = [1001]
    await assertRevert(WavSharing.new([shareholders[0]], shares, token.address))
  })

  it(`doesn't allow to register sharing with sum of shares more than 1`, async () => {
    const {shareholders} = addr
    const shares = [1000, 1000, 1000]
    await assertRevert(WavSharing.new(shareholders, shares, token.address))
  })

  it(`doesn't allow to register sharing with non-unique shareholders`, async () => {
    const shareholders = [...addr.shareholders, addr.shareholders[0]]
    const shares = [250, 250, 250, 250]
    await assertRevert(WavSharing.new(shareholders, shares, token.address))
  })

  it(`doesn't allow to register sharing without shareholders`, async () => {
    const shareholders = []
    const shares = []
    await assertRevert(WavSharing.new(shareholders, shares, token.address))
  })

  it(`doesn't allow to register sharing without shares`, async () => {
    const shareholders = [addr.shareholders[0]]
    const shares = []
    await assertRevert(WavSharing.new(shareholders, shares, token.address))
  })

  it(`allows to register proper sharing`, async () => {
    const {shareholders} = addr
    wavSharing = await WavSharing.new(shareholders, shares, token.address)
  })

  it(`initial totalDividends are zero`, async () => {
    const initialTotalDividends = await wavSharing.totalDividends()
    assert.bignumEqual(initialTotalDividends, '0')
  })

  it(`transfer tokens to revenue sharing`, async () => {
    const newDividends = revenue[0]
    await token.transfer(wavSharing.address, newDividends)
    const totalDividends = await wavSharing.totalDividends()
    assert.bignumEqual(totalDividends, newDividends)
  })

  it(`sends nothing to non-shareholder`, async () => {
    const {anonymous} = addr
    const anonymousBalanceBefore = await token.balanceOf(anonymous)
    await wavSharing.claimDividend({from: anonymous})
    const anonymousBalanceAfter = await token.balanceOf(anonymous)
    assert.bignumEqual(anonymousBalanceBefore, anonymousBalanceAfter)
  })

  it(`sends share to first shareholder`, async () => {
    const totalDividendsBefore = await wavSharing.totalDividends()
    const firstShareholder = addr.shareholders[0]
    const firstShareholderTokenBalance = await token.balanceOf(firstShareholder)

    const firstShareholderShare = '2000'

    await assertTxSucceedsGeneratingEvents(
      wavSharing.claimDividend({from: firstShareholder}),
      [
        {
          name: 'DividendsPaid',
          args: {
            shareholder: firstShareholder,
            value: new BigNumber(firstShareholderShare),
          },
        },
      ],
    )

    const firstShareholderTokenBalanceAfter = await token.balanceOf(
      firstShareholder,
    )
    const totalDividendsAfter = await wavSharing.totalDividends()
    assert.bignumEqual(
      BigNumber(firstShareholderTokenBalance).plus(firstShareholderShare),
      firstShareholderTokenBalanceAfter,
    )
    assert.bignumEqual(totalDividendsBefore, totalDividendsAfter)
  })

  it(`sends second revenue payment to sharing contract`, async () => {
    const newDividends = revenue[1]
    await token.transfer(wavSharing.address, newDividends)
    const totalDividends = await wavSharing.totalDividends()
    assert.bignumEqual(totalDividends, BigNumber(revenue[0]).plus(revenue[1]))
  })

  it(`sends share to second shareholder after second revenue`, async () => {
    const totalDividendsBefore = await wavSharing.totalDividends()
    const secondShareholder = addr.shareholders[1]
    const secondShareholderTokenBalance = await token.balanceOf(
      secondShareholder,
    )

    const secondShareholderShare = '13500'

    await assertTxSucceedsGeneratingEvents(
      wavSharing.claimDividend({from: secondShareholder}),
      [
        {
          name: 'DividendsPaid',
          args: {
            shareholder: secondShareholder,
            value: new BigNumber(secondShareholderShare),
          },
        },
      ],
    )

    const secondShareholderTokenBalanceAfter = await token.balanceOf(
      secondShareholder,
    )
    const totalDividendsAfter = await wavSharing.totalDividends()
    assert.bignumEqual(
      BigNumber(secondShareholderTokenBalance).plus(secondShareholderShare),
      secondShareholderTokenBalanceAfter,
    )
    assert.bignumEqual(totalDividendsBefore, totalDividendsAfter)
  })

  it(`sends share to first shareholder after payout to second`, async () => {
    const totalDividendsBefore = await wavSharing.totalDividends()
    const firstShareholder = addr.shareholders[0]
    const firstShareholderTokenBalance = await token.balanceOf(firstShareholder)

    const firstShareholderShare = '4000'

    await assertTxSucceedsGeneratingEvents(
      wavSharing.claimDividend({from: firstShareholder}),
      [
        {
          name: 'DividendsPaid',
          args: {
            shareholder: firstShareholder,
            value: new BigNumber(firstShareholderShare),
          },
        },
      ],
    )

    const firstShareholderTokenBalanceAfter = await token.balanceOf(
      firstShareholder,
    )
    const totalDividendsAfter = await wavSharing.totalDividends()
    assert.bignumEqual(
      BigNumber(firstShareholderTokenBalance).plus(firstShareholderShare),
      firstShareholderTokenBalanceAfter,
    )
    assert.bignumEqual(totalDividendsBefore, totalDividendsAfter)
  })

  it(`sends share to the third shareholder after payouts to first and second`, async () => {
    const totalDividendsBefore = await wavSharing.totalDividends()
    const thirdShareholder = addr.shareholders[2]
    const thirdShareholderTokenBalance = await token.balanceOf(thirdShareholder)

    const thirdShareholderShare = '10500'

    await assertTxSucceedsGeneratingEvents(
      wavSharing.claimDividend({from: thirdShareholder}),
      [
        {
          name: 'DividendsPaid',
          args: {
            shareholder: thirdShareholder,
            value: new BigNumber(thirdShareholderShare),
          },
        },
      ],
    )

    const thirdShareholderTokenBalanceAfter = await token.balanceOf(
      thirdShareholder,
    )
    const totalDividendsAfter = await wavSharing.totalDividends()
    assert.bignumEqual(
      BigNumber(thirdShareholderTokenBalance).plus(thirdShareholderShare),
      thirdShareholderTokenBalanceAfter,
    )
    assert.bignumEqual(totalDividendsBefore, totalDividendsAfter)
  })

  it(`no tokens are held by sharing contract after all payouts`, async () => {
    const contractTokenBalance = await token.balanceOf(wavSharing.address)
    assert.bignumEqual(contractTokenBalance, '0')
  })

  it(`all shareholder balances are zero after all payouts`, async () => {
    for (let shareholder of addr.shareholders) {
      const balance = await wavSharing.dividendBalanceOf(shareholder)
      assert.bignumEqual(balance, '0')
    }
  })

  it(`allows to claim dividends with zero balance`, async () => {
    const firstShareholder = addr.shareholders[0]
    const firstShareholderTokenBalance = await token.balanceOf(firstShareholder)

    await wavSharing.claimDividend({from: firstShareholder})

    const firstShareholderTokenBalanceAfter = await token.balanceOf(
      firstShareholder,
    )
    assert.bignumEqual(
      firstShareholderTokenBalance,
      firstShareholderTokenBalanceAfter,
    )
  })
})
