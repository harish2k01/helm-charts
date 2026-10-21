import test from 'node:test';
import assert from 'node:assert/strict';
import {render,container,env,serviceContract,rejects} from './helpers/render.mjs';
test('qBittorrent exporter metrics listener and probe ports resolve',()=>serviceContract(render('qbittorrent-exporter'),'qbittorrent-exporter',8090));
test('qBittorrent exporter API key mode references an existing Secret without legacy credentials',()=>{
  const docs=render('qbittorrent-exporter',['qbittorrent.auth.method=apiKey','qbittorrent.auth.existingSecret=runtime']),c=container(docs,'qbittorrent-exporter');
  assert.equal(env(c,'QBITTORRENT_API_KEY').valueFrom.secretKeyRef.name,'runtime');
  assert.equal(env(c,'QBITTORRENT_PASSWORD'),undefined);assert.equal(env(c,'QBITTORRENT_USERNAME'),undefined);
  assert.equal(docs.some(d=>d.kind==='Secret'),false);
});
test('qBittorrent exporter rejects cookie mode without its required cookie name',()=>rejects('qbittorrent-exporter',['qbittorrent.auth.method=cookieName'],/cookieName is required/));
