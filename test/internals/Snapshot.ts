/**
 * Created by tushar on 07/09/19
 */
import {FIO, UIO} from '../../src/main/FIO'
import {IRuntimeEnv} from '../../src/runtimes/IRuntime'

export class Snapshot {
  public readonly timeline = new Array<string>()
  public mark(value: string): FIO<never, string, IRuntimeEnv> {
    return FIO.runtime().chain(RTM =>
      UIO(
        () => void this.timeline.push(value + '@' + RTM.scheduler.now())
      ).const(value)
    )
  }
}
