import {
  BeaconBlock, BeaconState, bytes48, Epoch, Shard, Slot,
  ValidatorIndex
} from "../../types";
import {notSoRandomRandomBoolean, notSoRandomRandomSlot, notSoRandomRandomValidatorIndex} from "./helpers";
import {CommitteeAssignment, GenesisInfo} from "../types";

export default class RPCProvider {
  private readonly rpcUrl: string;
  private validatorIndex: ValidatorIndex;
  private currentSlot: Slot;

  public constructor(url: string) {
    this.rpcUrl = url;

    // Automatically attempt to make a connection
    this.connect();
  }

  private connect(): boolean {
    return true;
  }

  public isActiveValidator(index: ValidatorIndex): boolean {
    return notSoRandomRandomBoolean();
  }

  public getValidatorIndex(pubkey: bytes48[]): ValidatorIndex {
    this.validatorIndex = notSoRandomRandomValidatorIndex();
    return this.validatorIndex;
  }

  public getBeaconProposer(): ValidatorIndex {
    const rand = notSoRandomRandomValidatorIndex();
    return rand > this.validatorIndex ? rand : this.validatorIndex;
  }

  public getCurrentBlock(): BeaconBlock {
    let b: BeaconBlock;
    return  b;
  }

  public getCurrentState(): BeaconState {
    let b: BeaconState;
    return b;
  }

  public getCurrentEpoch(): Epoch {
    return notSoRandomRandomValidatorIndex() as Epoch;
  }

  public getPreviousEpoch(): Epoch {
    return notSoRandomRandomValidatorIndex() as Epoch;
  }

  public hasChainStarted(): boolean {
    return notSoRandomRandomBoolean();
  }

  public getCrosslinkCommitteesAtSlot(slot: Slot): [ValidatorIndex[], Shard][] {
    return [];
  }

  public getGenisisInfo(): GenesisInfo {
    return {
      startTime: Date.now()
    };
  }

  public getEpochStartSlot(epoch: Epoch): Slot {
    return notSoRandomRandomValidatorIndex() as Slot;
  }

  public getCommitteeAssignment(epoch: Epoch, validatorIndex: ValidatorIndex): CommitteeAssignment {
    // eslint-disable-next-line @typescript-eslint/no-object-literal-type-assertion
    return {} as CommitteeAssignment;
  }

  public isProposerAtSlot(slot: Slot, validatorIndex: ValidatorIndex): boolean {
    return notSoRandomRandomBoolean();
  }

  public getCurrentSlot(): Slot {
    if (!this.currentSlot) {
      const slot = notSoRandomRandomSlot();
      this.currentSlot = slot;
      return slot;
    } else {
      this.currentSlot = this.currentSlot + 1;
      return this.currentSlot;
    }
  }
}
