import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,cpSync,readFileSync,writeFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {execFileSync,spawnSync} from 'node:child_process';
import {parse,parseAllDocuments,stringify} from 'yaml';

const cases=[
  ['ghost','mysql.persistence',[]],
  ['owncloud','mariadb.persistence',[],'mariadb'],
  ['owncloud','redis.persistence',[],'redis'],
  ['umami','database.postgresql.persistence',[]],
  ['uptime-kuma','database.mariadb.persistence',['database.mariadb.enabled=true','database.mariadb.auth.existingSecret=test-db']],
  ['tailscale','persistence',[]],
  ...['mariadb','mysql','postgresql'].map(db=>['speedtest-tracker',`database.${db}.persistence`,[`database.${db}.enabled=true`,`database.${db}.auth.existingSecret=test-db`]])
];
const render=(path,settings=[],file)=>parseAllDocuments(execFileSync('helm',['template','claim-check',path,'--namespace','checks',...settings.flatMap(s=>['--set',s]),...(file?['-f',file]:[])],{encoding:'utf8'})).map(d=>d.toJSON()).filter(Boolean);
const stateful=(docs,component)=>{
 const items=docs.filter(d=>d.kind==='StatefulSet'&&d.spec.volumeClaimTemplates?.length);
 const result=component?items.find(d=>d.metadata.labels['app.kubernetes.io/component']===component):items[0];
 assert.ok(result,'expected StatefulSet with a claim template');return result;
};

for(const [chart,path,settings,component] of cases){
 test(`${chart} ${path}: version upgrades leave complete claim templates unchanged`,()=>{
  const temp=mkdtempSync(join(tmpdir(),'helm-claims-'));
  try{
   const copy=join(temp,chart);cpSync(`charts/${chart}`,copy,{recursive:true});
   const before=stateful(render(copy,settings),component);
   const meta=parse(readFileSync(join(copy,'Chart.yaml'),'utf8'));meta.version='99.0.0';meta.appVersion='99.0.0';writeFileSync(join(copy,'Chart.yaml'),stringify(meta));
   const after=stateful(render(copy,settings),component);
   assert.deepEqual(after.spec.volumeClaimTemplates,before.spec.volumeClaimTemplates);
   const labels=after.spec.volumeClaimTemplates[0].metadata.labels;
   assert.equal(labels['helm.sh/chart'],undefined);assert.equal(labels['app.kubernetes.io/version'],undefined);
   assert.equal(labels['app.kubernetes.io/instance'],'claim-check');
   assert.notEqual(after.metadata.labels['helm.sh/chart'],before.metadata.labels['helm.sh/chart']);
   assert.equal(after.metadata.labels['app.kubernetes.io/version'],'99.0.0');

   // Preserve historical template labels exactly for existing installations;
   // the compatibility values must not follow future chart/app versions.
   const legacy={...labels,'helm.sh/chart':`${chart}-0.0.1`,'app.kubernetes.io/version':'legacy-app','operator.example/owner':'storage'};
   const values={};let node=values;for(const key of path.split('.'))node=node[key]={};node.claimTemplateLabels=legacy;
   const file=join(temp,'legacy.yaml');writeFileSync(file,stringify(values));
   const pinned=stateful(render(copy,settings,file),component);
   assert.deepEqual(pinned.spec.volumeClaimTemplates[0].metadata.labels,legacy);
   assert.deepEqual(pinned.spec.volumeClaimTemplates[0].spec,before.spec.volumeClaimTemplates[0].spec);
   meta.version='100.0.0';meta.appVersion='100.0.0';writeFileSync(join(copy,'Chart.yaml'),stringify(meta));
   assert.deepEqual(stateful(render(copy,settings,file),component).spec.volumeClaimTemplates,pinned.spec.volumeClaimTemplates);
  }finally{rmSync(temp,{recursive:true,force:true});}
 });
 test(`${chart} ${path}: existing PVC bypasses claim creation and invalid labels are rejected`,()=>{
  const docs=render(`charts/${chart}`,[...settings,`${path}.existingClaim=operator-data`]);
  const workload=docs.find(d=>d.kind==='StatefulSet'&&(component?d.metadata.labels['app.kubernetes.io/component']===component:true));
  assert.ok(workload);assert.equal(workload.spec.volumeClaimTemplates,undefined);
  assert.ok(workload.spec.template.spec.volumes.some(v=>v.persistentVolumeClaim?.claimName==='operator-data'));
  const invalid=spawnSync('helm',['template','claim-check',`charts/${chart}`,...[...settings,`${path}.claimTemplateLabels.invalid=123`].flatMap(s=>['--set',s])],{encoding:'utf8'});
  assert.equal(invalid.error,undefined);assert.notEqual(invalid.status,0);assert.match(invalid.stderr,/claimTemplateLabels/);assert.match(invalid.stderr,/string/i);
 });
}

test('Firefly already omits version labels from claim templates',()=>{
 const sts=stateful(render('charts/firefly-iii'));
 assert.equal(sts.spec.volumeClaimTemplates[0].metadata.labels,undefined);
});
