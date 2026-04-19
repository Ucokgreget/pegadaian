"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Loader2,
  CheckCircle2,
  CreditCard,
  Package,
  Clock,
  Tag,
  Plus,
  Minus,
  Info,
} from "lucide-react";
import {
  getPaymentChannels,
  createOrder,
  PaymentChannel,
} from "@/actions/checkout";
import {
  Package as PackageType,
  getPublicPackagesClient,
} from "@/actions/package";
import { toast } from "react-toastify";
import ToastContainerComponent from "@/components/ui/ToastContainerComponent";

const BILLING_OPTIONS = [
  { label: "1 Bulan", multiplier: 1 },
  { label: "3 Bulan", multiplier: 3, discount: 5 },
  { label: "6 Bulan", multiplier: 6, discount: 10 },
  { label: "12 Bulan", multiplier: 12, discount: 15 },
];

const ADDONS = [
  {
    id: 1,
    key: "extra-bot",
    name: "Extra Bot WhatsApp",
    description: "Tambah 1 bot WA tambahan",
    price: 50000,
  },
  {
    id: 2,
    key: "priority-support",
    name: "Priority Support",
    description: "Support 24/7 via dedicated agent",
    price: 75000,
  },
  {
    id: 3,
    key: "custom-domain",
    name: "Custom Domain",
    description: "Gunakan domain sendiri",
    price: 100000,
  },
  {
    id: 4,
    key: "analytics-pro",
    name: "Analytics Pro",
    description: "Dashboard analytics lanjutan",
    price: 60000,
  },
];

interface PromoResult {
  valid: boolean;
  promo: {
    id: number;
    code: string;
    type: "fixed" | "percent";
    value: number;
    maxDiscount: number | null;
  };
}

// Helper: parse percent yang bisa berupa string "0.00" atau number
function parsePercent(val: string | number | undefined): number {
  if (val === undefined || val === null) return 0;
  return typeof val === "string" ? parseFloat(val) : val;
}

// Helper: hitung fee dari fee object
function calcFee(
  feeObj: { flat: number; percent: string | number } | undefined,
  amount: number,
): number {
  if (!feeObj) return 0;
  const flat = feeObj.flat || 0;
  const pct = parsePercent(feeObj.percent);
  return flat + Math.round((amount * pct) / 100);
}

// Helper: format fee label untuk ditampilkan di channel card
function formatFeeLabel(
  feeObj: { flat: number; percent: string | number } | undefined,
): string | null {
  if (!feeObj) return null;
  const flat = feeObj.flat || 0;
  const pct = parsePercent(feeObj.percent);
  if (flat === 0 && pct === 0) return null;
  const parts = [];
  if (flat > 0) parts.push(`Rp ${flat.toLocaleString("id-ID")}`);
  if (pct > 0) parts.push(`${pct}%`);
  return parts.join(" + ");
}

