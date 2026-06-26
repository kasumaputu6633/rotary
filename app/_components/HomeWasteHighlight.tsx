export default function HomeWasteHighlight() {
  return (
    <section className="bg-white py-6" aria-labelledby="waste-highlight-heading">
      <div className="mx-auto max-w-[1728px] px-8 lg:px-40">
        <style>{`
          .hwh-card {
            border-radius: 10px;
            border: 1px solid #e1e5ec;
            background: #ffffff;
            display: grid;
            grid-template-columns: 4px 1fr;
            gap: 0;
            overflow: hidden;
            box-shadow: 0 4px 16px rgba(15,23,42,0.06);
          }
          .hwh-accent-bar {
            background: #f7a81b;
          }
          .hwh-inner {
            display: flex;
            flex-direction: row;
            align-items: center;
            gap: 0;
            padding: 0;
            flex-wrap: wrap;
          }
          .hwh-left {
            display: flex;
            flex-direction: column;
            gap: 4px;
            padding: 20px 24px;
            flex: 0 0 auto;
            min-width: 260px;
          }
          .hwh-icon-row {
            display: flex;
            align-items: center;
            gap: 10px;
          }
          .hwh-icon {
            color: #f7a81b;
            flex-shrink: 0;
          }
          .hwh-label {
            font-family: var(--font-poppins), system-ui, sans-serif;
            font-size: 11px;
            font-weight: 600;
            color: #17458f;
            letter-spacing: 0.06em;
            text-transform: uppercase;
          }
          .hwh-title {
            font-family: var(--font-poppins), system-ui, sans-serif;
            font-size: clamp(17px, 1.8vw, 22px);
            font-weight: 800;
            color: #171717;
            margin: 0;
            line-height: 1.2;
            letter-spacing: -0.01em;
          }
          .hwh-divider {
            width: 1px;
            align-self: stretch;
            background: #edf0f5;
            flex-shrink: 0;
          }
          .hwh-right {
            flex: 1 1 0;
            min-width: 200px;
            display: flex;
            flex-direction: column;
            gap: 5px;
            padding: 20px 24px;
          }
          .hwh-hook {
            font-family: var(--font-poppins), system-ui, sans-serif;
            font-size: 13px;
            font-weight: 600;
            color: #171717;
            margin: 0;
          }
          .hwh-desc {
            font-family: var(--font-poppins), system-ui, sans-serif;
            font-size: 13px;
            color: #5f6370;
            line-height: 1.6;
            margin: 0;
          }
          .hwh-cta-wrap {
            flex: 0 0 auto;
            display: flex;
            flex-direction: column;
            align-items: flex-end;
            gap: 5px;
            padding: 20px 24px 20px 0;
          }
          .hwh-cta {
            display: inline-flex;
            align-items: center;
            gap: 7px;
            height: 38px;
            padding: 0 18px;
            border-radius: 8px;
            background: #17458f;
            color: #ffffff;
            font-family: var(--font-poppins), system-ui, sans-serif;
            font-size: 13px;
            font-weight: 600;
            text-decoration: none;
            white-space: nowrap;
            transition: background 200ms, box-shadow 200ms;
          }
          .hwh-cta:hover {
            background: #123a79;
            box-shadow: 0 6px 16px rgba(23,69,143,0.22);
          }
          .hwh-micro {
            font-family: var(--font-poppins), system-ui, sans-serif;
            font-size: 11px;
            color: #8a95a6;
            text-align: right;
            white-space: nowrap;
          }
          @media (max-width: 680px) {
            .hwh-inner { flex-direction: column; }
            .hwh-divider { display: none; }
            .hwh-left, .hwh-right { padding: 16px 20px 0; }
            .hwh-cta-wrap { padding: 12px 20px 16px; align-items: stretch; }
          }
          @media (prefers-reduced-motion: reduce) {
            .hwh-cta { transition: none; }
          }
        `}</style>

        <div className="hwh-card">
          <div className="hwh-accent-bar" aria-hidden="true" />
          <div className="hwh-inner">
            <div className="hwh-left">
              <div className="hwh-icon-row">
                <svg
                  className="hwh-icon"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M18 8c0 3.613-3.869 7.429-5.393 8.795a1 1 0 0 1-1.214 0C9.87 15.429 6 11.613 6 8a6 6 0 0 1 12 0" />
                  <circle cx="12" cy="8" r="2" />
                  <path d="M8.714 14h-3.71a1 1 0 0 0-.948.683l-2.004 6A1 1 0 0 0 3 22h18a1 1 0 0 0 .948-1.316l-2-6a1 1 0 0 0-.949-.684h-3.712" />
                </svg>
                <span className="hwh-label">Direktori Limbah</span>
              </div>
              <h2 id="waste-highlight-heading" className="hwh-title">
                Lokasi Penampung<br />Limbah
              </h2>
            </div>
            <div className="hwh-divider" aria-hidden="true" />
            <div className="hwh-right">
              <p className="hwh-hook">Tahu ke mana harus membuang limbahmu?</p>
              <p className="hwh-desc">
                Kami menyediakan direktori lengkap lokasi yang menerima berbagai jenis material — dari plastik hingga organik — agar limbahmu tidak berakhir salah tempat.
              </p>
            </div>
            <div className="hwh-cta-wrap">
              <a href="/waste" className="hwh-cta">
                Buka Direktori
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M5 12h14m-7-7l7 7-7 7" />
                </svg>
              </a>
              <span className="hwh-micro">Plastik · Kaca · Kertas · dan lainnya</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
