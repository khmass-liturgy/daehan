const { test } = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const path = require('node:path');
const source = fs.readFileSync(path.join(__dirname, '..', 'auth.js'), 'utf8');
const owner = { email: 'trsumun@gmail.com', email_verified: true, firebase: { sign_in_provider: 'google.com' } };
const user = claims => ({ getIdTokenResult: async () => ({ claims }) });

async function setup(options = {}) {
  const elements = new Map();
  const calls = { started: 0, signedOut: 0, reloaded: 0, popup: 0, alerts: 0 };
  const getElement = id => {
    if (!elements.has(id)) elements.set(id, {
      textContent: '', disabled: id === 'google-login-btn',
      classList: { values: new Set(), add(x) { this.values.add(x); }, remove(x) { this.values.delete(x); } },
      listeners: {}, addEventListener(event, fn) { this.listeners[event] = fn; }
    });
    return elements.get(id);
  };
  let listener;
  const sdk = {
    initializeApp: () => ({}), getFirestore: () => ({}), getAuth: () => ({}),
    browserSessionPersistence: 'session',
    setPersistence: async (_, persistence) => { assert.equal(persistence, 'session'); },
    GoogleAuthProvider: class { setCustomParameters(p) { assert.equal(p.prompt, 'select_account'); } },
    onIdTokenChanged: (_, fn) => { listener = fn; },
    signInWithPopup: async () => { calls.popup++; if (options.popupError) throw { code: options.popupError }; },
    signOut: async () => { calls.signedOut++; await listener(null); }
  };
  const context = vm.createContext({
    document: { getElementById: getElement },
    window: {
      startApp: () => { calls.started++; },
      location: { reload: () => { calls.reloaded++; } },
      alert: () => { calls.alerts++; }
    }
  });
  const script = new vm.Script(source, {
    importModuleDynamically: async () => {
      if (options.sdkFailure) throw Error('offline');
      const mod = new vm.SyntheticModule(Object.keys(sdk), function() {
        for (const [key, value] of Object.entries(sdk)) this.setExport(key, value);
      }, { context });
      await mod.link(() => {});
      await mod.evaluate();
      return mod;
    }
  });
  script.runInContext(context);
  await new Promise(resolve => setImmediate(resolve));
  return {
    calls, getElement, emit: value => listener(value),
    visible: () => getElement('app').classList.values.has('show'),
    click: id => getElement(id).listeners.click()
  };
}

test('signed-out visitors never start data loading', async () => {
  const h = await setup();
  await h.emit(null);
  assert.equal(h.calls.started, 0);
  assert.equal(h.visible(), false);
});

test('verified Google owner can enter, token refresh does not reload data', async () => {
  const h = await setup();
  await h.emit(user(owner));
  await h.emit(user(owner));
  assert.equal(h.calls.started, 1);
  assert.equal(h.visible(), true);
});

test('approved Google employee can enter', async () => {
  const h = await setup();
  await h.emit(user({ ...owner, email: 'jinhee4ys@gmail.com' }));
  assert.equal(h.calls.started, 1);
  assert.equal(h.visible(), true);
  assert.equal(h.calls.signedOut, 0);
});

for (const [name, claims] of [
  ['unverified employee', { ...owner, email: 'jinhee4ys@gmail.com', email_verified: false }],
  ['employee using password provider', { ...owner, email: 'jinhee4ys@gmail.com', firebase: { sign_in_provider: 'password' } }],
  ['different email', { ...owner, email: 'someone@example.com' }],
  ['unverified email', { ...owner, email_verified: false }],
  ['password provider', { ...owner, firebase: { sign_in_provider: 'password' } }],
  ['missing token claims', {}]
]) test(`rejects ${name} before loading data`, async () => {
  const h = await setup();
  await h.emit(user(claims));
  assert.equal(h.calls.started, 0);
  assert.equal(h.calls.signedOut, 1);
  assert.equal(h.visible(), false);
  assert.match(h.getElement('login-err').textContent, /허용되지/);
});

test('an old token result cannot reopen the app after sign-out', async () => {
  const h = await setup();
  let resolve;
  const pending = h.emit({ getIdTokenResult: () => new Promise(r => { resolve = r; }) });
  await h.emit(null);
  resolve({ claims: owner });
  await pending;
  assert.equal(h.visible(), false);
  assert.equal(h.calls.started, 0);
});

test('logout hides the app and reloads to discard sensitive caches', async () => {
  const h = await setup();
  await h.emit(user(owner));
  await h.click('logout-btn');
  assert.equal(h.calls.signedOut, 1);
  assert.equal(h.visible(), false);
  assert.ok(h.calls.reloaded > 0);
});

test('popup errors explain the issue and allow retry', async () => {
  const h = await setup({ popupError: 'auth/popup-blocked' });
  await h.click('google-login-btn');
  assert.match(h.getElement('login-err').textContent, /팝업이 차단/);
  assert.equal(h.getElement('google-login-btn').disabled, false);
  assert.equal(h.calls.started, 0);
});

test('SDK load failure stays locked and displays a recovery message', async () => {
  const h = await setup({ sdkFailure: true });
  assert.equal(h.visible(), false);
  assert.equal(h.getElement('google-login-btn').disabled, true);
  assert.match(h.getElement('login-err').textContent, /새로고침/);
});
