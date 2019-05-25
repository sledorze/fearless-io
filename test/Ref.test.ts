/**
 * Created by tushar on 2019-05-25
 */
import {assert} from 'chai'
import {Ref} from '../src/main/Ref'
import {testRuntime} from '../src/runtimes/TestRuntime'

describe('Ref', () => {
  it('should update the value', () => {
    const actual = testRuntime({}).executeSync(
      Ref.of(1000).chain(_ => _.update(i => i + 1))
    )
    const expected = 1001

    assert.strictEqual(actual, expected)
  })

  it('should read the latest value', () => {
    const runtime = testRuntime({})
    const count = Ref.of(1000)
    const actual = runtime.executeSync(
      count.chain(_ => _.update(i => i + 1).and(_.read()))
    )
    const expected = 1001

    assert.strictEqual(actual, expected)
  })
})
