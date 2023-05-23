const crypto = require("crypto");

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
