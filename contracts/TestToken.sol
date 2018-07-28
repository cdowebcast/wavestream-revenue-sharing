pragma solidity ^0.4.18;

import "openzeppelin-solidity/contracts/token/ERC20/StandardToken.sol";
import "openzeppelin-solidity/contracts/token/ERC20/DetailedERC20.sol";


/**
 * @title Test Presale Token (TPT).
 *
 * @dev ERC20 token used in presale.
 */
contract TestToken is StandardToken, DetailedERC20 {

  /**
   * @param _initialSupply Number of token units that will be allocated to the
   * token contract owner. This will be the total supply, no subsequent minting
   * is allowed.
   */
  function TestToken(uint256 _initialSupply)
    DetailedERC20("Test Presale Token", "TPT", 18)
    public
  {
    balances[msg.sender] = _initialSupply;
    totalSupply_ = _initialSupply;
    Transfer(0x0, msg.sender, _initialSupply);
  }

}
