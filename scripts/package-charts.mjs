import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { stringify } from 'yaml';
import { digest } from './release-plan.mjs';

export function packageCharts(plan, site = '_site', run = execFileSync, env = process.env) {
  for (const chart of plan.charts) {
    const archive = join(site, chart.archive);
    if (chart.package) {
      if (chart.metadata.dependencies?.length) {
        run('helm', ['dependency', 'build', chart.directory], { stdio: 'inherit' });
      }
      run('helm', ['package', chart.directory, '--destination', site, '--sign',
        '--key', env.HELM_SIGNING_KEY_NAME, '--keyring', env.HELM_SIGNING_KEYRING,
        '--passphrase-file', env.HELM_SIGNING_PASSPHRASE_FILE], { stdio: 'inherit' });
    } else if (!existsSync(`${archive}.prov`)) {
      // Repair a missing signature over the original bytes, never repackage a published version.
      const metadata = run('helm', ['show', 'chart', archive], { encoding: 'utf8' });
      const payload = `${metadata.trimEnd()}\n...\n${stringify({ files: { [chart.archive]: `sha256:${digest(archive)}` } })}`;
      const signature = run('gpg', ['--batch', '--yes', '--pinentry-mode', 'loopback',
        '--passphrase-file', env.HELM_SIGNING_PASSPHRASE_FILE, '--local-user', env.HELM_SIGNING_KEY_NAME,
        '--digest-algo', 'SHA256', '--armor', '--clearsign'], { input: payload });
      writeFileSync(`${archive}.prov`, signature);
    }
    run('helm', ['verify', archive, '--keyring', env.HELM_SIGNING_PUBLIC_KEYRING], { stdio: 'inherit' });
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  packageCharts(JSON.parse(readFileSync('.release-plan.json', 'utf8')));
}