export default function CheckoutPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const preselectedId = searchParams.get("package");

  const feeBearer = (process.env.NEXT_PUBLIC_TRIPAY_FEE_BEARER ||
    "customer") as "customer" | "merchant";

  const [packages, setPackages] = useState<PackageType[]>([]);
  const [channels, setChannels] = useState<PaymentChannel[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<PackageType | null>(
    null,
  );
  const [selectedBilling, setSelectedBilling] = useState(0);
  const [selectedChannel, setSelectedChannel] = useState("");
  const [selectedAddons, setSelectedAddons] = useState<number[]>([]);
  const [promoCode, setPromoCode] = useState("");
  const [promoResult, setPromoResult] = useState<PromoResult | null>(null);
  const [isValidatingPromo, setIsValidatingPromo] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const load = async () => {
      const [pkgs, chs] = await Promise.all([
        getPublicPackagesClient(),
        getPaymentChannels(),
      ]);
      const active = pkgs.filter((p) => p.isActive && !p.isCustomPrice);
      setPackages(active);
      setChannels(chs.filter((c) => c.active));
      if (preselectedId) {
        const found = active.find((p) => p.id === parseInt(preselectedId));
        if (found) setSelectedPackage(found);
      }
      setIsLoading(false);
    };
    load();
  }, []);

  // ── Pricing ──────────────────────────────────────────────────────────────
  const billing = BILLING_OPTIONS[selectedBilling];
  const basePrice = selectedPackage?.price || 0;
  const subtotalPackage = basePrice * billing.multiplier;
  const subtotalAddons = selectedAddons.reduce(
    (acc, id) => acc + (ADDONS.find((a) => a.id === id)?.price || 0),
    0,
  );
  const subtotal = subtotalPackage + subtotalAddons;
  const billingDiscountAmount = Math.round(
    (subtotalPackage * (billing.discount || 0)) / 100,
  );

  let promoDiscountAmount = 0;
  if (promoResult?.valid) {
    const p = promoResult.promo;
    promoDiscountAmount =
      p.type === "fixed"
        ? p.value
        : Math.min(
            Math.round((subtotal * p.value) / 100),
            p.maxDiscount ?? Infinity,
          );
  }

  const afterDiscount = subtotal - billingDiscountAmount - promoDiscountAmount;

  const selectedChannelData = channels.find((c) => c.code === selectedChannel);

  // Pilih fee object sesuai feeBearer
  const activeFeeObj =
    feeBearer === "customer"
      ? selectedChannelData?.fee_customer
      : selectedChannelData?.fee_merchant;

  const feeAmount = calcFee(activeFeeObj, afterDiscount);

  // Customer hanya bayar fee kalau feeBearer === "customer"
  const total =
    feeBearer === "customer" ? afterDiscount + feeAmount : afterDiscount;

  // ── Promo ────────────────────────────────────────────────────────────────
  const validatePromo = async () => {
    if (!promoCode.trim()) return;
    setIsValidatingPromo(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/promo/validate`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code: promoCode.trim().toUpperCase() }),
        },
      );
      const data = await res.json();
      if (!res.ok) {
        setPromoResult(null);
        toast.error(data.error || "Kode promo tidak valid");
      } else {
        setPromoResult(data);
        toast.success(`Promo "${data.promo.code}" diterapkan!`);
      }
    } catch {
      toast.error("Gagal memvalidasi promo");
    } finally {
      setIsValidatingPromo(false);
    }
  };

  const toggleAddon = (id: number) =>
    setSelectedAddons((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id],
    );

  const handleSubmit = async () => {
    if (!selectedPackage) return toast.error("Pilih package terlebih dahulu");
    if (!selectedChannel) return toast.error("Pilih metode pembayaran");
    setIsSubmitting(true);
    try {
      const result = await createOrder({
        packageId: selectedPackage.id,
        paymentMethod: selectedChannel,
        billingMultiplier: billing.multiplier,
        addonIds: selectedAddons,
        promoCode: promoResult?.valid ? promoResult.promo.code : undefined,
      });
      router.push(`/user/invoice/${encodeURIComponent(result.invoiceNumber)}`);
    } catch (err: any) {
      toast.error(err.message || "Gagal membuat order");
    } finally {
      setIsSubmitting(false);
    }
  };

  const groupedChannels = channels.reduce<Record<string, PaymentChannel[]>>(
    (acc, ch) => {
      if (!acc[ch.group]) acc[ch.group] = [];
      acc[ch.group].push(ch);
      return acc;
    },
    {},
  );

  if (isLoading)
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-muted-foreground">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        <p>Memuat halaman checkout...</p>
      </div>
    );

  return (
    <>
      <ToastContainerComponent />
      <div className="min-h-screen bg-background pt-8 pb-16">
        <div className="max-w-[1100px] mx-auto px-6">
          <div className="mb-8">
            <h1 className="text-[1.75rem] font-bold text-foreground m-0 tracking-[-0.03em]">Checkout</h1>
            <p className="text-[0.9rem] text-muted-foreground mt-1 mb-0">
              Pilih paket dan metode pembayaran Anda
            </p>
          </div>

          <div className="grid grid-cols-[1fr_340px] gap-8 items-start max-md:grid-cols-1">
            <div>
              {/* Step 1: Package */}
              <div className="bg-card border border-border rounded-xl p-6 mb-5">
                <div className="flex items-start gap-4 mb-5">
                  <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-[0.8rem] font-bold shrink-0">1</div>
                  <div>
                    <h2 className="text-base font-semibold text-foreground m-0">Pilih Paket</h2>
                    <p className="text-[0.8rem] text-muted-foreground mt-1 mb-0">
                      Pilih paket yang sesuai kebutuhan Anda
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-[repeat(auto-fill,minmax(140px,1fr))] gap-3">
                  {packages.map((pkg) => (
                    <button
                      key={pkg.id}
                      type="button"
                      onClick={() => setSelectedPackage(pkg)}
                      className={`relative flex flex-col items-center gap-2 py-4 px-3 rounded-lg border-[1.5px] border-border bg-background cursor-pointer transition-all duration-150 text-center hover:border-primary/40 ${selectedPackage?.id === pkg.id ? "!border-primary !bg-primary/5" : ""}`}
                    >
                      {pkg.isPopular && (
                        <span className="absolute -top-2 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-[0.65rem] font-bold py-[0.15rem] px-2 rounded-full whitespace-nowrap">Popular</span>
                      )}
                      <div className="w-9 h-9 rounded-md bg-primary/10 text-primary flex items-center justify-center">
                        <Package className="w-[1.1rem] h-[1.1rem]" />
                      </div>
                      <p className="text-[0.85rem] font-semibold text-foreground m-0">{pkg.name}</p>
                      <p className="text-[0.8rem] text-muted-foreground m-0">
                        Rp {pkg.price.toLocaleString("id-ID")}
                        <span className="text-[0.7rem]">/bln</span>
                      </p>
                      {selectedPackage?.id === pkg.id && (
                        <CheckCircle2 className="absolute top-2 right-2 w-4 h-4 text-primary" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Step 2: Durasi */}
              <div className="bg-card border border-border rounded-xl p-6 mb-5">
                <div className="flex items-start gap-4 mb-5">
                  <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-[0.8rem] font-bold shrink-0">2</div>
                  <div>
                    <h2 className="text-base font-semibold text-foreground m-0">Pilih Durasi</h2>
                    <p className="text-[0.8rem] text-muted-foreground mt-1 mb-0">
                      Hemat lebih banyak dengan berlangganan lebih lama
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-3 max-[500px]:grid-cols-2">
                  {BILLING_OPTIONS.map((opt, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setSelectedBilling(i)}
                      className={`flex flex-col items-center gap-1.5 py-3.5 px-2 rounded-lg border-[1.5px] border-border bg-background cursor-pointer transition-all duration-150 text-[0.85rem] text-center hover:border-primary/40 ${selectedBilling === i ? "!border-primary !bg-primary/5" : ""}`}
                    >
                      <div className="flex items-center gap-1 font-semibold text-foreground">
                        <Clock className="w-[0.85rem] h-[0.85rem] text-primary" />
                        {opt.label}
                      </div>
                      {opt.discount && (
                        <span className="text-[0.65rem] font-bold text-[#16a34a] bg-[#16a34a]/10 rounded-full py-[0.1rem] px-[0.45rem]">
                          Hemat {opt.discount}%
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Step 3: Addons */}
              <div className="bg-card border border-border rounded-xl p-6 mb-5">
                <div className="flex items-start gap-4 mb-5">
                  <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-[0.8rem] font-bold shrink-0">3</div>
                  <div>
                    <h2 className="text-base font-semibold text-foreground m-0">Tambahan Fitur</h2>
                    <p className="text-[0.8rem] text-muted-foreground mt-1 mb-0">
                      Opsional — tambahkan fitur ekstra sesuai kebutuhan
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-3">
                  {ADDONS.map((addon) => {
                    const active = selectedAddons.includes(addon.id);
                    return (
                      <button
                        key={addon.id}
                        type="button"
                        onClick={() => toggleAddon(addon.id)}
                        className={`flex flex-col gap-3 p-4 rounded-lg border-[1.5px] border-border bg-background cursor-pointer transition-all duration-150 text-left hover:border-primary/40 group ${active ? "!border-primary !bg-primary/5 active" : ""}`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <p className="text-[0.875rem] font-semibold text-foreground m-0">{addon.name}</p>
                            <p className="text-[0.75rem] text-muted-foreground mt-1 mb-0">{addon.description}</p>
                          </div>
                          <div
                            className={`w-7 h-7 rounded-full border-[1.5px] border-border bg-transparent flex items-center justify-center shrink-0 transition-all duration-150 ${active ? "!bg-primary !border-primary !text-primary-foreground" : ""}`}
                          >
                            {active ? (
                              <Minus className="w-[0.85rem] h-[0.85rem] text-primary-foreground" />
                            ) : (
                              <Plus className="w-[0.85rem] h-[0.85rem] text-muted-foreground" />
                            )}
                          </div>
                        </div>
                        <p className="text-[0.8rem] font-semibold text-primary m-0">
                          + Rp {addon.price.toLocaleString("id-ID")}
                          <span className="font-normal text-muted-foreground text-[0.75rem]">/bulan</span>
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Step 4: Promo */}
              <div className="bg-card border border-border rounded-xl p-6 mb-5">
                <div className="flex items-start gap-4 mb-5">
                  <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-[0.8rem] font-bold shrink-0">4</div>
                  <div>
                    <h2 className="text-base font-semibold text-foreground m-0">Kode Promo</h2>
                    <p className="text-[0.8rem] text-muted-foreground mt-1 mb-0">
                      Punya kode diskon? Masukkan di sini
                    </p>
                  </div>
                </div>
                {promoResult?.valid ? (
                  <div className="flex items-center justify-between gap-4 py-3.5 px-4 bg-[#16a34a]/10 border border-[#16a34a]/25 rounded-lg">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-[#16a34a] shrink-0" />
                      <div>
                        <p className="text-[0.875rem] font-bold text-foreground font-mono m-0">
                          {promoResult.promo.code}
                        </p>
                        <p className="text-[0.75rem] text-[#16a34a] mt-1 mb-0">
                          Diskon{" "}
                          {promoResult.promo.type === "percent"
                            ? `${promoResult.promo.value}%`
                            : `Rp ${promoResult.promo.value.toLocaleString("id-ID")}`}
                          {promoResult.promo.maxDiscount &&
                            ` (maks Rp ${promoResult.promo.maxDiscount.toLocaleString("id-ID")})`}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setPromoResult(null);
                        setPromoCode("");
                      }}
                      className="text-[0.75rem] text-muted-foreground bg-none border-none cursor-pointer underline whitespace-nowrap"
                    >
                      Hapus
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-3">
                    <div className="flex-1 flex items-center gap-2 bg-background border border-border rounded-md px-3 transition-colors duration-150 focus-within:border-ring">
                      <Tag className="w-4 h-4 text-muted-foreground shrink-0" />
                      <input
                        type="text"
                        value={promoCode}
                        onChange={(e) =>
                          setPromoCode(e.target.value.toUpperCase())
                        }
                        onKeyDown={(e) => e.key === "Enter" && validatePromo()}
                        placeholder="Masukkan kode promo"
                        className="flex-1 bg-transparent border-none outline-none py-2.5 text-[0.875rem] text-foreground font-mono tracking-[0.05em] placeholder:text-muted-foreground placeholder:opacity-60 placeholder:tracking-normal placeholder:font-sans"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={validatePromo}
                      disabled={isValidatingPromo || !promoCode.trim()}
                      className="px-5 h-11 bg-primary text-primary-foreground border-none rounded-md text-[0.875rem] font-semibold cursor-pointer transition-opacity duration-150 flex items-center whitespace-nowrap hover:not(:disabled):opacity-90 disabled:opacity-45 disabled:cursor-not-allowed"
                    >
                      {isValidatingPromo ? (
                        <Loader2 className={s.spinSm} />
                      ) : (
                        "Terapkan"
                      )}
                    </button>
                  </div>
                )}
              </div>

              {/* Step 5: Pembayaran */}
              <div className="bg-card border border-border rounded-xl p-6 mb-5">
                <div className="flex items-start gap-4 mb-5">
                  <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-[0.8rem] font-bold shrink-0">5</div>
                  <div>
                    <h2 className="text-base font-semibold text-foreground m-0">Metode Pembayaran</h2>
                    <p className="text-[0.8rem] text-muted-foreground mt-1 mb-0">
                      Pilih metode pembayaran yang Anda inginkan
                    </p>
                  </div>
                </div>
                {Object.keys(groupedChannels).length === 0 ? (
                  <p className="text-center p-6 text-muted-foreground text-[0.875rem]">
                    Tidak ada metode pembayaran tersedia.
                  </p>
                ) : (
                  Object.entries(groupedChannels).map(([group, chs]) => (
                    <div key={group} className="mb-4">
                      <p className="text-[0.7rem] font-bold uppercase tracking-[0.1em] text-muted-foreground mb-2">{group}</p>
                      <div className="grid grid-cols-[repeat(auto-fill,minmax(110px,1fr))] gap-2.5">
                        {chs.map((ch) => {
                          // Tampilkan fee sesuai siapa yang nanggung
                          const displayFeeObj =
                            feeBearer === "customer"
                              ? ch.fee_customer
                              : ch.fee_merchant;
                          const feeLabel = formatFeeLabel(displayFeeObj);

                          return (
                            <button
                              key={ch.code}
                              type="button"
                              onClick={() => setSelectedChannel(ch.code)}
                              className={`relative flex flex-col items-center gap-1.5 py-3 px-2 rounded-lg border-[1.5px] border-border bg-background cursor-pointer transition-all duration-150 hover:border-primary/40 ${selectedChannel === ch.code ? "!border-primary !bg-primary/5" : ""}`}
                            >
                              {ch.icon_url ? (
                                <img
                                  src={ch.icon_url}
                                  alt={ch.name}
                                  className="h-6 w-auto object-contain"
                                />
                              ) : (
                                <CreditCard className="w-6 h-6 text-muted-foreground" />
                              )}
                              <span className="text-[0.7rem] text-foreground font-medium text-center">{ch.name}</span>
                              {feeLabel ? (
                                <span className="text-[0.6rem] text-muted-foreground text-center">
                                  Fee: {feeLabel}
                                </span>
                              ) : (
                                <span className="text-[0.6rem] text-[#16a34a] font-semibold">Gratis</span>
                              )}
                              {selectedChannel === ch.code && (
                                <CheckCircle2 className="absolute top-1.5 right-1.5 w-[0.85rem] h-[0.85rem] text-primary" />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Summary */}
            <div className="sticky top-6">
              <div className="bg-card border border-border rounded-xl p-6">
                <h3 className="text-base font-bold text-foreground m-0 mb-5">Ringkasan Pesanan</h3>
                {selectedPackage ? (
                  <>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-md bg-primary/10 text-primary flex items-center justify-center shrink-0">
                        <Package />
                      </div>
                      <div>
                        <p className="text-[0.9rem] font-semibold text-foreground m-0">
                          {selectedPackage.name}
                        </p>
                        <p className="text-[0.8rem] text-muted-foreground mt-1 mb-0">
                          {billing.label}
                        </p>
                      </div>
                    </div>

                    {selectedAddons.length > 0 && (
                      <div className="flex flex-col gap-1 mb-2">
                        {selectedAddons.map((id) => {
                          const addon = ADDONS.find((a) => a.id === id);
                          return addon ? (
                            <div key={id} className="flex justify-between text-[0.75rem] text-muted-foreground">
                              <span>+ {addon.name}</span>
                              <span>
                                Rp {addon.price.toLocaleString("id-ID")}
                              </span>
                            </div>
                          ) : null;
                        })}
                      </div>
                    )}

                    <div className="h-[1px] bg-border my-3.5" />

                    <div className="flex flex-col gap-2">
                      <div className="flex justify-between text-[0.875rem] text-muted-foreground">
                        <span>Paket ({billing.multiplier} bln)</span>
                        <span>
                          Rp {subtotalPackage.toLocaleString("id-ID")}
                        </span>
                      </div>
                      {subtotalAddons > 0 && (
                        <div className="flex justify-between text-[0.875rem] text-muted-foreground">
                          <span>Fitur tambahan</span>
                          <span>
                            Rp {subtotalAddons.toLocaleString("id-ID")}
                          </span>
                        </div>
                      )}
                      {billingDiscountAmount > 0 && (
                        <div
                          className="flex justify-between text-[0.875rem] text-[#16a34a]"
                        >
                          <span>Diskon {billing.discount}%</span>
                          <span>
                            - Rp {billingDiscountAmount.toLocaleString("id-ID")}
                          </span>
                        </div>
                      )}
                      {promoDiscountAmount > 0 && (
                        <div
                          className="flex justify-between text-[0.875rem] text-[#16a34a]"
                        >
                          <span>Promo ({promoResult?.promo.code})</span>
                          <span>
                            - Rp {promoDiscountAmount.toLocaleString("id-ID")}
                          </span>
                        </div>
                      )}

                      {/* Fee row — hanya tampil kalau customer yang nanggung */}
                      {feeBearer === "customer" && feeAmount > 0 && (
                        <div className="flex justify-between text-[0.875rem] text-muted-foreground">
                          <span className="flex items-center gap-1">
                            Biaya transaksi
                            <span title="Biaya dikenakan oleh payment gateway">
                              <Info className="w-[0.8rem] h-[0.8rem] text-muted-foreground cursor-help" />
                            </span>
                          </span>
                          <span>+ Rp {feeAmount.toLocaleString("id-ID")}</span>
                        </div>
                      )}

                      {/* Info kalau merchant yang nanggung fee */}
                      {feeBearer === "merchant" &&
                        selectedChannel &&
                        feeAmount > 0 && (
                          <div
                            className="flex justify-between text-[0.875rem] text-muted-foreground"
                          >
                            <span className="flex items-center gap-1">
                              Biaya transaksi
                              <span title="Ditanggung oleh merchant">
                                <Info className="w-[0.8rem] h-[0.8rem] text-muted-foreground cursor-help" />
                              </span>
                            </span>
                            <span className="text-[#16a34a] font-semibold text-[0.875rem]">Gratis</span>
                          </div>
                        )}
                    </div>

                    <div className="h-[1px] bg-border my-3.5" />

                    <div className="flex justify-between items-center [&>span:first-child]:text-[0.9rem] [&>span:first-child]:font-semibold [&>span:first-child]:text-foreground">
                      <span>Total</span>
                      <span className="text-[1.25rem] font-extrabold text-primary tracking-[-0.03em]">
                        Rp {total.toLocaleString("id-ID")}
                      </span>
                    </div>

                    {selectedChannel && (
                      <div className="flex items-center gap-2 mt-3 py-2.5 px-3 bg-primary/5 border border-primary/20 rounded-md text-[0.8rem] text-foreground">
                        <CreditCard className="w-[0.9rem] h-[0.9rem] text-primary" />
                        <span>
                          {
                            channels.find((c) => c.code === selectedChannel)
                              ?.name
                          }
                        </span>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-6 text-muted-foreground text-[0.875rem]">
                    <Package className="w-10 h-10 mx-auto mb-2 block opacity-30" />
                    <p>Pilih paket untuk melihat ringkasan</p>
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={
                    !selectedPackage || !selectedChannel || isSubmitting
                  }
                  className="w-full mt-5 p-3.5 bg-primary text-primary-foreground border-none rounded-lg text-[0.9rem] font-semibold cursor-pointer flex items-center justify-center gap-1.5 transition-opacity duration-150 hover:not(:disabled):opacity-90 disabled:opacity-45 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-[0.9rem] h-[0.9rem] animate-spin" /> Memproses...
                    </>
                  ) : (
                    "Lanjut Bayar →"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
