import {getAddresses, assertRevert} from './helpers'

const WavSharing = artifacts.require('./WavSharing.sol')
const TestToken = artifacts.require('./TestToken.sol')

contract(`WavSharing (contract deployment):`, accounts => {
  const addr = getAddresses(accounts)

  let token

  before(async () => {
    token = await TestToken.new('1000000e18')
  })

  it(`doesn't allow to deploy revenue sharing contract with 0x token`, async () => {
    const {shareholders} = addr
    const shares = [1, 1, 1]
    await assertRevert(WavSharing.new(shareholders, shares, '0x0'))
  })

  it(`doesn't allow to deploy revenue sharing contract without shareholders`, async () => {
    await assertRevert(WavSharing.new([], [], token.address))
  })

  it(`doesn't allow to deploy revenue sharing contract with sum of shares less than 1000`, async () => {
    const {shareholders} = addr
    const shares = [333, 333, 333]
    await assertRevert(WavSharing.new(shareholders, shares, token.address))
  })

  it(`doesn't allow to deploy revenue sharing contract with zero share`, async () => {
    const {shareholders} = addr
    const shares = [0, 500, 500]
    await assertRevert(WavSharing.new(shareholders, shares, token.address))
  })

  it(`doesn't allow to deploy revenue sharing contract with single share bigger than 1000`, async () => {
    const {shareholders} = addr
    const shares = [1001]
    await assertRevert(WavSharing.new([shareholders[0]], shares, token.address))
  })

  it(`doesn't allow to deploy revenue sharing contract with sum of shares more than 1000`, async () => {
    const {shareholders} = addr
    const shares = [500, 500, 1]
    await assertRevert(WavSharing.new(shareholders, shares, token.address))
  })

  it(`doesn't allow to deploy revenue sharing contract with non-unique shareholders`, async () => {
    const shareholders = [...addr.shareholders, addr.shareholders[0]]
    const shares = [250, 250, 250, 250]
    await assertRevert(WavSharing.new(shareholders, shares, token.address))
  })

  it(`doesn't allow to deploy revenue sharing contract without shareholders`, async () => {
    const shareholders = []
    const shares = []
    await assertRevert(WavSharing.new(shareholders, shares, token.address))
  })

  it(`doesn't allow to deploy revenue sharing contract without shares`, async () => {
    const shareholders = [addr.shareholders[0]]
    const shares = []
    await assertRevert(WavSharing.new(shareholders, shares, token.address))
  })
})
