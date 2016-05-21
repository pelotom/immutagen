import { assert } from 'chai'

import immutagen from './immutagen'

describe('immutagen', () => {
  it('works for simple yields', () => {
    const next = immutagen(function*() {
      yield 3
      yield 4
    })

    assert.typeOf(next, 'function')
    {
      const { value, next: next2 } = next()
      assert.equal(3, value)
      assert.typeOf(next2, 'function')
    }
    {
      const { value, next: next2 } = next()
      assert.equal(3, value)
      assert.typeOf(next2, 'function')

      const { value: value2, next: next3 } = next2()
      assert.equal(4, value2)
      assert.typeOf(next3, 'function')
    }
  })

  it('works when passing in values', () => {
    const next = immutagen(function*(x) {
      const foo = (yield 2) + x
      const bar = (yield foo) + 4
      return bar + foo
    })

    assert.equal(2, next(9).value)
    assert.equal(2, next(9).value)
    assert.equal(12, next(9).next(3).value)
    assert.equal(12, next(9).next(3).value)
    assert.equal(20, next(9).next(3).next(4).value)
  })

  it('gives access to a normal generator', () => {
    const next = immutagen(function*(x) {
      const foo = yield 2 * x
      yield foo + 2
      return 9
    })

    const { value, next: next2, mutable } = next(3)
    assert.equal(6, value)
    assert.isFunction(next2)
    {
      const { value: mutVal, done } = mutable.next(4)
      assert(!done)
      assert.equal(6, mutVal)
    }
    {
      const { value: mutVal, done } = mutable.next(4)
      assert(done)
      assert.equal(9, mutVal)
    }
    assert.equal(6, next2(4).value)
  })
})
