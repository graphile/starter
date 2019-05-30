module.exports = {
  roots: ["<rootDir>/migrations", "<rootDir>/client", "<rootDir>/server"],
  transform: {
    "^.+\\.tsx?$": "ts-jest",
  },
  testMatch: ["**/__tests__/**/*.test.[jt]s?(x)"],
};
