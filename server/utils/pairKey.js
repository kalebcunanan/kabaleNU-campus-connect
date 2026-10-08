// Builds the same key for two users no matter which order the ids are given in.
const pairKeyOf = (userA, userB) => [String(userA), String(userB)].sort().join('_');

module.exports = { pairKeyOf };
