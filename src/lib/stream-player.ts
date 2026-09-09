/** One HTML5 deck for licensed remote mixes / radio. */

import { StreamManager, type StreamStartOpts } from "./stream-manager";

class RemoteDeck {
  private mgr = new StreamManager();

  start(opts: StreamStartOpts) {
    this.mgr.start(opts);
  }

  pause() {
    this.mgr.pause();
  }

  resume() {
    this.mgr.resume();
  }

  stop() {
    this.mgr.stop();
  }

  seek(t: number) {
    this.mgr.seek(t);
  }

  setVolume(v: number) {
    this.mgr.setVolume(v);
  }

  currentTime() {
    return this.mgr.currentTime();
  }

  duration() {
    return this.mgr.duration();
  }
}

let deck: RemoteDeck | null = null;

export function getRemoteDeck() {
  deck ??= new RemoteDeck();
  return deck;
}
