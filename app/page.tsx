'use client';

import { useState, FormEvent } from 'react';

// =========================================================
// CONFIG — the only value you need to touch after deploying.
// Since the API route lives in this same repo, this can just
// be a relative path once both are deployed together.
// =========================================================
const EBOOK_DOWNLOAD_URL = 'https://your-storage-or-cdn-link/tamang-timpla-starter-guide.pdf';

type FormState = 'idle' | 'submitting' | 'success' | 'error';

export default function Home() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [companyWebsite, setCompanyWebsite] = useState(''); // honeypot
  const [state, setState] = useState<FormState>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [isDuplicate, setIsDuplicate] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    // bot caught the honeypot — silently drop
    if (companyWebsite.trim()) return;

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();

    if (trimmedName.length < 2) {
      setState('error');
      setErrorMessage('Ilagay ang buo mong pangalan.');
      return;
    }
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(trimmedEmail)) {
      setState('error');
      setErrorMessage('Maglagay ng valid na email address.');
      return;
    }

    setState('submitting');
    setErrorMessage('');

    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: trimmedName,
          email: trimmedEmail,
          source: 'risograph-landing',
          companyWebsite,
        }),
      });

      const result = await res.json();
      if (!result.ok) throw new Error(result.error || 'Unknown error');

      setIsDuplicate(Boolean(result.duplicate));
      setState('success');
    } catch (err) {
      console.error(err);
      setState('error');
      setErrorMessage('May problema sa pag-save. Subukan ulit, o i-refresh ang page.');
    }
  }

  const firstName = name.trim().split(' ')[0] || 'kaibigan';

  return (
    <>
      {/* grain texture overlay, decorative */}
      <svg className="grain" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
        <filter id="noise">
          <feTurbulence type="fractalNoise" baseFrequency={0.85} numOctaves={2} stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#noise)" />
      </svg>

      <header className="site-header">
        <div className="wrap">
          <a className="brand" href="#top">FEED MASTER PH</a>
          <a className="header-cta" href="#gate">Kunin ang gabay</a>
        </div>
      </header>

      <main id="top">
        {/* ============ HERO ============ */}
        <section className="hero">
          <div
            className="riso-blob"
            aria-hidden="true"
            style={{ width: 260, height: 260, background: 'var(--riso-yellow)', opacity: 0.55, top: -60, right: -60 }}
          />
          <div
            className="riso-blob"
            aria-hidden="true"
            style={{ width: 160, height: 160, background: 'var(--riso-blue)', opacity: 0.35, bottom: '10%', right: '8%' }}
          />

          <div className="wrap">
            <div className="eyebrow-row">
              <span className="stamp stamp--fill">100% Libre</span>
              <span className="stamp">Para sa Backyard Farmers</span>
            </div>

            <h1 className="headline-stack">
              <span className="layer layer-red" aria-hidden="true">Tama ang Timpla,<br />Taas ang Kita.</span>
              <span className="layer layer-blue" aria-hidden="true">Tama ang Timpla,<br />Taas ang Kita.</span>
              <span className="layer-main">Tama ang Timpla,<br />Taas ang Kita.</span>
            </h1>

            <p className="hero-sub">
              Kunin ang <strong>libreng starter guide</strong> ng Feed Master PH — batayang gabay sa pagtimpla ng
              sariling feed, para makatipid at magsimula nang tama sa unang araw.
            </p>

            <div className="hero-actions">
              <a href="#gate" className="btn">I-download nang libre</a>
              <a href="#inside" className="btn btn-ghost">Ano ang laman</a>
            </div>
          </div>
        </section>

        <div className="torn" aria-hidden="true" />

        {/* ============ WHAT'S INSIDE ============ */}
        <section className="section" id="inside">
          <div className="wrap">
            <div className="section-head">
              <span className="section-label">Nasa loob ng gabay</span>
              <h2 className="section-title">Tatlong bagay na kailangan mo bago ka magtimpla.</h2>
            </div>

            <div className="card-grid">
              <div className="card">
                <span className="card-num">01</span>
                <h3>Batayang Feed Formula</h3>
                <p>Simpleng starting-point formulation na pwede mong i-adjust base sa available na sangkap sa inyo.</p>
              </div>
              <div className="card">
                <span className="card-num">02</span>
                <h3>Saan Manggagaling ang Sangkap</h3>
                <p>Listahan ng mga karaniwang lokal na ingredient at kung paano tignan kung maganda ang kalidad.</p>
              </div>
              <div className="card">
                <span className="card-num">03</span>
                <h3>Simpleng Cost Checklist</h3>
                <p>Gabay sa pagtantiya ng gastos kada kilo, para malinaw agad kung tama ang iyong timpla.</p>
              </div>
            </div>
          </div>
        </section>

        {/* ============ CREDIBILITY ============ */}
        <section className="credibility">
          <div className="wrap">
            <span className="credibility-mark">Sino si Feed Master PH</span>
            <p>
              Ginawa ng Licensed Professional Agriculturist na may background sa feed formulation at agricultural
              research — para may batayan ang bawat payo, hindi basta chismis sa grupo.
            </p>
          </div>
        </section>

        <div className="torn" aria-hidden="true" />

        {/* ============ GATE / FORM ============ */}
        <section className="gate" id="gate">
          <div className="wrap">
            <div className="gate-panel">
              {state !== 'success' ? (
                <div className="form-block">
                  <h2 className="gate-title">Ipadala sa akin ang libreng gabay</h2>
                  <p className="gate-sub">Ilagay ang pangalan at email — direktang ipapadala ang download link.</p>

                  <form onSubmit={handleSubmit} noValidate>
                    <div className="field">
                      <label htmlFor="leadName">Pangalan</label>
                      <input
                        type="text"
                        id="leadName"
                        name="name"
                        autoComplete="name"
                        required
                        minLength={2}
                        placeholder="Juan Dela Cruz"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                      />
                    </div>

                    <div className="field">
                      <label htmlFor="leadEmail">Email</label>
                      <input
                        type="email"
                        id="leadEmail"
                        name="email"
                        autoComplete="email"
                        required
                        placeholder="juan@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>

                    {/* honeypot: hidden from real visitors, catches simple bots */}
                    <div className="hp" aria-hidden="true">
                      <label htmlFor="companyWebsite">Website</label>
                      <input
                        type="text"
                        id="companyWebsite"
                        name="companyWebsite"
                        tabIndex={-1}
                        autoComplete="off"
                        value={companyWebsite}
                        onChange={(e) => setCompanyWebsite(e.target.value)}
                      />
                    </div>

                    <button type="submit" className="btn gate-submit" disabled={state === 'submitting'}>
                      {state === 'submitting' ? 'Sinasave…' : 'I-download ang libreng gabay'}
                    </button>

                    <p className="status" role="status" aria-live="polite" data-state={state === 'error' ? 'error' : ''}>
                      {state === 'error' ? errorMessage : ''}
                    </p>
                  </form>

                  <p className="gate-note">Direkta lang sa iyong email. Walang spam, pwede ka mag-unsubscribe anumang oras.</p>
                </div>
              ) : (
                <div className="success-block is-visible">
                  <span className="success-stamp">Napadala na</span>
                  <h2 className="gate-title">Salamat, {firstName}!</h2>
                  <p className="gate-sub">
                    {isDuplicate
                      ? 'Nakita ka na namin sa listahan — heto ulit ang link ng gabay.'
                      : 'Handa na ang iyong libreng gabay — pindutin lang sa baba.'}
                  </p>
                  <a className="btn download-btn" href={EBOOK_DOWNLOAD_URL} target="_blank" rel="noopener noreferrer">
                    I-download ngayon
                  </a>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="wrap">
          <span>Feed Master PH · Tamang timpla, tiyak na kita</span>
          <span>&copy; {new Date().getFullYear()}</span>
        </div>
      </footer>
    </>
  );
}
