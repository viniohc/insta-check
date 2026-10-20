import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import fflate from '../vendor/fflate.js';
import worker from '../import-worker.js';

const app = fs.readFileSync(new URL('../app.js', import.meta.url), 'utf8');
class El {
  constructor() {
    this.hidden = false; this.disabled = false; this.value = ''; this.dataset = {}; this.style = {}; this.children = [];
    const set = new Set();
    this.classList = { add: (x) => set.add(x), remove: (x) => set.delete(x), toggle: (x, v) => {
      const yes = v === undefined ? !set.has(x) : Boolean(v); yes ? set.add(x) : set.delete(x); return yes;
    }};
  }
  addEventListener() {} setAttribute() {} removeAttribute() {} querySelector() { return new El(); }
  querySelectorAll() { return []; } replaceChildren(...x) { this.children = x; } append(...x) { this.children.push(...x); }
  appendChild(x) { this.children.push(x); return x; } click() {} remove() {} focus() {} scrollIntoView() {} closest() { return null; }
}
function harness() {
  const els = new Map(), dbStorage = new Map(), downloads = [];
  const document = { body: new El(), querySelector(s) { if (!els.has(s)) els.set(s,new El()); return els.get(s); },
    querySelectorAll() { return []; }, createElement() { return new El(); }, createDocumentFragment() { return new El(); },
    addEventListener() {} };
  const window = { InstaCheckI18n: { t: (x) => x, getLocale: () => 'en' }, indexedDB: null,
    location: {hash:'#/'}, history: {replaceState(){}}, addEventListener(){}, setTimeout(){return 1;},
    requestAnimationFrame(){}, scrollTo(){} };
  const localStorage = { getItem(k){return dbStorage.get(k) ?? null;}, setItem(k,v){dbStorage.set(k,String(v));}, removeItem(k){dbStorage.delete(k);} };
  const ctx = vm.createContext({window,document,localStorage,console,queueMicrotask,Event:class{},setTimeout(){},clearTimeout(){},Blob:class{constructor(parts){this.content=parts.join('');}},URL:{createObjectURL(blob){downloads.push(blob.content);return 'blob:test';},revokeObjectURL(){}},
    Worker: class { static instances=[]; constructor(){this.constructor.instances.push(this);} postMessage(){} terminate(){} }});
  const names = ['state','storageReady','normalizeProfile','getProgressSet','mergeAccountProgress','exportVisibleProfiles','serializeProgress','mergeRestoredProgress','loadProgress',
    'claimLegacyProgress','normalizeTimestamp','validateSnapshot','formatHistoryDate','formatHistoryDateTime',
    'formatIsoTimestamp','formatFileDate','updateHistoryForCurrentAnalysis','prepareImport','processFiles',
    'launchDemo','restoreHistoryBackupData','openSnapshotResults','renderDashboard','isInstaCheckBackupData'];
  vm.runInContext(app+'\nglobalThis.api={'+names.join(',')+
    ',setGets:f=>{getSnapshots=f},setSave:f=>{saveSnapshotAndAccount=f},proto:()=>Object.prototype,demoKey:()=>DEMO_ACCOUNT_KEY,downloads:()=>downloads};',ctx);
  return {api:ctx.api,ctx,els,dbStorage,downloads};
}
function memdb(fail=false) {
  const snapshots=new Map(),accounts=new Map();
  return {snapshots,accounts,transaction(_names,mode) {
    const tx={objectStore(name) {
      const map=name==='snapshots'?snapshots:accounts;
      return {put(x){if(fail)throw Error('QuotaExceededError');map.set(name==='snapshots'?x.id:x.accountKey,structuredClone(x));},
        getAll(){const r={};queueMicrotask(()=>{r.result=[...map.values()];r.onsuccess?.()});return r;},
        index(){return {getAll(key){const r={};queueMicrotask(()=>{r.result=[...snapshots.values()].filter(x=>x.accountKey===key);r.onsuccess?.()});return r;}}}};
    }};
    if(mode==='readwrite')queueMicrotask(()=>tx.oncomplete?.()); return tx;
  }};
}
function snap(x={}) { return {accountUsername:'alice',createdAt:1700000000000,followers:['keep.me'],following:['other.user'],...x}; }
function ab(x){return x.buffer.slice(x.byteOffset,x.byteOffset+x.byteLength)}
function fakeZipEntries(entries) {
  const first=Buffer.from(entries[0].name), centralOffset=31+first.length;
  const centralSize=entries.reduce((sum,item)=>sum+46+Buffer.byteLength(item.name),0);
  const eocd=centralOffset+centralSize, bytes=Buffer.alloc(eocd+22);
  bytes.writeUInt32LE(0x04034b50,0); bytes.writeUInt16LE(20,4);
  bytes.writeUInt32LE(entries[0].compressed||1,18); bytes.writeUInt32LE(entries[0].expanded||0,22);
  bytes.writeUInt16LE(first.length,26); first.copy(bytes,30);
  let cursor=centralOffset;
  for(const item of entries) {
    const name=Buffer.from(item.name);
    bytes.writeUInt32LE(0x02014b50,cursor); bytes.writeUInt16LE(20,cursor+4); bytes.writeUInt16LE(20,cursor+6);
    bytes.writeUInt32LE(item.compressed||1,cursor+20); bytes.writeUInt32LE(item.expanded||0,cursor+24);
    bytes.writeUInt16LE(name.length,cursor+28); bytes.writeUInt32LE(0,cursor+42); name.copy(bytes,cursor+46);
    cursor+=46+name.length;
  }
  bytes.writeUInt32LE(0x06054b50,eocd); bytes.writeUInt16LE(entries.length,eocd+8);
  bytes.writeUInt16LE(entries.length,eocd+10); bytes.writeUInt32LE(centralSize,eocd+12);
  bytes.writeUInt32LE(centralOffset,eocd+16); return ab(bytes);
}
function fakeZip(name,expanded) { return fakeZipEntries([{name,compressed:1,expanded}]); }
function zipWithDeclaredEntryCount(count) {
  const bytes=Buffer.alloc(22); bytes.writeUInt32LE(0x06054b50,0);
  bytes.writeUInt16LE(count,8); bytes.writeUInt16LE(count,10); return ab(bytes);
}

