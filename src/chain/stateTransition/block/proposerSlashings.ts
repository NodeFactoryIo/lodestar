import assert from "assert";

import {serialize, signingRoot} from "@chainsafe/ssz";

import {
  BeaconBlock,
  BeaconState,
  ProposerSlashing,
  BeaconBlockHeader,
} from "../../../types";

import {
  Domain,
  MAX_PROPOSER_SLASHINGS,
} from "../../../constants";

import {blsVerify} from "../../../stubs/bls";

import {
  getCurrentEpoch,
  getDomain,
  isSlashableValidator,
  slotToEpoch,
  slashValidator,
} from "../util";


export function processProposerSlashing(state, proposerSlashing: ProposerSlashing): void {
  const proposer = state.validatorRegistry[proposerSlashing.proposerIndex];
  // Verify that the epoch is the same
  assert(slotToEpoch(proposerSlashing.header1.slot) === slotToEpoch(proposerSlashing.header2.slot));
  // But the headers are different
  assert(!serialize(proposerSlashing.header1, BeaconBlockHeader).equals(
    serialize(proposerSlashing.header2, BeaconBlockHeader)));
  // Check proposer is slashable
  assert(isSlashableValidator(proposer, getCurrentEpoch(state)));
  // Signatures are valid
  const proposalData1Verified = blsVerify(
    proposer.pubkey,
    signingRoot(proposerSlashing.header1, BeaconBlockHeader),
    proposerSlashing.header1.signature,
    getDomain(state.fork, Domain.BEACON_PROPOSER, slotToEpoch(proposerSlashing.header1.slot)),
  );
  assert(proposalData1Verified);
  const proposalData2Verified = blsVerify(
    proposer.pubkey,
    signingRoot(proposerSlashing.header2, BeaconBlockHeader),
    proposerSlashing.header2.signature,
    getDomain(state.fork, Domain.BEACON_PROPOSER, slotToEpoch(proposerSlashing.header2.slot)),
  );
  assert(proposalData2Verified);
  slashValidator(state, proposerSlashing.proposerIndex);
}

export default function processProposerSlashings(state: BeaconState, block: BeaconBlock): void {
  assert(block.body.proposerSlashings.length <= MAX_PROPOSER_SLASHINGS);
  for (const proposerSlashing of block.body.proposerSlashings) {
    processProposerSlashing(state, proposerSlashing);
  }
}
