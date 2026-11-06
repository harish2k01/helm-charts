import { execFileSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, readFileSync, mkdirSync, rmSync, unlinkSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import assert from 'node:assert/strict';
import { parse, parseAllDocuments } from 'yaml';

const render=chart=>parseAllDocuments(execFileSync('helm',['template','smoke',`charts/${chart}`],{encoding:'utf8'})).map(d=>d.toJSON()).filter(Boolean);
const run=args=>execFileSync('docker',['run','--rm',...args],{stdio:'inherit',timeout:60000});
const work=mkdtempSync(join(tmpdir(),'helm-busybox-'));
try {
  const scrutiny=render('scrutiny').find(d=>d.kind==='Deployment').spec.template.spec.initContainers[0];
  const cfg=join(work,'config'),out=join(work,'out');
  mkdirSync(cfg); mkdirSync(out);
  writeFileSync(join(cfg,'scrutiny.yaml'),'version: 1\n');
  const mounts=['--network','none','-v',`${resolve(cfg)}:/config-template:ro`,'-v',`${resolve(out)}:/opt/scrutiny/config`];
  run([...mounts,scrutiny.image,...scrutiny.command]);
  assert.equal(readFileSync(join(out,'scrutiny.yaml'),'utf8'),'version: 1\n');
  // The root init container created this file; recreate via our owned directory
  // to simulate an operator-provided config without writing a root-owned file.
  unlinkSync(join(out,'scrutiny.yaml'));
  writeFileSync(join(out,'scrutiny.yaml'),'preserve-existing: true\n');
  run([...mounts,scrutiny.image,...scrutiny.command]);
  assert.equal(readFileSync(join(out,'scrutiny.yaml'),'utf8'),'preserve-existing: true\n');
  const tailscale=render('tailscale').find(d=>d.kind==='StatefulSet').spec.template.spec.initContainers[0];
  // Privilege applies only to this disposable container's isolated network namespace.
  run(['--network','none','--privileged',tailscale.image,...tailscale.command]);
  for(const [chart,section] of [['scrutiny','initContainer'],['tailscale','sysctl']]){
    const values=parse(readFileSync(`charts/${chart}/values.yaml`,'utf8'));
    assert.equal(values[section].image.tag,'1.38.0');
  }
  console.log('BusyBox rendered init scripts passed: seed, preserve existing config, IPv4/IPv6 sysctl.');
} finally {
  rmSync(work,{recursive:true,force:true});
}