test('prototype keys are rejected and restored progress stays isolated by username', () => {
  const {api}=harness();
  for(const n of ['__proto__','constructor','toString']) assert.equal(api.normalizeProfile(n),null);
  assert.ok(api.normalizeProfile('__demo__'));
  api.mergeRestoredProgress(JSON.parse('{"__proto__":{"nonFollowers":["bad"]},"constructor":{"nonFollowers":["bad"]},"toString":{"nonFollowers":["bad"]},"alice":{"nonFollowers":["ok","__proto__","constructor","toString"],"__proto__":["bad"]}}'));
  assert.equal(api.proto().polluted,undefined);
  assert.deepEqual([...api.state.progress.get('alice').get('nonFollowers')],['ok']);
  api.state.accountKey='alice';api.getProgressSet('nonFollowers').add('a');
  api.state.accountKey='bob';api.getProgressSet('nonFollowers').add('b');
  assert.deepEqual([...api.state.progress.get('alice').get('nonFollowers')].sort(),['a','ok']);
  assert.deepEqual([...api.state.progress.get('bob').get('nonFollowers')],['b']);
  api.mergeAccountProgress('alice','bob');
  assert.equal(api.state.progress.has('alice'),false);
  assert.deepEqual([...api.state.progress.get('bob').get('nonFollowers')].sort(),['a','b','ok']);
  api.mergeAccountProgress('__proto__','bob');
  assert.equal(api.proto().polluted,undefined);
  assert.equal(Object.getPrototypeOf(api.serializeProgress()),null);
});

test('demo identity cannot collide with a real __demo__ username', () => {
  const {api}=harness();api.launchDemo();
  assert.equal(api.state.isDemo,true);
  assert.equal(api.state.accountKey,api.demoKey());
  assert.ok(api.state.currentSnapshot.id.startsWith(api.demoKey()+':'));
  assert.equal(api.state.progress.has(api.demoKey()),false);
  const real=api.validateSnapshot(snap({accountUsername:'__demo__'}));
  assert.equal(real.accountKey,'__demo__');
  assert.notEqual(real.accountKey,api.demoKey());
});

test('legacy progress migrates without an internal username key', () => {
  const {api,dbStorage}=harness();
  dbStorage.set('instacheck.progress.v2',JSON.stringify({nonFollowers:['old.user','__proto__']}));
  api.state.progress=api.loadProgress();api.claimLegacyProgress('alice');
  assert.deepEqual([...api.state.progress.get('alice').get('nonFollowers')],['old.user']);
  assert.equal(api.state.progress.has('__legacy__'),false);
});

