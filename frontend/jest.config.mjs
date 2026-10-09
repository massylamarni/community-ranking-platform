import nextJest from "next/jest.js";

const createJestConfig = nextJest({
  dir: "./",
});

const config = {
  clearMocks: true,
  moduleNameMapper: {
    "^@/components/ui/card$": "<rootDir>/components/overwrites/card.tsx",
    "^@/(.*)$": "<rootDir>/$1",
  },
  testEnvironment: "node",
  testMatch: [
    "<rootDir>/tests/unit/**/*.test.ts",
    "<rootDir>/tests/unit/**/*.test.tsx",
  ],
};

const esmPackages = ["@tanstack/react-table", "@tanstack/table-core"];

const jestConfig = async () => {
  const resolved = await createJestConfig(config)();
  return {
    ...resolved,
    transformIgnorePatterns: [
      `/node_modules/(?!(${esmPackages.join("|")})/)`,
      "^.+\\.module\\.(css|sass|scss)$",
    ],
  };
};

export default jestConfig;
