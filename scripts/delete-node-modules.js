const path = require("path");
const rimraf = require("rimraf");

const nodeModulesName = "node_modules";

const nodeModules = [
  path.resolve(nodeModulesName),
  path.resolve("packages", "mmd-persian-datepicker", nodeModulesName),
  path.resolve("packages", "react-mmd-persian-datepicker", nodeModulesName),
];

const run = () => {
  for (const nodeModule of nodeModules) {
    rimraf.sync(nodeModule, undefined, () => {
      console.log(`deleted ${nodeModule}: `);
      console.log("-".repeat(20));
    });
  }
};

run();
