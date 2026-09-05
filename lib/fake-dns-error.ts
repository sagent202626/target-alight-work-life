/**
 * fake-dns-error.ts
 * ---------------------------------------------------------------------------
 * Pixel-faithful recreation of Chrome's "This site can't be reached"
 * (ERR_NAME_NOT_RESOLVED) error page. It is served to any visitor who does
 * NOT arrive via a US search engine (and is not a crawler / deep-link), so
 * the site looks like a dead, unresolvable domain when accessed directly.
 *
 * Fully self-contained: inline CSS + inline SVG icon, no external fonts,
 * scripts, or images. Responsive — a desktop layout on wide screens and a
 * centered mobile layout on narrow screens (matches Chrome on both).
 *
 * The domain string shown is the actual host the visitor requested (read from
 * the request Host header), exactly like real Chrome does.
 */

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
}

/** Chrome's sad "tab / page" icon, inline SVG (gray, no external asset). */
function sadIconSvg(): string {
  return `<svg width="100%" height="100%" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <path d="M24 26h42l24 24v36a12 12 0 0 1-12 12H24a12 12 0 0 1-12-12V38a12 12 0 0 1 12-12z" fill="#e8eaed" stroke="#9aa0a6" stroke-width="4"/>
  <path d="M66 26v16a8 8 0 0 0 8 8h16" fill="none" stroke="#9aa0a6" stroke-width="4"/>
  <circle cx="46" cy="68" r="5.5" fill="#80868b"/>
  <circle cx="76" cy="68" r="5.5" fill="#80868b"/>
  <path d="M48 92c4.5-8 23.5-8 28 0" fill="none" stroke="#80868b" stroke-width="4" stroke-linecap="round"/>
</svg>`
}

export function fakeDnsErrorHtml(host: string): string {
  const domain = host && host.length ? host : "targetandpaymentbenefits.com"
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<meta http-equiv="x-ua-compatible" content="ie=edge">
<title>targetandpaymentbenefits.com</title>
<style>
  :root{
    --ink:#3c4043;        /* title / headings  */
    --body:#5f6368;       /* body copy         */
    --muted:#80868b;      /* error code / muted*/
    --bullet:#9aa0a6;
    --bg:#ffffff;
    --blue:#1a73e8;
    --blue-press:#1765cc;
    --btn-border:#dadce0;
    --btn-ink:#3c4043;
  }
  *{box-sizing:border-box;}
  html,body{margin:0;padding:0;height:100%;}
  body{
    background:var(--bg);
    color:var(--body);
    font-family:"Segoe UI",Roboto,Helvetica,Arial,sans-serif;
    -webkit-font-smoothing:antialiased;
    text-rendering:optimizeLegibility;
  }
  .wrap{
    min-height:100%;
    display:flex;
    justify-content:center;
    align-items:flex-start;
    padding:0 24px;
  }
  .card{
    width:100%;
    max-width:560px;
    margin-top:96px;
  }
  .icon{
    width:96px;height:96px;
    margin:0 0 28px 0;
    display:block;
  }
  h1{
    color:var(--ink);
    font-size:24px;
    font-weight:500;
    line-height:1.33;
    margin:0 0 16px 0;
  }
  .lead{
    font-size:15px;
    line-height:1.6;
    margin:0 0 28px 0;
    color:var(--body);
    overflow-wrap:anywhere;
  }
  .try{
    font-size:15px;
    color:var(--body);
    margin:0 0 10px 0;
  }
  ul.try-list{
    list-style:none;
    margin:0 0 32px 0;
    padding:0 0 0 4px;
  }
  ul.try-list li{
    position:relative;
    padding-left:22px;
    font-size:15px;
    line-height:1.7;
    color:var(--body);
  }
  ul.try-list li::before{
    content:"";
    position:absolute;
    left:2px;top:.55em;
    width:6px;height:6px;
    border-radius:50%;
    background:var(--bullet);
  }
  .err{
    font-family:Roboto,monospace;
    font-size:13px;
    letter-spacing:.4px;
    color:var(--muted);
    margin:0 0 28px 0;
  }
  .actions{
    display:flex;
    align-items:center;
    gap:12px;
    justify-content:space-between;
  }
  .btn{
    appearance:none;
    border:1px solid transparent;
    border-radius:4px;
    font-family:inherit;
    font-size:14px;
    font-weight:500;
    line-height:1;
    padding:10px 20px;
    cursor:pointer;
    text-decoration:none;
    display:inline-block;
  }
  .btn-reload{
    background:var(--blue);
    color:#fff;
  }
  .btn-reload:active{background:var(--blue-press);}
  .btn-details{
    background:#fff;
    color:var(--btn-ink);
    border-color:var(--btn-border);
  }
  .btn-details:active{background:#f1f3f4;}

  /* Mobile: centered, tighter, stacked actions */
  @media (max-width:600px){
    .card{margin-top:48px;}
    .icon{width:72px;height:72px;margin-bottom:20px;}
    h1{font-size:20px;}
    .lead,.try,ul.try-list li{font-size:14px;}
    .actions{flex-direction:column-reverse;align-items:stretch;gap:10px;}
    .btn{width:100%;text-align:center;padding:12px 16px;}
  }
</style>
</head>
<body>
  <div class="wrap">
    <div class="card">
      <span class="icon">${sadIconSvg()}</span>
      <h1>This site can't be reached</h1>
      <p class="lead">${esc(domain)}'s server IP address could not be found.</p>
      <p class="try">Try:</p>
      <ul class="try-list">
        <li>Checking the connection</li>
        <li>Checking the proxy, firewall and DNS configuration</li>
        <li>Running Windows Network Diagnostics</li>
      </ul>
      <p class="err">ERR_NAME_NOT_RESOLVED</p>
      <div class="actions">
        <a class="btn btn-reload" href="javascript:location.reload()">Reload</a>
        <button class="btn btn-details" type="button" onclick="this.nextElementSibling.style.display='block'">Details</button>
        <div style="display:none;font-size:12px;color:var(--muted);line-height:1.5">
          Chrome tried to connect to ${esc(domain)}, but this site's server IP address could not be found.
        </div>
      </div>
    </div>
  </div>
</body>
</html>`
}
