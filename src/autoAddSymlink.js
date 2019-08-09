const {
  exec,
  execSync
} = require('child_process');
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
  const modules = depedencies.map(depedency => `../../node_modules/${depedency}`);
  const isSymlink = file => fs.existsSync(file) && fs.lstatSync(file).isSymbolicLink();
  return modules.filter(isSymlink);
}

const symlinkPackages = getSymlinkPackages();

function addSymlinkPackages() {
  return symlinkPackages.reduce((promise, module) => {
    console.log(module.substr(4));
    return promise.then(() => {
      return new Promise((resolve, reject) => {
        const travelokaAppsPath = module.substr(4); // add to local node_modules folder, not to workspace node_modules
        const realPath = fs.realpathSync(module);
        // console.log('', `start ${module}`);
        try {
          console.log(`[RUN] remove symlink ${module} | rm ${module}`);
          execSync(`rm -rf ${module}`);
        } catch (e) {
          // console.error(e);
        }
        const command = `./node_modules/.bin/wml add ${realPath} ${travelokaAppsPath}`;
        console.log(`[RUN] wml add ${realPath} ${travelokaAppsPath}`);
        const p = exec(command, (error, stdout, stderr) => {
          // console.log('stdout: ' + stdout);
          // console.log('stderr: ' + stderr);
          if (error !== null) {
            console.log('exec error: ' + error);
            reject(error);
          }
        });
        p.stdout.on('data', data => {
          // console.log(data);
          if (data.includes('Y/n')) {
            const throttledAnswer = throttle(p => {
              try {
                p.stdin.write('N\n');
              } catch (e) { }
            }, 1000);
            throttledAnswer(p);
            setTimeout(() => {
              p.stdin.end();
              resolve();
            }, 100);
          }
        });
      });
    });
  }, Promise.resolve());
}
module.exports = addSymlinkPackages;
