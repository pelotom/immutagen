# immutagen

Immutagen is a JavaScript microlibrary for *simulated immutable generators*.

#### Background

[Generators](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Generator) are a very cool feature of ES6+ which open up lots of metaprogramming possibilities. Unfortunately, as implemented they are less powerful than they could be. The problem is that the generator objects obtained by invoking a [generator function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/function*) are *mutable*; you repeatedly invoke a `next()` method on the same object, and it moves the generator through its state machine, potentially returning different values each time:

```javascript
function* genFun() {
  const x = yield 1
  return 2 + x
}
const gen = genFun()
gen.next()  // -> { value: 1, done: false }
gen.next(3) // -> { value: 5, done: true }
```

Whenever we call `gen.next()`, the state that `gen` was in before the call is lost forever.
