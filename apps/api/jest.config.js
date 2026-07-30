const { createDefaultPreset } = require("ts-jest");

const tsJestTransformCfg = createDefaultPreset().transform;

/** @type {import("jest").Config} **/
module.exports = {
  testEnvironment: "node",
  testMatch: ["**/*.test.ts"],
  transform: {
    ...tsJestTransformCfg,
  },
 
 // globalSetup: "./jest.globalSetup.ts", 
  globalTeardown: "./jest.teardown.ts",
  clearMocks: true,
   moduleNameMapper: {
    "^src/(.*)$": "<rootDir>/src/$1",
    "^@shared/(.*)$": "<rootDir>/../shared/src/$1",
  },
 
};