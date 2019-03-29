import BN from "bn.js";
import deepmerge from "deepmerge";

import {BeaconChain} from "../chain";
import {DB} from "../db";
import {Eth1Notifier} from "../eth1";
import {P2PNetwork} from "../p2p";
import {BeaconRPC} from "../rpc";
import {Sync} from "../sync";

import defaultConf from "./defaults";

interface Service {
  start(): Promise<void>;
  stop(): Promise<void>;
}

interface BeaconNodeCtx {
  chain: object;
  db: object;
  eth1: object;
  network: object;
  rpc: object;
  sync: object;
}

class BeaconNode {
  public conf: BeaconNodeCtx;
  public db: Service;
  public eth1: Service;
  public network: Service;
  public chain: Service;
  public rpc: Service;
  public sync: Service;

  public constructor(opts: BeaconNodeCtx) {
    this.conf = deepmerge(defaultConf, opts);

    // this.logger ?
    this.db = new DB(this.conf.db);
    this.network = new P2PNetwork(this.conf.network);
    this.eth1 = new Eth1Notifier(this.conf.eth1);
    this.sync = new Sync(this.conf.sync, {
      network: this.network,
    });
    this.chain = new BeaconChain(this.conf.chain, {
      db: this.db,
      eth1: this.eth1,
    });
    this.rpc = new BeaconRPC(this.conf.rpc, {
      chain: this.chain,
      db: this.db,
    });
  }

  public async start() {
    await this.db.start();
    await this.network.start();
    await this.eth1.start();
    await this.sync.start();
    await this.chain.start();
    await this.rpc.start();
  }

  public async stop() {
    await this.rpc.start();
    await this.chain.stop();
    await this.sync.start();
    await this.eth1.stop();
    await this.network.stop();
    await this.db.stop();
  }
}

export default BeaconNode;