test('ZIP worker accepts valid ZIPs and rejects corrupt or expanded-size violations', () => {
  const before=global.self;global.self={fflate};
  try {
    const zip=fflate.zipSync({'followers_1.json':fflate.strToU8('[]'),'following.json':fflate.strToU8('[]')});
    assert.deepEqual(worker.handleMessage({type:'zip',buffer:ab(zip)}).files.map(x=>x.name).sort(),['followers_1.json','following.json']);
    assert.throws(()=>worker.handleMessage({type:'zip',buffer:new Uint8Array([1,2]).buffer}),e=>e.code==='zipInvalid');
    assert.throws(()=>worker.handleMessage({type:'zip',buffer:fakeZip('followers_1.json',worker.LIMITS.totalExpandedBytes+1)}),e=>e.code==='zipExpandedTooLarge');
    assert.throws(()=>worker.handleMessage({type:'zip',buffer:fakeZip('followers_1.json',worker.LIMITS.jsonFileBytes+1)}),e=>e.code==='jsonTooLarge');
    assert.throws(()=>worker.handleMessage({type:'zip',buffer:fakeZipEntries([
      {name:'followers_1.json',expanded:25*1024*1024},{name:'followers_2.json',expanded:25*1024*1024},
      {name:'following.json',expanded:25*1024*1024},{name:'pending_follow_requests.json',expanded:25*1024*1024}
    ])}),e=>e.code==='totalJsonTooLarge');
    assert.throws(()=>worker.handleMessage({type:'zip',buffer:zipWithDeclaredEntryCount(worker.LIMITS.archiveEntries+1)}),e=>e.code==='tooManyEntries');
    assert.throws(()=>worker.handleMessage({type:'zip',buffer:fakeZipEntries(Array.from({length:worker.LIMITS.archiveFiles+1},(_,i)=>({name:i===0?'followers_1.json':'file'+i+'.txt'})))}),e=>e.code==='tooManyArchiveFiles');
  } finally { if(before===undefined)delete global.self;else global.self=before; }
});

test('manual JSON size and syntax errors are rejected clearly', async () => {
  const {api}=harness(), f={name:'followers_1.json',size:25*1024*1024+1,arrayBuffer(){throw Error('read too soon')}};
  await assert.rejects(api.prepareImport([f]),/messages\.jsonTooLarge/);
  await assert.rejects(api.prepareImport([{name:'large.zip',size:100*1024*1024+1,arrayBuffer(){throw Error('read too soon')}}]),/messages\.zipTooLarge/);
  await assert.rejects(api.prepareImport(Array.from({length:51},(_,i)=>({name:'x'+i+'.json',size:2,arrayBuffer(){throw Error('too many')}}))),/messages\.tooManyFiles/);
  await assert.rejects(api.prepareImport(Array.from({length:5},(_,i)=>({name:'x'+i+'.json',size:20*1024*1024,arrayBuffer(){throw Error('too large total')}}))),/messages\.totalJsonTooLarge/);
  assert.throws(()=>worker.handleMessage({type:'json',files:[{name:'bad.json',buffer:new TextEncoder().encode('{bad').buffer}]}),e=>e.code==='invalidJson');
});

test('parallel imports are ignored and import lock clears on worker error', async () => {
  const {api,ctx}=harness(),file={name:'followers_1.json',size:2,arrayBuffer:async()=>new TextEncoder().encode('[]').buffer};
  const first=api.processFiles([file]);
  for(let i=0;i<20&&ctx.Worker.instances.length===0;i++)await new Promise(r=>setTimeout(r,0));
  assert.equal(api.state.importInProgress,true);assert.equal(ctx.Worker.instances.length,1);
  await api.processFiles([file]);assert.equal(ctx.Worker.instances.length,1);
  ctx.Worker.instances[0].onerror();await first;assert.equal(api.state.importInProgress,false);
});

test('valid malicious backup restores safely and a real __demo__ account remains editable', async () => {
  const {api,ctx}=harness();await api.storageReady;api.state.database=memdb();
  const backup={app:'InstaCheck',version:1,snapshots:[snap({accountUsername:'__demo__'}),snap({accountUsername:'bad.date',createdAt:Number.MAX_VALUE})],
    progress:JSON.parse('{"__proto__":{"nonFollowers":["bad"]},"alice":{"nonFollowers":["good","constructor","toString"]}}')};
  assert.equal(api.isInstaCheckBackupData(backup),true);const restored=await api.restoreHistoryBackupData(backup);assert.equal(restored,true,'restore failed: '+ctx.document.querySelector('#historyMessage').textContent);
  assert.equal(api.proto().polluted,undefined);assert.equal(api.state.database.accounts.has('__demo__'),true);
  assert.deepEqual([...api.state.progress.get('alice').get('nonFollowers')],['good']);
  const stored=[...api.state.database.snapshots.values()][0];api.state.snapshots=[];
  await api.openSnapshotResults(stored.id);
  assert.equal(api.state.accountUsername,'__demo__');assert.equal(api.state.isDemo,false);
  assert.equal(ctx.document.querySelector('#editAccountButton').hidden,false);
});

