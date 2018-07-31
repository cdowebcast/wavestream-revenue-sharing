pragma solidity ^0.4.24;

import "./SafeMath.sol";
import "./ERC20.sol";


contract WavSharing {
  using SafeMath for uint256;

  struct Shareholder {
    uint256 share;
    uint256 lastRevenue;
  }

  mapping (address => Shareholder) shareholders;
  uint256 public sharesPaid;
  ERC20 public token;

  event SharesPaid(
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
        lastRevenue: 0
      });
    }
    require(totalShare == 1000);
  }

  function totalRevenue() public view returns (uint256) {
    uint256 currentBalanceOnContract = token.balanceOf(address(this));
    return currentBalanceOnContract.add(sharesPaid);
  }

  function ownedShareOf(address account) public view returns (uint256) {
    uint256 newDividends = totalRevenue().sub(shareholders[account].lastRevenue);
    return shareholders[account].share.mul(newDividends).div(1000);
  }

  function claimShare() public {
    uint256 owing = ownedShareOf(msg.sender);
    if (owing > 0) {
      token.transfer(msg.sender, owing);
      sharesPaid = sharesPaid.add(owing);

      shareholders[msg.sender].lastRevenue = totalRevenue();

      emit SharesPaid(msg.sender, owing);
    }
  }
}