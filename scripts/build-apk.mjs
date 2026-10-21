import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const sdk = process.env.ANDROID_SDK_ROOT || process.env.ANDROID_HOME;
const tools = process.env.ANDROID_BUILD_TOOLS || (sdk && path.join(sdk, 'build-tools', '35.0.0'));
const platform = process.env.ANDROID_JAR || (sdk && path.join(sdk, 'platforms', 'android-35', 'android.jar'));
const jdk = process.env.JAVA_HOME;
if (!tools || !platform || !jdk || !fs.existsSync(path.join(jdk, 'bin', 'javac'))) {
  throw new Error('Install JDK 17+ and Android SDK Platform 35 / Build Tools 35.0.0. Set JAVA_HOME and ANDROID_SDK_ROOT (or ANDROID_BUILD_TOOLS and ANDROID_JAR). See android/README.md.');
}
const output = path.join(root, 'android', 'build');
fs.rmSync(output, { recursive: true, force: true });
for (const dir of ['classes', 'dex', 'assets/game', 'generated']) fs.mkdirSync(path.join(output, dir), { recursive: true });
const run = (cmd, args, extra = {}) => execFileSync(cmd, args, { cwd: root, stdio: 'inherit', ...extra });
const env = { ...process.env, JAVA_HOME: jdk, PATH: path.join(jdk, 'bin') + path.delimiter + process.env.PATH };
run(process.execPath, ['scripts/build.mjs']);
fs.cpSync(path.join(root, 'public'), path.join(output, 'assets/game'), { recursive: true });
for (const file of ['index.html', 'styles.css', 'bundle.js']) {
  fs.copyFileSync(path.join(root, 'dist', file), path.join(output, 'assets/game', file));
}
run(path.join(tools, 'aapt2'), ['compile', '--dir', 'android/res', '-o', path.join(output, 'resources.zip')]);
run(path.join(tools, 'aapt2'), ['link', '-o', path.join(output, 'unsigned.apk'), '-I', platform,
  '--manifest', 'android/AndroidManifest.xml', path.join(output, 'resources.zip'),
  '-A', path.join(output, 'assets'), '--java', path.join(output, 'generated')]);
run(path.join(jdk, 'bin', 'javac'), ['--release', '8', '-classpath', platform,
  '-d', path.join(output, 'classes'), 'android/src/com/kayakcrasher/gnometask/MainActivity.java']);
function files(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(f => f.isDirectory() ? files(path.join(dir, f.name)) : [path.join(dir, f.name)]);
}
run(path.join(tools, 'd8'), ['--lib', platform, '--min-api', '26', '--output', path.join(output, 'dex'), ...files(path.join(output, 'classes'))], { env });
run(path.join(jdk, 'bin', 'jar'), ['uf', path.join(output, 'unsigned.apk'), '-C', path.join(output, 'dex'), 'classes.dex']);
run(path.join(tools, 'zipalign'), ['-f', '-p', '4', path.join(output, 'unsigned.apk'), path.join(output, 'aligned.apk')]);
// Keep this local key for install-over updates. It is an internal test key, not a store release key.
const signing = path.join(root, '.android-signing');
fs.mkdirSync(signing, { recursive: true, mode: 0o700 });
const key = path.join(signing, 'gnometask-test.keystore');
if (!fs.existsSync(key)) {
  run(path.join(jdk, 'bin', 'keytool'), ['-genkeypair', '-keystore', key, '-storepass', 'android',
    '-alias', 'gnometask-test', '-keypass', 'android', '-keyalg', 'RSA', '-keysize', '2048',
    '-validity', '10000', '-dname', 'CN=Gnometask Internal Test, O=Gnometask, C=US']);
  fs.chmodSync(key, 0o600);
}
const apk = path.join(output, 'Gnometask-test.apk');
run(path.join(tools, 'apksigner'), ['sign', '--ks', key, '--ks-key-alias', 'gnometask-test',
  '--ks-pass', 'pass:android', '--key-pass', 'pass:android', '--out', apk, path.join(output, 'aligned.apk')], { env });
run(path.join(tools, 'apksigner'), ['verify', '--verbose', apk], { env });
run(path.join(tools, 'zipalign'), ['-c', '-p', '4', apk]);
console.log(`\nInstallable test APK: ${apk}`);
