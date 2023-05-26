const crypto = require("crypto");

/**
 * Calculates the SHA256 hash of the given inputs.
 * @param {...any} inputs - The inputs to be hashed.
 * @returns {string} The hexadecimal representation of the hash.
 */
const cryptoHash = (...inputs) => {
  const hash = crypto.createHash("sha256");

  const sortedInputs = inputs
    .map((input) => JSON.stringify(input))
    .sort()
    .join(" ");

  hash.update(sortedInputs);
  return hash.digest("hex");
};

module.exports = cryptoHash;
