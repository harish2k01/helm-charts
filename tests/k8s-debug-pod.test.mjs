import test from 'node:test';
import assert from 'node:assert/strict';
import {render,container,workload} from './helpers/render.mjs';
test('Debug pod is interactive without opening a service or public route',()=>{
  const docs=render('k8s-debug-pod'),c=container(docs,'k8s-debug-pod');
  assert.equal(c.stdin,true);assert.equal(c.tty,true);
  assert.equal(docs.some(d=>['Service','Ingress','HTTPRoute'].includes(d.kind)),false);
});
test('Debug pod supports operator RBAC identity, command and Secret references',()=>{
  const docs=render('k8s-debug-pod',['rbac.create=false','serviceAccount.create=false','serviceAccount.name=operator','command[0]=sleep','args[0]=infinity','envFrom[0].secretRef.name=runtime']);
  assert.equal(docs.some(d=>['ClusterRoleBinding','RoleBinding','ServiceAccount','Secret'].includes(d.kind)),false);
  assert.equal(workload(docs,'k8s-debug-pod').spec.template.spec.serviceAccountName,'operator');
  const c=container(docs,'k8s-debug-pod');assert.deepEqual(c.command,['sleep']);assert.deepEqual(c.args,['infinity']);assert.deepEqual(c.envFrom,[{secretRef:{name:'runtime'}}]);
});