test('comparison uses the prior snapshot of the same account', async () => {
  const {api}=harness();await api.storageReady;api.state.accountKey='alice';api.state.accountUsername='alice';api.state.database={};api.state.storageAvailable=true;
  api.state.followers=new Map([['keep',{key:'keep',username:'keep'}],['new',{key:'new',username:'new'}]]);
  api.state.following=new Map([['target',{key:'target',username:'target'}]]);
  api.state.datasets={nonFollowers:[],followersOnly:[],mutuals:[],lostFollowers:[],newFollowers:[],pendingRequests:[],recentRequests:[],recentlyUnfollowed:[]};
  api.setGets(async k=>k==='alice'?[{accountKey:'alice',id:'old',accountUsername:'alice',createdAt:1690000000000,fingerprint:'old',followers:['keep','lost'],following:['target'],followerDates:{},followingDates:{}}]:[]);
  api.setSave(async()=>{});await api.updateHistoryForCurrentAnalysis('new.json');
  assert.deepEqual(Array.from(api.state.datasets.lostFollowers,x=>x.username),['lost']);
  assert.deepEqual(Array.from(api.state.datasets.newFollowers,x=>x.username),['new']);
});

test('quota failure leaves current analysis visible with an unsaved warning', async () => {
  const {api,els}=harness();await api.storageReady;api.state.accountKey='alice';api.state.accountUsername='alice';api.state.database=memdb(true);api.state.storageAvailable=true;
  api.state.followers=new Map([['friend',{key:'friend',username:'friend'}]]);api.state.following=new Map([['target',{key:'target',username:'target'}]]);
  api.state.datasets={nonFollowers:[],followersOnly:[],mutuals:[],lostFollowers:[],newFollowers:[],pendingRequests:[],recentRequests:[],recentlyUnfollowed:[]};
  api.setGets(async()=>[]);await api.updateHistoryForCurrentAnalysis('quota.json');api.renderDashboard();
  assert.ok(api.state.currentSnapshot);assert.equal(api.state.historyPersisted,false);
  assert.equal(els.get('#storageWarning').hidden,false);assert.equal(els.get('#storageWarning').textContent,'results.noStorage');
});

test('invalid dates are discarded before formatting or ISO export', () => {
  const {api}=harness();
  assert.equal(api.normalizeTimestamp(Number.MAX_VALUE),null);assert.equal(api.normalizeTimestamp(8640000000000001),null);
  assert.equal(api.formatIsoTimestamp(Number.MAX_VALUE),'');assert.equal(api.formatFileDate(Number.MAX_VALUE),'invalid-date');
  assert.equal(api.formatHistoryDate(Number.MAX_VALUE),'');assert.equal(api.formatHistoryDateTime(Number.MAX_VALUE),'');
  assert.equal(api.validateSnapshot(snap({createdAt:Number.MAX_VALUE})),null);
});

test('new import errors are translated in Portuguese, Spanish, and English', () => {
  const source = fs.readFileSync(new URL('../i18n.js', import.meta.url), 'utf8');
  const document = { documentElement: {}, title: '', querySelector() { return null; }, querySelectorAll() { return []; }, addEventListener() {} };
  const context = vm.createContext({ window: { dispatchEvent() {} }, navigator: { language: 'en-US', languages: ['en-US'] }, document, localStorage: { getItem() { return null; }, setItem() {} }, CustomEvent: class {} });
  vm.runInContext(source, context, { filename: 'i18n.js' });
  const i18n = context.window.InstaCheckI18n;
  for (const language of ['pt-BR', 'es', 'en']) {
    i18n.setLanguage(language, false);
    for (const key of ['tooManyFiles','jsonTooLarge','totalJsonTooLarge','zipExpandedTooLarge','tooManyEntries','tooManyArchiveFiles','zipInvalid','workerUnavailable']) {
      const message = i18n.t('messages.' + key);
      assert.ok(message && !message.startsWith('messages.'), language + ':' + key);
    }
  }
});


test('CSV export drops invalid timestamps instead of throwing', () => {
  const {api,downloads}=harness();
  api.state.visibleProfiles=[{username:'valid_user',key:'valid_user',followedAt:Number.MAX_VALUE,followedYouAt:8640000000000001,timestamp:Number.MAX_VALUE}];
  api.exportVisibleProfiles();
  assert.equal(downloads.length,1);
  assert.ok(downloads[0].includes('"valid_user","https://www.instagram.com/valid_user/","","",""'));
});
