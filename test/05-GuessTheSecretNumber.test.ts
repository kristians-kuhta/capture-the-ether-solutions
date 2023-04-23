import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { expect } from 'chai';
import { Contract } from 'ethers';
import { ethers } from 'hardhat';
const { utils } = ethers;

describe('GuessTheSecretNumberChallenge', () => {
  let target: Contract;
  let deployer: SignerWithAddress;
  let attacker: SignerWithAddress;

  before(async () => {
    [attacker, deployer] = await ethers.getSigners();

    target = await (
      await ethers.getContractFactory('GuessTheSecretNumberChallenge', deployer)
    ).deploy({
      value: utils.parseEther('1'),
    });

    await target.deployed();

    target = target.connect(attacker);
  });

  it('exploit', async () => {
    let n = null

    for(let i=0; i < 2**8 - 1; i++) {
      const hashed = utils.keccak256(`0x${i.toString(16).padStart(2, '0')}`);

      if(hashed === "0xdb81b4d58595fbbbb592d3661a34cdca14d7ab379441400cbfa1b78bc447c365") {
        n = i;
        break;
      }
    }

    expect(n).not.to.equal(null);

    const tx = await target.guess(n, { value: utils.parseUnits('1', 'ether') });
    await tx.wait();

    expect(await target.isComplete()).to.equal(true);
  });
});
