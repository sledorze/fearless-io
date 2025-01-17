import {DoublyLinkedList, Either, Option} from 'standard-data-structures'

import {CB} from '../internals/CB'

import {FIO, IO, UIO} from './FIO'

/**
 * A special data structure that can be set only once.
 * Any get operation on Await will "wait" for a set to happen first.
 * Its kind of like a Promise, because it can be set only once.
 * @typeparam E Errors thrown
 * @typeparam A Success value
 */
export class Await<E, A> {
  public static of<E = never, A = never>(): UIO<Await<E, A>> {
    return UIO(() => new Await())
  }
  private flag = false
  private readonly Q = DoublyLinkedList.of<[CB<E>, CB<A>]>()
  private result: Option<Either<E, A>> = Option.none()

  public get get(): IO<E, A> {
    return FIO.flattenM(() =>
      this.result
        .map(S => S.reduce<IO<E, A>>(FIO.reject, XX => FIO.of(XX)))
        .getOrElse(this.wait)
    )
  }

  public get isSet(): UIO<boolean> {
    return UIO(() => this.flag)
  }

  public set(io: IO<E, A>): UIO<boolean> {
    return FIO.flattenM(() => {
      if (this.flag) {
        return FIO.of(false)
      }
      this.flag = true

      return io.asEither.encase(either => {
        this.result = Option.some(either)
        while (this.Q.length > 0) {
          const node = this.Q.shift()

          if (Option.isSome(node)) {
            either.reduce(...node.value)
          }
        }

        return true
      })
    })
  }

  private get wait(): IO<E, A> {
    return FIO.asyncIO((rej, res) => {
      const id = this.Q.add([rej, res])

      return {
        cancel: () => this.Q.remove(id)
      }
    })
  }
}
