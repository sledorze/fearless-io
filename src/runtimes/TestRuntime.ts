/**
 * Created by tushar on 2019-05-24
 */

import {Either, Option} from 'standard-data-structures'
import {ITestSchedulerOptions} from 'ts-scheduler/src/main/ITestSchedulerOptions'
import {TestScheduler, testScheduler} from 'ts-scheduler/test'

import {Id} from '../internals/Id'
import {FIO, IO} from '../main/FIO'

import {BaseRuntime} from './BaseRuntime'

export class TestRuntime extends BaseRuntime {
  public readonly scheduler: TestScheduler
  public constructor(options?: Partial<ITestSchedulerOptions>) {
    super()
    this.scheduler = testScheduler(options)
  }

  public unsafeExecuteSync<E, A>(io: IO<E, A>): A | E | undefined {
    return this.unsafeExecuteSync0(io)
      .map(_ => _.reduce<A | E | undefined>(Id, Id))
      .getOrElse(undefined)
  }

  public unsafeExecuteSync0<E, A>(io: FIO<E, A>): Option<Either<E, A>> {
    let result: Option<Either<E, A>> = Option.none()
    this.unsafeExecute(io, _ => (result = _))
    this.scheduler.run()

    return result
  }
}

export const testRuntime = (O?: Partial<ITestSchedulerOptions>) =>
  new TestRuntime(O)
