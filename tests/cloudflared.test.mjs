import test from 'node:test';
import assert from 'node:assert/strict';
import {render,container,env,serviceContract} from './helpers/render.mjs';
test('Cloudflared uses an existing tunnel credential and exposes no default Service',()=>{
  const docs=render('cloudflared'),c=container(docs,'cloudflared');
  assert.deepEqual(env(c,'TUNNEL_TOKEN').valueFrom.secretKeyRef,{name:'cloudflare-tunnel-token',key:'token'});
  assert.equal(docs.some(d=>['Secret','Service','Ingress','HTTPRoute'].includes(d.kind)),false);
  assert.ok(c.command.includes('run'));assert.ok(c.command.some(arg=>arg.includes('2000')));
});
test('Cloudflared optional metrics Service and runtime configuration stay connected',()=>{
  const docs=render('cloudflared',['service.enabled=true','token.secretName=operator-token','token.secretKey=credential','cloudflared.envFrom[0].secretRef.name=runtime']);
  serviceContract(docs,'cloudflared',2000);
  const c=container(docs,'cloudflared');
  assert.deepEqual(env(c,'TUNNEL_TOKEN').valueFrom.secretKeyRef,{name:'operator-token',key:'credential'});
  assert.deepEqual(c.envFrom,[{secretRef:{name:'runtime'}}]);
});
