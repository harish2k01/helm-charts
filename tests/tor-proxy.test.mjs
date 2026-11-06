import test from 'node:test';
import assert from 'node:assert/strict';
import {render,container,serviceContract} from './helpers/render.mjs';
test('Tor proxy SOCKS Service and TCP probes resolve to port 9150',()=>{
  const docs=render('tor-proxy');serviceContract(docs,'tor-proxy',9150);
  assert.ok(container(docs,'tor-proxy').livenessProbe.tcpSocket);
});
test('Tor proxy accepts Secret-mounted configuration and explicit command arguments',()=>{
  const docs=render('tor-proxy',['extraVolumes[0].name=tor-config','extraVolumes[0].secret.secretName=runtime','extraVolumeMounts[0].name=tor-config','extraVolumeMounts[0].mountPath=/etc/tor','extraVolumeMounts[0].readOnly=true','command[0]=tor','args[0]=-f','args[1]=/etc/tor/torrc']);
  const c=container(docs,'tor-proxy');assert.deepEqual(c.command,['tor']);assert.deepEqual(c.args,['-f','/etc/tor/torrc']);
  assert.ok(c.volumeMounts.some(m=>m.mountPath==='/etc/tor'&&m.readOnly));assert.equal(docs.some(d=>d.kind==='Secret'),false);
});
