import assert from "assert";

import {serialize} from "@chainsafesystems/ssz";

import {
  BeaconBlock,
  BeaconState,
  DepositData,
} from "../../../types";

import {
  DEPOSIT_CONTRACT_TREE_DEPTH,
  MAX_DEPOSITS,
} from "../../../constants";

import {
  hash,
  processDeposit,
  verifyMerkleBranch,
} from "../../helpers/stateTransitionHelpers";

export default function processDeposits(state: BeaconState, block: BeaconBlock): void {
  assert(block.body.deposits.length <= MAX_DEPOSITS);
  // TODO: add logic to ensure that deposits from 1.0 chain are processed in order
  for (const deposit of block.body.deposits) {
    const serializedDepositData = serialize(deposit.depositData, DepositData);
    assert(deposit.index === state.depositIndex);
    assert(verifyMerkleBranch(hash(serializedDepositData), deposit.branch, DEPOSIT_CONTRACT_TREE_DEPTH, deposit.index, state.latestEth1Data.depositRoot));
    processDeposit(
      state,
      deposit.depositData.depositInput.pubkey,
      deposit.depositData.amount,
      deposit.depositData.depositInput.proofOfPossession,
      deposit.depositData.depositInput.withdrawalCredentials,
    );
    state.depositIndex++;
  }
}
