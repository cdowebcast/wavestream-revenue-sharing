import BigNumber from 'bignumber.js'

import {assertTxSucceedsGeneratingEvents, getAddresses} from './helpers'

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

  it(`deploys proper revenue sharing contract`, async () => {
    const {shareholders} = addr
    wavSharing = await WavSharing.new(shareholders, shares, token.address)
  })

  it(`transfers tokens to revenue sharing`, async () => {
    await token.transfer(wavSharing.address, revenue[0])
  })

  it(`sends share to first shareholder`, async () => {
    const firstShareholder = addr.shareholders[0]

    const firstShareholderShare = BigNumber(revenue[0])
      .multipliedBy(shares[0])
      .dividedBy(1000)

    await assertTxSucceedsGeneratingEvents(
      wavSharing.claimDividend({from: firstShareholder}),
      [
        {
          name: 'DividendsPaid',
          args: {
            shareholder: firstShareholder,
            value: firstShareholderShare,
          },
        },
      ],
    )
  })

  it(`transfers tokens to revenue sharing for the second time`, async () => {
    await token.transfer(wavSharing.address, revenue[1])
  })

  it(`sends share to second shareholder after two revenue transfers`, async () => {
    const secondShareholder = addr.shareholders[1]

    const secondShareholderShare = BigNumber(revenue[0])
      .plus(revenue[1])
      .multipliedBy(shares[1])
      .dividedBy(1000)

    await assertTxSucceedsGeneratingEvents(
      wavSharing.claimDividend({from: secondShareholder}),
      [
        {
          name: 'DividendsPaid',
          args: {
            shareholder: secondShareholder,
            value: secondShareholderShare,
          },
        },
      ],
    )
  })

  it(`sends share to first shareholder after payout to second`, async () => {
    const firstShareholder = addr.shareholders[0]

    const firstShareholderShare = BigNumber(revenue[1])
      .multipliedBy(shares[0])
      .dividedBy(1000)

    await assertTxSucceedsGeneratingEvents(
      wavSharing.claimDividend({from: firstShareholder}),
      [
        {
          name: 'DividendsPaid',
          args: {
            shareholder: firstShareholder,
            value: firstShareholderShare,
          },
        },
      ],
    )
  })

  it(`sends share to the third shareholder after payouts to first and second`, async () => {
    const thirdShareholder = addr.shareholders[2]

    const thirdShareholderShare = BigNumber(revenue[0])
      .plus(revenue[1])
      .multipliedBy(shares[2])
      .dividedBy(1000)

    await assertTxSucceedsGeneratingEvents(
      wavSharing.claimDividend({from: thirdShareholder}),
      [
        {
          name: 'DividendsPaid',
          args: {
            shareholder: thirdShareholder,
            value: thirdShareholderShare,
          },
        },
      ],
    )
  })
})
