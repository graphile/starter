module.exports = (dir) => {
  const package = require(`${dir}/package.json`);

  return {
    testEnvironment: "node",
    transform: {
      "^.+\\.tsx?$": "babel-jest",
    },
    testMatch: ["<rootDir>/**/__tests__/**/*.test.[jt]s?(x)"],
    moduleFileExtensions: ["js", "json", "jsx", "ts", "tsx", "node"],
    roots: [`<rootDir>`],

    rootDir: dir,
    name: package.name,
    displayName: package.name,
  };
};
