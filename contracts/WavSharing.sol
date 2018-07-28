pragma solidity ^0.4.24;

import "./SafeMath.sol";
import "./ERC20.sol";


contract WavSharing {
  using SafeMath for uint256;

  struct Shareholder {
    uint256 share;
    uint256 lastDividends;
  }

  mapping (address => Shareholder) shareholders;
  uint256 public dividendsPaid;
  ERC20 public token;

  event DividendsPaid(
    address indexed shareholder,
    uint256 value
  );

  /*
  * _shares array of shares w/ precision 0.001 e.g. 25 means 0.025
  */
  constructor(address[] _shareholders, uint[] _shares, ERC20 _token) public {
    require(_token != address(0));
    require(_shareholders.length > 0 && _shareholders.length == _shares.length);

    token = _token;

    uint256 totalShare = 0;
    for (uint256 i = 0; i < _shareholders.length; i++) {
      //checks that share is between 0% and 100%
      require(_shares[i] > 0);
      require(_shares[i] <= 1000);
      //checks that we hadn't added this shareholder yet
      require(shareholders[_shareholders[i]].share == 0);
      totalShare = totalShare.add(_shares[i]);
      shareholders[_shareholders[i]] = Shareholder({
        share: _shares[i],
        lastDividends: 0
      });
    }
    require(totalShare == 1000);
  }

  function totalDividends() public view returns (uint256) {
    uint256 currentBalanceOnContract = token.balanceOf(address(this));
    return currentBalanceOnContract.add(dividendsPaid);
  }

  function dividendBalanceOf(address account) public view returns (uint256) {
    uint256 newDividends = totalDividends().sub(shareholders[account].lastDividends);
    return shareholders[account].share.mul(newDividends).div(1000);
  }

  function claimDividend() public {
    uint256 owing = dividendBalanceOf(msg.sender);
    if (owing > 0) {
      token.transfer(msg.sender, owing);
      dividendsPaid = dividendsPaid.add(owing);

      shareholders[msg.sender].lastDividends = totalDividends();

      emit DividendsPaid(msg.sender, owing);
    }
  }
}