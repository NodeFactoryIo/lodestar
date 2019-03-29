import assert from "assert";

import {serialize, treeHash} from "@chainsafesystems/ssz";

import {
  AttestationDataAndCustodyBit,
  BeaconBlock,
  BeaconState,
  Crosslink,
  PendingAttestation,
} from "../../../types";

import {
  Domain,
  MAX_ATTESTATIONS,
  MIN_ATTESTATION_INCLUSION_DELAY,
  SLOTS_PER_EPOCH,
  ZERO_HASH,
} from "../../../constants";

import {
  getAttestationParticipants,
  getBitfieldBit,
  getBlockRoot,
  getCrosslinkCommitteesAtSlot,
  getCurrentEpoch,
  getDomain,
  getEpochStartSlot,
  slotToEpoch,
} from "../../helpers/stateTransitionHelpers";

import {blsAggregatePubkeys, blsVerifyMultiple} from "../../../stubs/bls";

export default function processAttestations(state: BeaconState, block: BeaconBlock): void {
  assert(block.body.attestations.length <= MAX_ATTESTATIONS);
  for (const attestation of block.body.attestations) {
    assert(attestation.data.slot <= state.slot - MIN_ATTESTATION_INCLUSION_DELAY &&
      state.slot - MIN_ATTESTATION_INCLUSION_DELAY < attestation.data.slot + SLOTS_PER_EPOCH);
    const justifiedEpoch = slotToEpoch(attestation.data.slot + 1) >= getCurrentEpoch(state) ?
      state.justifiedEpoch : state.previousJustifiedEpoch;
    assert(attestation.data.justifiedEpoch === justifiedEpoch);
    assert(attestation.data.justifiedBlockRoot.equals(getBlockRoot(state, getEpochStartSlot(attestation.data.justifiedEpoch))));
    const c: Crosslink = {
      epoch: slotToEpoch(attestation.data.slot),
      shardBlockRoot: attestation.data.shardBlockRoot,
    };
    assert(serialize(state.latestCrosslinks[attestation.data.shard], Crosslink).eq(serialize(attestation.data.latestCrosslink), Crosslink) ||
      serialize(state.latestCrosslinks[attestation.data.shard], Crosslink).eq(
        serialize(c, Crosslink)));

    // Remove this condition in Phase 1
    assert((attestation.custodyBitfield.equals(Buffer.alloc(attestation.custodyBitfield.length))));
    assert(attestation.aggregationBitfield.equals(Buffer.alloc(attestation.aggregationBitfield.length)));

    const crosslinkCommittee = getCrosslinkCommitteesAtSlot(state, attestation.data.slot)
      .filter(({shard}) => shard === attestation.data.shard)
      .map(({validatorIndices}) => validatorIndices)[0];
    for (let i = 0; i < crosslinkCommittee.length; i++) {
      if (getBitfieldBit(attestation.aggregationBitfield, i) === 0b0) {
        assert(getBitfieldBit(attestation.custodyBitfield, i) === 0b0);
      }
    }
    const participants = getAttestationParticipants(state, attestation.data, attestation.aggregationBitfield);
    const custodyBit1Participants = getAttestationParticipants(state, attestation.data, attestation.custodyBitfield);
    const custodyBit0Participants = participants.filter((i) => custodyBit1Participants.find((i2) => i === i2));

    const dataAndCustodyBit0: AttestationDataAndCustodyBit = {
      data: attestation.data,
      custodyBit: false,
    };
    const dataAndCustodyBit1: AttestationDataAndCustodyBit = {
      data: attestation.data,
      custodyBit: true,
    };
    const custodyBitsVerified = blsVerifyMultiple(
      [
        blsAggregatePubkeys(custodyBit0Participants.map((i) => state.validatorRegistry[i].pubkey)),
        blsAggregatePubkeys(custodyBit1Participants.map((i) => state.validatorRegistry[i].pubkey)),
      ],
      [
        treeHash(dataAndCustodyBit0, AttestationDataAndCustodyBit),
        treeHash(dataAndCustodyBit1, AttestationDataAndCustodyBit),
      ],
      attestation.aggregateSignature,
      getDomain(state.fork, slotToEpoch(attestation.data.slot), Domain.ATTESTATION),
    );
    assert(custodyBitsVerified);
    // Remove the following conditional in Phase 1
    assert(attestation.data.shardBlockRoot.equals(ZERO_HASH));
    const p: PendingAttestation = {
      data: attestation.data,
      aggregationBitfield: attestation.aggregationBitfield,
      custodyBitfield: attestation.custodyBitfield,
      inclusionSlot: state.slot,
    };
    state.latestAttestations.push(p);
  }
}
