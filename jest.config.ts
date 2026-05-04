/** @jest-config-loader ts-node */
import type { Config } from "jest";

const config: Config = {
	moduleFileExtensions: ["js", "json", "ts"],
	rootDir: ".",
	testRegex: ".*\\.test\\.ts$",
	transform: {
		"^.+\\.(t|j)s$": ["ts-jest", { tsconfig: "tsconfig.test.json" }],
	},
	moduleNameMapper: {
		"^(\\.{1,2}/.*)\\.js$": "$1",
	},
	collectCoverageFrom: [
		"src/**/*.(t|j)s",
		"!src/**/*.d.ts",
		"!src/**/*.test.ts",
	],
	coverageDirectory: "coverage",
	testEnvironment: "node",
};

export default config;
