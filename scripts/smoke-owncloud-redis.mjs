import { execFileSync, spawnSync } from 'node:child_process';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { parse } from 'yaml';

const values=parse(readFileSync('charts/owncloud/values.yaml','utf8'));
const appImage=`${values.image.repository}:${values.image.tag}`;
const target=`${values.redis.image.repository}:${values.redis.image.tag}`;
const id=`helm-redis-${Date.now()}-${process.pid}`,network=id,server=`${id}-server`;
const docker=(...args)=>execFileSync('docker',args,{encoding:'utf8',timeout:240000}).trim();
const clean=(...args)=>spawnSync('docker',args,{stdio:'ignore',timeout:30000});
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const php=code=>docker('run','--rm','--network',network,'--entrypoint','php',appImage,'-r',code);
const connect=`$r=new Redis();if(!$r->connect('redis',6379,5)||!$r->select(0)){throw new Exception('connect');}`;
const check=`
${connect}
if(json_decode($r->get('upgrade:cache'),true)!==['value'=>4242])throw new Exception('persisted JSON cache');
if($r->get('upgrade:lock')!=='1')throw new Exception('persisted lock');
if(!$r->setex('smoke:ttl',60,'value')||$r->ttl('smoke:ttl')<=0)throw new Exception('ttl');
$r->del('smoke:counter');if(!$r->setnx('smoke:counter',1)||$r->setnx('smoke:counter',2))throw new Exception('setnx');
if($r->incrBy('smoke:counter',2)!==3||$r->decrBy('smoke:counter',1)!==2)throw new Exception('counter');
$r->watch('smoke:counter');$tx=$r->multi()->set('smoke:counter',3)->exec();if($tx===false)throw new Exception('transaction');
$r->setOption(Redis::OPT_SCAN,Redis::SCAN_RETRY);$it=null;$found=[];while($keys=$r->scan($it,'smoke:*')){$found=array_merge($found,$keys);}if(count($found)<2)throw new Exception('scan');
if($r->del('smoke:ttl')!==1||$r->exists('smoke:ttl'))throw new Exception('delete');
echo 'PHPRedis '.phpversion('redis').' cache/locking operations PASS'.PHP_EOL;
`;
const volumes=[];
try{
  docker('network','create',network);
  for(const mode of ['rdb','aof']){
    const volume=`${id}-${mode}`;volumes.push(volume);docker('volume','create',volume);
    const args=['--databases','1',...(mode==='aof'?['--appendonly','yes','--appendfsync','always']:[])];
    const start=async image=>{
      docker('run','-d','--name',server,'--network',network,'--network-alias','redis','-v',`${volume}:/data`,image,...args);
      let ready=false;
      for(let i=0;i<60;i++){
        const ping=spawnSync('docker',['exec',server,'redis-cli','ping'],{encoding:'utf8',timeout:5000});
        if(ping.status===0&&ping.stdout.trim()==='PONG'){ready=true;break;}
        await wait(1000);
      }
      assert.ok(ready,`${image} must load ${mode} data and answer PING`);
    };
    await start('redis:6.2.21');
    php(`${connect}$r->set('upgrade:cache',json_encode(['value'=>4242]));$r->setnx('upgrade:lock',1);$r->save();echo 'baseline seeded';`);
    console.log(php(check));
    docker('stop',server);docker('rm',server);
    await start(target);
    console.log(php(check));
    docker('stop',server);docker('rm',server);
    // Ensure the new Redis version can also restart with the upgraded persistence.
    await start(target);console.log(php(check));
    docker('stop',server);docker('rm',server);
    console.log(`PASS: ${appImage} PHPRedis, Redis 6.2.21 -> ${target} ${mode} migration and restart.`);
  }
}catch(error){
  const logs=spawnSync('docker',['logs','--tail','80',server],{encoding:'utf8'});
  console.error(logs.stdout??'',logs.stderr??'');throw error;
}finally{
  clean('rm','-f',server);for(const volume of volumes)clean('volume','rm',volume);clean('network','rm',network);
}
