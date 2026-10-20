import { execFileSync, spawnSync } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { parse } from 'yaml';

const id=`helm-influx-${Date.now()}-${process.pid}`;
const network=id, db=`${id}-db`, app=`${id}-app`, config=`${id}-config`, data=`${id}-data`;
const token=randomBytes(32).toString('hex'); // Disposable test credential, never a production secret.
const docker=(...args)=>execFileSync('docker',args,{encoding:'utf8',timeout:180000}).trim();
const clean=(...args)=>spawnSync('docker',args,{stdio:'ignore',timeout:30000});
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const values=parse(readFileSync('charts/scrutiny/values.yaml','utf8'));
const appImage=`${values.image.repository}:${values.image.tag}`;
const target=`${values.influxdb.image.repository}:${values.influxdb.image.tag}`;
async function awaitHealth() {
  const port=docker('port',app,'8080/tcp').match(/:(\d+)$/)?.[1];
  assert.ok(port,'app HTTP port published on loopback');
  const url=`http://127.0.0.1:${port}`;
  let last='not started';
  for(let attempt=0;attempt<120;attempt++){
    try{
      const response=await fetch(`${url}/api/health`,{signal:AbortSignal.timeout(3000)});
      const body=await response.json();
      if(response.ok&&body.success===true){
        const summary=await fetch(`${url}/api/summary`,{signal:AbortSignal.timeout(5000)});
        assert.equal(summary.status,200);
        assert.equal((await summary.json()).success,true);
        return;
      }
      last=JSON.stringify(body);
    }catch(error){ last=error.message; }
    await wait(1000);
  }
  throw new Error(`Scrutiny database health did not become ready: ${last}`);
}
async function start(image){
  docker('run','-d','--name',db,'--network',network,'--network-alias','influx','-v',`${data}:/var/lib/influxdb2`,image);
  // The actual app image onboards a new database and tests its authenticated v2 APIs.
  docker('run','-d','--name',app,'--network',network,'-p','127.0.0.1::8080','-v',`${config}:/opt/scrutiny/config`,
    '-e','SCRUTINY_WEB_INFLUXDB_HOST=influx','-e',`SCRUTINY_WEB_INFLUXDB_TOKEN=${token}`,
    '-e','SCRUTINY_WEB_INFLUXDB_INIT_PASSWORD=disposable-smoke-password',appImage);
  await awaitHealth();
}
try{
  docker('network','create',network);
  docker('volume','create',config); docker('volume','create',data);
  await start('influxdb:2.8.0');
  docker('exec',db,'influx','write','--host','http://127.0.0.1:8086','--org','scrutiny','--bucket','metrics','--token',token,'upgrade_smoke,source=chart value=4242');
  docker('stop',app,db); docker('rm',app,db);
  await start(target);
  const result=docker('exec',db,'influx','query','--host','http://127.0.0.1:8086','--org','scrutiny','--token',token,'--raw','from(bucket: "metrics") |> range(start: -1h) |> filter(fn: (r) => r._measurement == "upgrade_smoke")');
  assert.match(result,/4242/,'pre-upgrade metric remains queryable with the original token');
  console.log(`PASS: ${appImage} onboards 2.8.0, survives upgrade to ${target}, authenticates with original token, reads persisted metrics and serves health/summary.`);
}catch(error){
  for(const name of [app,db]){
    const logs=spawnSync('docker',['logs','--tail','100',name],{encoding:'utf8'});
    console.error(`${name}:\n${logs.stdout??''}\n${logs.stderr??''}`);
  }
  throw error;
}finally{
  clean('rm','-f',app,db); clean('volume','rm',config,data); clean('network','rm',network);
}
