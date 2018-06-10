const { exec, execSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const throttle = require('lodash.throttle');

// WML Setup
function getSymlinkPackages() {
  const packagePath = path.resolve(process.cwd(), 'package.json'),
    packageJSON = require(packagePath),
    depedencies = [].concat(
      Object.keys(packageJSON.dependencies || {}),
      Object.keys(packageJSON.devDependencies || {}),
      Object.keys(packageJSON.peerDependencies || {})
    ).filter(depedency => depedency !== 'wml-symlink');
  const modules = depedencies.map(depedency => `node_modules/${depedency}`);
  const isSymlink = file => fs.lstatSync(file).isSymbolicLink();
  return modules.filter(isSymlink);
}

const symlinkPackages = getSymlinkPackages();

let answer = p => {
  try {
    p.stdin.write('N\n');
  } catch (e) {}
};
answer = throttle(answer, 1000);

symlinkPackages.map(module => {
  const travelokaAppsPath = path.resolve(process.cwd(), `${module}`);
  const realPath = fs.realpathSync(module);
  try {
    console.log(`[RUN] remove symlink ${module}`);
    execSync(`rm ${module}`); //remove symlink
  } catch (e) {}
  const command = `./node_modules/.bin/wml add ${realPath} ${travelokaAppsPath}`;
  console.log(`[RUN] wml add ${realPath} ${travelokaAppsPath}`);
  const p = exec(command, (error, stdout, stderr) => {
    // console.log('stdout: ' + stdout);
    // console.log('stderr: ' + stderr);
    if (error !== null) {
      console.log('exec error: ' + error);
    }
  });
  p.stdout.on('data', data => {
    // console.log(data);
    if (data.includes('Y/n')) {
      answer(p);
      setTimeout(() => {
        p.stdin.end();
      }, 100);
    }
  });
});
