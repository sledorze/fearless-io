/**
 * Created by tushar on 2019-03-18
 */
import * as assert from 'assert'

import {IO} from '../'

import {IOCollector} from './internals/IOCollector'
import {
  createRejectingIOSpec,
  ResolvingIOSpec
} from './internals/IOSpecification'

describe('Try', () => {
  ResolvingIOSpec(() => IO.try(() => void 0))
  createRejectingIOSpec(() =>
    IO.try(() => {
      throw new Error('FAILURE')
    })
  )
  const tryNumberIO = () => {
    let i = 0
    const {timeline, fork, scheduler} = IOCollector(IO.try(() => (i += 1)))
    fork()
    scheduler.run()

    return {timeline}
  }

  it('should compute the computation', async () => {
    let i = 0
    await IO.try(() => (i = i + 1)).toPromise()
    assert.strictEqual(i, 1)
  })

  it('should return the final value', () => {
    const {timeline} = tryNumberIO()
    const actual = timeline.list()
    const expected = [['RESOLVE', 1, 1]]
    assert.deepStrictEqual(actual, expected)
  })
})
