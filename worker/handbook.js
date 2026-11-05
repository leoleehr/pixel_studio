/* 講義閘門：只有 Google 登入且課程代碼正確、名單狀態為核准的學員拿得到 PDF 與網頁版內容。
 * 其餘網址不經過這支 Worker（見 wrangler.jsonc 的 run_worker_first），由靜態資產直接回應。
 * 內容放在 KV（HANDBOOKS），不在公開網站與 GitHub repo 中；上傳方式見 tools/upload_handbooks.py。
 */
const FILES = {
  '/vocal/vocal-class-handbook.pdf': 'Vocal_Lab_講義與教案.pdf',
  '/guitar/guitar-handbook.pdf': '民謠吉他十二章_講義與教案.pdf',
  '/piano/piano-handbook.pdf': '流行鋼琴十二堂_講義與教案.pdf',
  '/songwriting/songwriting-handbook.pdf': '詞曲創作八堂_講義與教案.pdf',
  '/en/vocal/vocal-class-handbook.pdf': 'Vocal_Lab_Handbook.pdf',
  '/en/guitar/guitar-handbook.pdf': 'Guitar_Lab_Handbook.pdf',
  '/en/piano/piano-handbook.pdf': 'Piano_Lab_Handbook.pdf',
  '/en/songwriting/songwriting-handbook.pdf': 'Songwriting_Lab_Handbook.pdf'
};
// 網頁版講義內容：登入後由講義頁載入，不當成檔案下載
const TEXTS = new Set([
  '/vocal/course-handbook.md', '/guitar/handbook.md', '/piano/handbook.md', '/songwriting/handbook.md',
  '/en/vocal/course-handbook.md', '/en/guitar/handbook.md', '/en/piano/handbook.md', '/en/songwriting/handbook.md'
]);

const NO_STORE = { 'Cache-Control': 'private, no-store', 'X-Content-Type-Options': 'nosniff', 'X-Robots-Tag': 'noindex' };

function fail(status, error, extra) {
  return new Response(JSON.stringify({ ok: false, error, ...extra }), {
    status,
    headers: { ...NO_STORE, 'Content-Type': 'application/json; charset=utf-8' }
  });
}

/* 由既有 Apps Script 後台驗證：依序檢查課程代碼、登入證明與班級名單。
 * lyrics 是不寫入資料、不搶鎖定的已登入動作；空代碼查不到歌詞，只取它的驗證結果。 */
async function verify(env, code, session) {
  const r = await fetch(env.BACKEND_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({ action: 'lyrics', id: '', code, session })
  });
  if (!r.ok) throw new Error('backend ' + r.status);
  return r.json();
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const filename = FILES[url.pathname];
    const isText = TEXTS.has(url.pathname);
    if (!filename && !isText) return env.ASSETS.fetch(request);

    // 直接開網址、舊連結或爬蟲：帶回講義頁，由按鈕走登入流程
    if (request.method === 'GET' || request.method === 'HEAD') {
      return new Response(null, { status: 303, headers: { ...NO_STORE, Location: new URL('handbook', url).pathname } });
    }
    if (request.method !== 'POST') return fail(405, 'method');

    const origin = request.headers.get('Origin');
    if (origin && origin !== url.origin) return fail(403, 'origin');

    let body;
    try { body = JSON.parse(await request.text()); } catch (e) { return fail(400, 'bad-json'); }
    const code = typeof body?.code === 'string' ? body.code : '';
    const session = typeof body?.session === 'string' ? body.session : '';
    if (!code || code.length > 100) return fail(401, 'code');
    if (!session || session.length > 2000) return fail(401, 'session');

    let check;
    try { check = await verify(env, code, session); } catch (e) { return fail(503, 'backend'); }
    if (!check || !check.ok) {
      const error = check && check.error;
      if (error === 'code' || error === 'session') return fail(401, error);
      if (error === 'roster') return fail(403, 'roster', { status: check.status || '' });
      return fail(503, 'backend');
    }

    const content = await env.HANDBOOKS.get(url.pathname.slice(1), { type: 'stream' });
    if (!content) return fail(404, 'missing');
    if (isText) return new Response(content, { headers: { ...NO_STORE, 'Content-Type': 'text/markdown; charset=utf-8' } });
    return new Response(content, {
      headers: {
        ...NO_STORE,
        'Content-Type': 'application/pdf',
        'Content-Disposition': "attachment; filename*=UTF-8''" + encodeURIComponent(filename)
      }
    });
  }
};
