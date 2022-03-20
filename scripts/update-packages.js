const ncu = require("npm-check-updates");
const path = require("path");

const packageName = "package.json";

const packages = [
  path.resolve(packageName),
  path.resolve("packages", "mmd-persian-datepicker", packageName),
  path.resolve("packages", "react-mmd-persian-datepicker", packageName),
];

const run = async () => {
  for (const package of packages) {
    const upgraded = await ncu.run({
      packageFile: package,
      upgrade: true,
    });

    console.log(`upgraded for ${package}: `);
    console.log(upgraded);
    console.log("-".repeat(20));
  }
};

run();
