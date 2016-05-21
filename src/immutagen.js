// A simple immutable generator simulator that replays history in order to
// "clone" JavaScript's mutable generators

export default genFactory => {
  const nextFor = history => input => {
    const
      newHist = history.concat([input]),
      gen = genFactory(newHist[0]),
      { value, done } = newHist.map(x => gen.next(x))[history.length]

    return {
      value,
      next: done ? undefined : nextFor(newHist),
      mutable: gen
    }
  }
  return nextFor([])
}
