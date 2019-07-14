// A simple immutable generator emulator that replays history in order to
// "clone" JavaScript's mutable generators

// Read the following article to understand how this code works:
// https://stackoverflow.com/a/56815335/783743

const next = (regen, ...args) => data => {
    const gen = regen(...args);
    return gen.next(data), gen;
};

const immutagen = regen => (...args) => function loop(regen) {
    return (gen, data) => {
        const {value, done} = gen.next(data);
        if (done) return {value, next: null, mutable: gen};

        let replay = false;
        const recur = loop(next(regen, data));
        const mutable = () => replay ? regen(data) : replay = gen;
        const result = {value, next: value => recur(mutable(), value)};
        return Object.defineProperty(result, "mutable", {get: mutable});
    };
}(next(regen, ...args))(regen(...args));

export { immutagen as default, immutagen };
