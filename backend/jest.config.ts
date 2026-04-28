import type { Config } from "jest";

const config: Config = {
  testEnvironment: "node",
  rootDir: "src",
  testMatch: ["**/__tests__/**/*.test.ts"],
  transform: {
    "^.+\\.ts$": [
      "ts-jest",
      {
        tsconfig: "<rootDir>/../tsconfig.test.json",
      },
    ],
  },
  collectCoverageFrom: ["**/*.ts", "!**/__tests__/**", "!**/__mocks__/**"],
};

export default config;
