# immutagen [![Build Status](https://travis-ci.org/pelotom/immutagen.svg?branch=master)](https://travis-ci.org/pelotom/immutagen)

A JavaScript microlibrary for *emulated immutable generators*.

### Installation

```
npm install --save immutagen
```

### Usage

```javascript
import immutagen from 'immutagen'

const gen = immutagen(function*() {
  yield 1
  yield 2
  return 3
})()                      // { value: 1, next: [function] }

gen.next()                // { value: 2, next: [function] }
gen.next()                // { value: 2, next: [function] }

gen.next().next()         // { value: 3, next: null }
```

`immutagen` takes a generator function and returns an immutable generator object. Instead of mutating itself upon each call to `next()`, it returns a new generation method `next` alongside the value it produces. When `next` is undefined, the generator is exhausted.

### Motivation

[Generators](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Generator) are a very cool feature of ES6+ which open up a lot of possibilities for metaprogramming. Unfortunately, as implemented they are less powerful than they could be. The problem is that the generator objects obtained by invoking a [generator function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/function*) are *mutable*. One repeatedly invokes a `next()` method on the same generator object, which moves it through its own private state machine, returning potentially different values each time:

```javascript
function* genFun() {
  const x = yield 1
  return 2 + x
}
const gen = genFun()
gen.next()  // -> { value: 1, done: false }
gen.next(3) // -> { value: 5, done: true }
```

This means that whenever we call `gen.next(...)`, the state that `gen` was in before the call is lost forever. For example once we make the `gen.next(3)` call above, we can no longer find out what would've happened if we had passed `6` instead of `3` to the generator in that particular state. One solution to this situation would be if we could clone generators in a particular state:

```javascript
gen.next()          // -> { value: 1, done: false }
gen.clone().next(3) // -> { value: 5, done: true }
gen.clone().next(6) // -> { value: 8, done: true }
```

Unfortunately no such `clone()` method exists for generators, [nor is it possible to implement one](http://stackoverflow.com/questions/26179693/how-to-clone-es6-generator) without employing essentially the same emulation technique as does this library to implement immutable generators.

Why does any of this matter? It may all seem academic, but suffice it to say that [certain libraries we might like to build are impossible](http://sitr.us/2014/08/02/javascript-generators-and-functional-reactive-programming.html) without immutable or cloneable generators. My own use case is the [burrido](https://github.com/pelotom/burrido) library.

### Emulated Immutability

Without the ability to defensively copy mutable generators, we can't implement true immutable generators. We can, however, *emulate* them, assuming a pure generator function. The strategy is to keep track of the history of values that have been fed into the generator at every `yield` expression so far, and then "replay" them from scratch whenever we want to recreate a generator in the same state.

It is however crucial that the generator function be pure; if it is impure in its input the generator's state could diverge upon replay, and if it is impure in its output, replaying will cause repetition of side-effects. Note also that there is inherent inefficiency in this technique, because every `yield` expression requires replaying the entire history up to that point. For this reason it's advisable to keep expensive computations to a minimum inside immutable generators, particularly as the number of `yield` expressions in the generator grows. Even if there isn't a lot of expensive computation, the runtime complexity will be quadratic in the number of `yield` expressions to be evaluated, so be careful.
