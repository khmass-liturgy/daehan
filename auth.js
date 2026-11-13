// UI checks are for usability. firestore.rules enforces access on the server.
const ALLOWED_EMAILS = ['trsumun@gmail.com', 'jinhee4ys@gmail.com', 'daehan2372@gmail.com', 'hyb0215@naver.com'];
// 아이디(이메일)+비밀번호로 로그인할 수 있는 계정 — firestore.rules 의 목록과 같아야 한다.
// Firebase 콘솔에서 만든 계정은 이메일 인증이 안 된 상태라 Google 계정과 조건이 다르다.
const PASSWORD_EMAILS = ['hyb0215@naver.com'];
// 계정별로 숨길 메뉴 (화면 표시용 — 데이터 접근 권한은 firestore.rules가 정한다)
const HIDDEN_TABS = { 'hyb0215@naver.com': ['inactive'] };

function applyMenuRestrictions(email) {
  const hidden = HIDDEN_TABS[email] || [];
  window.hiddenTabs = new Set(hidden);
  document.querySelectorAll('nav .nav-tab').forEach(el => {
    const m = /showTab\('([^']+)'\)/.exec(el.getAttribute('onclick') || '');
    el.style.display = m && window.hiddenTabs.has(m[1]) ? 'none' : '';
  });
}
const loginButton = document.getElementById('google-login-btn');
const pwForm = document.getElementById('pw-login-form');
const pwEmail = document.getElementById('pw-email');
const pwPassword = document.getElementById('pw-password');
const pwButton = document.getElementById('pw-login-btn');
const logoutButton = document.getElementById('logout-btn');
const message = document.getElementById('login-err');

function lockScreen() {
  document.getElementById('app').classList.remove('show');
  document.getElementById('login-screen').classList.remove('hide');
}

function authError(error) {
  const messages = {
    'auth/invalid-credential': '아이디 또는 비밀번호가 올바르지 않습니다.',
    'auth/wrong-password': '아이디 또는 비밀번호가 올바르지 않습니다.',
    'auth/user-not-found': '아이디 또는 비밀번호가 올바르지 않습니다.',
    'auth/invalid-email': '아이디는 이메일 형식으로 입력해 주세요.',
    'auth/user-disabled': '사용이 중지된 계정입니다. 관리자에게 문의해 주세요.',
    'auth/too-many-requests': '시도가 너무 많습니다. 잠시 후 다시 시도해 주세요.',
    'auth/operation-not-allowed': '이 로그인 방식이 아직 활성화되지 않았습니다.',
    'auth/popup-blocked': '팝업이 차단되었습니다. 이 사이트의 팝업을 허용한 뒤 다시 눌러 주세요.',
    'auth/popup-closed-by-user': '로그인 창을 닫았습니다. 다시 로그인해 주세요.',
    'auth/cancelled-popup-request': '로그인이 취소되었습니다. 다시 눌러 주세요.',
    'auth/unauthorized-domain': '사이트 주소 등록이 필요합니다. 관리자에게 알려 주세요.',
    'auth/network-request-failed': '연결이 끊겼습니다. 인터넷 연결을 확인한 뒤 다시 시도해 주세요.',
    'auth/web-storage-unsupported': '로그인에 필요한 브라우저 저장소를 사용할 수 없습니다. 일반 브라우저 창에서 열어 주세요.'
  };
  return messages[error?.code] || '로그인 확인에 실패했습니다. 새로고침한 뒤 다시 시도해 주세요.';
}

async function initializeLogin() {
  // Dynamic imports let us show a useful error if the SDK cannot be loaded.
  const [appSdk, dbSdk, authSdk] = await Promise.all([
    import('https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js'),
    import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js'),
    import('https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js')
  ]);
  const app = appSdk.initializeApp({
    apiKey: 'AIzaSyANMiNELXSJJubUxS3xzUw9EwdBgUZ7jgU',
    authDomain: 'daehan-adb1d.firebaseapp.com',
    projectId: 'daehan-adb1d',
    storageBucket: 'daehan-adb1d.firebasestorage.app',
    messagingSenderId: '21923430813',
    appId: '1:21923430813:web:baf8aa751c1f68458bef74'
  });
  const auth = authSdk.getAuth(app);
  auth.languageCode = 'ko';
  await authSdk.setPersistence(auth, authSdk.browserSessionPersistence);

  window.fbdb = dbSdk.getFirestore(app);
  const { collection, query, where, getDocs, orderBy, limit, doc, getDoc, setDoc, deleteDoc } = dbSdk;
  window.fbFuncs = { collection, query, where, getDocs, orderBy, limit, doc, getDoc, setDoc, deleteDoc };

  const provider = new authSdk.GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  let opened = false;
  let generation = 0;

  authSdk.onIdTokenChanged(auth, async user => {
    const current = ++generation;
    lockScreen();
    if (!user) {
      // Discard all displayed records, pending requests and in-memory caches.
      if (opened) window.location.reload();
      return;
    }
    try {
      const { claims } = await user.getIdTokenResult();
      if (current !== generation) return;
      const provider = claims.firebase?.sign_in_provider;
      const allowed = (ALLOWED_EMAILS.includes(claims.email)
          && claims.email_verified === true
          && provider === 'google.com')
        || (PASSWORD_EMAILS.includes(claims.email) && provider === 'password');
      if (!allowed) {
        message.textContent = '접근이 허용되지 않은 계정입니다. 승인된 Google 계정을 선택해 주세요.';
        await authSdk.signOut(auth);
        return;
      }
      message.textContent = '';
      applyMenuRestrictions(claims.email);
      window.loginEmail = claims.email;   // Gmail 보내기가 같은 계정으로 열리도록 index.html에서 사용
      document.getElementById('login-screen').classList.add('hide');
      document.getElementById('app').classList.add('show');
      if (!opened) {
        opened = true;
        window.startApp();
      }
    } catch (error) {
      if (current !== generation) return;
      lockScreen();
      message.textContent = authError(error);
      if (opened) window.location.reload();
    }
  }, error => {
    ++generation;
    lockScreen();
    message.textContent = authError(error);
    if (opened) window.location.reload();
  });

  loginButton.textContent = 'Google 계정으로 로그인';
  loginButton.disabled = false;
  loginButton.addEventListener('click', async () => {
    loginButton.disabled = true;
    message.textContent = '';
    try {
      await authSdk.signInWithPopup(auth, provider);
    } catch (error) {
      message.textContent = authError(error);
    } finally {
      loginButton.disabled = false;
    }
  });
  pwButton.disabled = false;
  pwForm.addEventListener('submit', async event => {
    event.preventDefault();
    pwButton.disabled = true;
    message.textContent = '';
    try {
      await authSdk.signInWithEmailAndPassword(auth, pwEmail.value.trim(), pwPassword.value);
      pwPassword.value = '';
    } catch (error) {
      message.textContent = authError(error);
    } finally {
      pwButton.disabled = false;
    }
  });
  logoutButton.addEventListener('click', async () => {
    logoutButton.disabled = true;
    try {
      await authSdk.signOut(auth);
      lockScreen();
      window.location.reload();
    } catch (error) {
      window.alert('로그아웃하지 못했습니다. 연결을 확인하고 다시 눌러 주세요.');
      logoutButton.disabled = false;
    }
  });
}

initializeLogin().catch(error => {
  lockScreen();
  loginButton.disabled = true;
  pwButton.disabled = true;
  loginButton.textContent = '새로고침해 주세요';
  message.textContent = authError(error);
});
