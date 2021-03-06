import BN from "bn.js";
import { assert } from "chai";

import {
  getAttestingIndices,
  getBitfieldBit,
  verifyBitfield,
  convertToIndexed,
  verifyIndexedAttestation,
} from "../../../../../src/chain/stateTransition/util/attestation";


describe("getBitfieldBit", () => {
  it("should return 1 for the 4th (index 3) bit of [0x8]", () => {
    const result = getBitfieldBit(Buffer.from([0x8]), 3);
    assert.equal(result, 1, `returned ${result} not 1`);
  });
  it("should return 0 for the 3rd (index 2) bit of [0x8]", () => {
    const result = getBitfieldBit(Buffer.from([0x8]), 2);
    assert.equal(result, 0, `returned ${result} not 0`);
  });
  it("should return 1 for the 18th (index 17) bit of [0x8, 0x4, 0x2, 0x1]", () => {
    const result = getBitfieldBit(Buffer.from([0x8, 0x4, 0x2, 0x1]), 17);
    assert.equal(result, 1, `returned ${result} not 1`);
  });
  it("should return 1 for the 19th (index 18) bit of [0x8, 0x4, 0x2, 0x1]", () => {
    const result = getBitfieldBit(Buffer.from([0x8, 0x4, 0x2, 0x1]), 18);
    assert.equal(result, 0, `returned ${result} not 0`);
  });
});
