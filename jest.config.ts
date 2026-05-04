/** @jest-config-loader ts-node */
import type { Config } from "jest";

const config: Config = {
	moduleFileExtensions: ["js", "json", "ts"],
	rootDir: ".",
	testRegex: ".*\\.test\\.ts$",
	transform: {
		"^.+\\.(t|j)s$": ["ts-jest", { tsconfig: "tsconfig.json" }],
	},
	collectCoverageFrom: ["*.(t|j)s"],
	coverageDirectory: "coverage",
	testEnvironment: "node",
};

export default config;
