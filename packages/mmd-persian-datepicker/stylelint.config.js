module.exports = {
  extends: "stylelint-config-recommended-scss",
  rules: {
    "rule-empty-line-before": [
      "always",
      {
        ignore: "first-nested",
      },
    ],
    indentation: 2,
    "font-family-no-missing-generic-family-keyword": null,
    "no-empty-source": null,
  },
  ignoreFiles: ["**/*.ts", "**/*.tsx"],
};
