import { Icon } from "@iconify/react";
import { dummyConversations as conversations, unreadChatCount } from "../_data/seller-center";
import { Badge, PageHeader } from "../_components/SellerCenterUi";

const quickReplies = [
  "Barang masih tersedia.",
  "Bisa lihat dulu sebelum deal.",
  "Bisa atur titik temu sore ini.",
];

export default function SellerChatPage() {
  return (
    <div className="grid gap-5">
      <PageHeader
        icon="lucide:messages-square"
        kicker="Chat Pembeli"
        title="Percakapan Listing"
        description="Balas calon pembeli dan cek konteks barang dari satu layar tanpa kehilangan detail listing."
        meta={
          <>
            <Badge tone="danger">{unreadChatCount} belum dibaca</Badge>
            <Badge tone="accent">Manual deal</Badge>
          </>
        }
        actions={
          <button type="button" className="h-10 rounded-[8px] border border-[var(--seller-rule-strong)] bg-[var(--seller-surface)] px-4 text-[12px] font-semibold text-[var(--seller-brand)] hover:bg-[var(--seller-brand-soft)]">
            Tandai dibaca
          </button>
        }
      />

      <section className="grid min-h-[calc(100vh-190px)] overflow-hidden rounded-[8px] border border-[var(--seller-rule)] bg-[var(--seller-surface)] shadow-[var(--seller-shadow)] xl:grid-cols-[330px_minmax(0,1fr)_310px]">
        <aside className="border-b border-[var(--seller-rule)] xl:border-b-0 xl:border-r">
          <div className="border-b border-[var(--seller-rule)] p-3">
            <div className="flex h-10 items-center rounded-[8px] border border-[var(--seller-rule-strong)] bg-[var(--seller-surface-2)] px-3">
              <Icon icon="lucide:search" width={15} height={15} className="text-[var(--seller-muted)]" aria-hidden="true" />
              <input className="min-w-0 flex-1 bg-transparent px-3 text-[12px] outline-none placeholder:text-[var(--seller-muted)]" placeholder="Cari chat..." />
            </div>
          </div>

          <div className="max-h-[280px] overflow-y-auto xl:max-h-[calc(100vh-205px)]">
            {conversations.map((conversation) => (
              <button
                key={conversation.name}
                type="button"
                className={`grid w-full grid-cols-[40px_minmax(0,1fr)_auto] gap-3 border-b border-[var(--seller-rule)] p-3 text-left transition-colors hover:bg-[var(--seller-surface-2)] ${
                  conversation.active ? "bg-[var(--seller-accent-soft)]" : "bg-[var(--seller-surface)]"
                }`}
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-[8px] bg-[var(--seller-brand)] text-white">
                  <Icon icon="lucide:user-round" width={17} height={17} aria-hidden="true" />
                </span>
                <span className="min-w-0">
                  <span className="flex items-center gap-2">
                    <span className="truncate text-[13px] font-semibold text-[var(--seller-ink)]">{conversation.name}</span>
                    {conversation.unread > 0 && (
                      <span className="rounded-full bg-[var(--seller-danger)] px-1.5 py-0.5 text-[10px] font-bold text-white">{conversation.unread}</span>
                    )}
                  </span>
                  <span className="mt-0.5 block truncate text-[11px] font-semibold text-[var(--seller-brand)]">{conversation.listing}</span>
                  <span className="mt-1 block truncate text-[12px] text-[var(--seller-muted)]">{conversation.preview}</span>
                </span>
                <span className="text-[10px] text-[var(--seller-muted)]">{conversation.time}</span>
              </button>
            ))}
          </div>
        </aside>

        <div className="grid min-h-[540px] grid-rows-[auto_minmax(0,1fr)_auto]">
          <header className="flex items-center justify-between gap-3 border-b border-[var(--seller-rule)] px-4 py-3">
            <div className="min-w-0">
              <h2 className="truncate text-[15px] font-semibold text-[var(--seller-ink)]">Ayu Lestari</h2>
              <p className="mt-0.5 truncate text-[12px] text-[var(--seller-muted)]">Tertarik pada Rak Buku Kayu Minimalis</p>
            </div>
            <span className="rounded-full bg-[var(--seller-success-soft)] px-3 py-1 text-[11px] font-semibold text-[var(--seller-success)]">Online</span>
          </header>

          <div className="min-h-0 overflow-y-auto bg-[var(--seller-surface-2)] px-4 py-4">
            <div className="mx-auto grid max-w-3xl gap-3">
              <p className="mx-auto rounded-full bg-[var(--seller-surface)] px-3 py-1 text-[11px] text-[var(--seller-muted)] shadow-sm">Hari ini</p>
              <div className="max-w-[78%] rounded-[8px] border border-[var(--seller-rule)] bg-[var(--seller-surface)] px-4 py-3 text-[13px] leading-relaxed shadow-sm">
                Halo kak, rak bukunya masih tersedia?
                <p className="mt-1 text-[10px] text-[var(--seller-muted)]">10:24</p>
              </div>
              <div className="ml-auto max-w-[78%] rounded-[8px] bg-[var(--seller-brand)] px-4 py-3 text-[13px] leading-relaxed text-white">
                Masih ada. Kondisi masih kuat, bisa dilihat dulu sebelum deal.
                <p className="mt-1 text-right text-[10px] text-white/70">10:26</p>
              </div>
              <div className="max-w-[78%] rounded-[8px] border border-[var(--seller-rule)] bg-[var(--seller-surface)] px-4 py-3 text-[13px] leading-relaxed shadow-sm">
                Bisa atur temu sore ini di Denpasar Barat?
                <p className="mt-1 text-[10px] text-[var(--seller-muted)]">10:28</p>
              </div>
            </div>
          </div>

          <footer className="border-t border-[var(--seller-rule)] bg-[var(--seller-surface)] px-4 py-3">
            <div className="mb-2 flex gap-2 overflow-x-auto pb-1">
              {quickReplies.map((reply) => (
                <button key={reply} type="button" className="shrink-0 rounded-full border border-[var(--seller-accent)] px-3 py-1.5 text-[11px] font-semibold text-[var(--seller-brand)] hover:bg-[var(--seller-accent-soft)]">
                  {reply}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-[1fr_40px] gap-2">
              <input className="h-10 rounded-[8px] border border-[var(--seller-rule-strong)] bg-[var(--seller-surface)] px-3 text-[13px] outline-none focus:border-[var(--seller-brand)]" placeholder="Tulis pesan..." />
              <button type="button" className="flex h-10 w-10 items-center justify-center rounded-[8px] bg-[var(--seller-accent)] text-white hover:brightness-95" aria-label="Kirim pesan">
                <Icon icon="lucide:send-horizontal" width={18} height={18} aria-hidden="true" />
              </button>
            </div>
          </footer>
        </div>

        <aside className="border-t border-[var(--seller-rule)] bg-[var(--seller-surface)] xl:border-l xl:border-t-0">
          <div className="border-b border-[var(--seller-rule)] px-4 py-3">
            <h2 className="text-[15px] font-semibold text-[var(--seller-ink)]">Detail Listing</h2>
            <p className="mt-0.5 text-[12px] text-[var(--seller-muted)]">Konteks barang yang sedang dibahas.</p>
          </div>

          <div className="grid gap-4 p-4">
            <div className="flex aspect-[4/3] items-center justify-center rounded-[8px] bg-[var(--seller-brand-soft)] text-[var(--seller-brand)]">
              <Icon icon="lucide:image" width={34} height={34} aria-hidden="true" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-[15px] font-semibold text-[var(--seller-ink)]">Rak Buku Kayu Minimalis</h3>
                <span className="rounded-full bg-[var(--seller-accent-soft)] px-2 py-0.5 text-[10px] font-semibold text-[var(--seller-brand)]">Dijual</span>
              </div>
              <p className="mt-1 text-[18px] font-semibold text-[var(--seller-ink)]">Rp. 180.000</p>
              <p className="mt-2 text-[12px] leading-relaxed text-[var(--seller-muted)]">
                Kondisi bekas layak pakai. Cocok untuk kamar, ruang belajar, atau sudut baca.
              </p>
            </div>

            <dl className="grid gap-2 text-[12px]">
              <div className="flex justify-between gap-3 rounded-[8px] bg-[var(--seller-surface-2)] px-3 py-2">
                <dt className="text-[var(--seller-muted)]">Lokasi</dt>
                <dd className="font-semibold text-[var(--seller-ink)]">Denpasar Barat</dd>
              </div>
              <div className="flex justify-between gap-3 rounded-[8px] bg-[var(--seller-surface-2)] px-3 py-2">
                <dt className="text-[var(--seller-muted)]">Kondisi</dt>
                <dd className="font-semibold text-[var(--seller-ink)]">Layak pakai</dd>
              </div>
              <div className="flex justify-between gap-3 rounded-[8px] bg-[var(--seller-surface-2)] px-3 py-2">
                <dt className="text-[var(--seller-muted)]">Peminat</dt>
                <dd className="font-semibold text-[var(--seller-ink)]">6 orang</dd>
              </div>
            </dl>

            <button type="button" className="h-9 rounded-[8px] border border-[var(--seller-accent)] text-[12px] font-semibold text-[var(--seller-brand)] hover:bg-[var(--seller-accent-soft)]">
              Buka Halaman Listing
            </button>
          </div>
        </aside>
      </section>
    </div>
  );
}
