import {
  bool,
  bytes8,
  bytes32,
  bytes48,
  bytes96,
} from "../types";

// TODO: unstub this, connect bls-js repo

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function blsSign(privkey: bytes48[], messageHash: bytes32, domain: bytes8): bytes48 {
  return Buffer.alloc(48);
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function blsVerify(pubkey: bytes48, messageHash: bytes32, signature: bytes96, domain: bytes8): bool {
  return true;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function blsVerifyMultiple(pubkeys: bytes48[], messageHashes: bytes32[], signature: bytes96, domain: bytes8): bool {
  return true;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function blsAggregatePubkeys(pubkeys: bytes48[]): bytes48 {
  return Buffer.alloc(48);
}
