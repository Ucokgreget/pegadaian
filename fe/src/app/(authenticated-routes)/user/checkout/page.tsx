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
import s from "./Checkout.module.css";

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
      router.push(`/user/invoice/${result.invoiceId}`);
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
      <div className={s.loadingWrap}>
        <Loader2 className={s.spinner} />
        <p>Memuat halaman checkout...</p>
      </div>
    );

  return (
    <>
      <ToastContainerComponent />
      <div className={s.page}>
        <div className={s.container}>
          <div className={s.pageHeader}>
            <h1 className={s.pageTitle}>Checkout</h1>
            <p className={s.pageSubtitle}>
              Pilih paket dan metode pembayaran Anda
            </p>
          </div>

          <div className={s.layout}>
            <div className={s.formCol}>
              {/* Step 1: Package */}
              <div className={s.section}>
                <div className={s.sectionHeader}>
                  <div className={s.stepBadge}>1</div>
                  <div>
                    <h2 className={s.sectionTitle}>Pilih Paket</h2>
                    <p className={s.sectionDesc}>
                      Pilih paket yang sesuai kebutuhan Anda
                    </p>
                  </div>
                </div>
                <div className={s.packageGrid}>
                  {packages.map((pkg) => (
                    <button
                      key={pkg.id}
                      type="button"
                      onClick={() => setSelectedPackage(pkg)}
                      className={`${s.packageCard} ${selectedPackage?.id === pkg.id ? s.packageCardActive : ""}`}
                    >
                      {pkg.isPopular && (
                        <span className={s.popularTag}>Popular</span>
                      )}
                      <div className={s.packageIconWrap}>
                        <Package className={s.packageIcon} />
                      </div>
                      <p className={s.packageName}>{pkg.name}</p>
                      <p className={s.packagePrice}>
                        Rp {pkg.price.toLocaleString("id-ID")}
                        <span className={s.packagePricePer}>/bln</span>
                      </p>
                      {selectedPackage?.id === pkg.id && (
                        <CheckCircle2 className={s.packageCheck} />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Step 2: Durasi */}
              <div className={s.section}>
                <div className={s.sectionHeader}>
                  <div className={s.stepBadge}>2</div>
                  <div>
                    <h2 className={s.sectionTitle}>Pilih Durasi</h2>
                    <p className={s.sectionDesc}>
                      Hemat lebih banyak dengan berlangganan lebih lama
                    </p>
                  </div>
                </div>
                <div className={s.billingGrid}>
                  {BILLING_OPTIONS.map((opt, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setSelectedBilling(i)}
                      className={`${s.billingCard} ${selectedBilling === i ? s.billingCardActive : ""}`}
                    >
                      <div className={s.billingLabel}>
                        <Clock className={s.billingIcon} />
                        {opt.label}
                      </div>
                      {opt.discount && (
                        <span className={s.discountTag}>
                          Hemat {opt.discount}%
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Step 3: Addons */}
              <div className={s.section}>
                <div className={s.sectionHeader}>
                  <div className={s.stepBadge}>3</div>
                  <div>
                    <h2 className={s.sectionTitle}>Tambahan Fitur</h2>
                    <p className={s.sectionDesc}>
                      Opsional — tambahkan fitur ekstra sesuai kebutuhan
                    </p>
                  </div>
                </div>
                <div className={s.addonGrid}>
                  {ADDONS.map((addon) => {
                    const active = selectedAddons.includes(addon.id);
                    return (
                      <button
                        key={addon.id}
                        type="button"
                        onClick={() => toggleAddon(addon.id)}
                        className={`${s.addonCard} ${active ? s.addonCardActive : ""}`}
                      >
                        <div className={s.addonTop}>
                          <div className={s.addonInfo}>
                            <p className={s.addonName}>{addon.name}</p>
                            <p className={s.addonDesc}>{addon.description}</p>
                          </div>
                          <div
                            className={`${s.addonToggle} ${active ? s.addonToggleActive : ""}`}
                          >
                            {active ? (
                              <Minus className={s.toggleIcon} />
                            ) : (
                              <Plus className={s.toggleIcon} />
                            )}
                          </div>
                        </div>
                        <p className={s.addonPrice}>
                          + Rp {addon.price.toLocaleString("id-ID")}
                          <span className={s.addonPricePer}>/bulan</span>
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Step 4: Promo */}
              <div className={s.section}>
                <div className={s.sectionHeader}>
                  <div className={s.stepBadge}>4</div>
                  <div>
                    <h2 className={s.sectionTitle}>Kode Promo</h2>
                    <p className={s.sectionDesc}>
                      Punya kode diskon? Masukkan di sini
                    </p>
                  </div>
                </div>
                {promoResult?.valid ? (
                  <div className={s.promoApplied}>
                    <div className={s.promoAppliedLeft}>
                      <CheckCircle2 className={s.promoCheck} />
                      <div>
                        <p className={s.promoAppliedCode}>
                          {promoResult.promo.code}
                        </p>
                        <p className={s.promoAppliedDesc}>
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
                      className={s.promoRemoveBtn}
                    >
                      Hapus
                    </button>
                  </div>
                ) : (
                  <div className={s.promoInputRow}>
                    <div className={s.promoInputWrap}>
                      <Tag className={s.promoInputIcon} />
                      <input
                        type="text"
                        value={promoCode}
                        onChange={(e) =>
                          setPromoCode(e.target.value.toUpperCase())
                        }
                        onKeyDown={(e) => e.key === "Enter" && validatePromo()}
                        placeholder="Masukkan kode promo"
                        className={s.promoInput}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={validatePromo}
                      disabled={isValidatingPromo || !promoCode.trim()}
                      className={s.promoBtn}
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
              <div className={s.section}>
                <div className={s.sectionHeader}>
                  <div className={s.stepBadge}>5</div>
                  <div>
                    <h2 className={s.sectionTitle}>Metode Pembayaran</h2>
                    <p className={s.sectionDesc}>
                      Pilih metode pembayaran yang Anda inginkan
                    </p>
                  </div>
                </div>
                {Object.keys(groupedChannels).length === 0 ? (
                  <p className={s.noChannels}>
                    Tidak ada metode pembayaran tersedia.
                  </p>
                ) : (
                  Object.entries(groupedChannels).map(([group, chs]) => (
                    <div key={group} className={s.channelGroup}>
                      <p className={s.channelGroupLabel}>{group}</p>
                      <div className={s.channelGrid}>
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
                              className={`${s.channelCard} ${selectedChannel === ch.code ? s.channelCardActive : ""}`}
                            >
                              {ch.icon_url ? (
                                <img
                                  src={ch.icon_url}
                                  alt={ch.name}
                                  className={s.channelIcon}
                                />
                              ) : (
                                <CreditCard className={s.channelIconFallback} />
                              )}
                              <span className={s.channelName}>{ch.name}</span>
                              {feeLabel ? (
                                <span className={s.channelFee}>
                                  Fee: {feeLabel}
                                </span>
                              ) : (
                                <span className={s.channelFeeFree}>Gratis</span>
                              )}
                              {selectedChannel === ch.code && (
                                <CheckCircle2 className={s.channelCheck} />
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
            <div className={s.summaryCol}>
              <div className={s.summary}>
                <h3 className={s.summaryTitle}>Ringkasan Pesanan</h3>
                {selectedPackage ? (
                  <>
                    <div className={s.summaryPackage}>
                      <div className={s.summaryPackageIcon}>
                        <Package />
                      </div>
                      <div>
                        <p className={s.summaryPackageName}>
                          {selectedPackage.name}
                        </p>
                        <p className={s.summaryPackageDuration}>
                          {billing.label}
                        </p>
                      </div>
                    </div>

                    {selectedAddons.length > 0 && (
                      <div className={s.summaryAddons}>
                        {selectedAddons.map((id) => {
                          const addon = ADDONS.find((a) => a.id === id);
                          return addon ? (
                            <div key={id} className={s.summaryAddonRow}>
                              <span>+ {addon.name}</span>
                              <span>
                                Rp {addon.price.toLocaleString("id-ID")}
                              </span>
                            </div>
                          ) : null;
                        })}
                      </div>
                    )}

                    <div className={s.summaryDivider} />

                    <div className={s.summaryRows}>
                      <div className={s.summaryRow}>
                        <span>Paket ({billing.multiplier} bln)</span>
                        <span>
                          Rp {subtotalPackage.toLocaleString("id-ID")}
                        </span>
                      </div>
                      {subtotalAddons > 0 && (
                        <div className={s.summaryRow}>
                          <span>Fitur tambahan</span>
                          <span>
                            Rp {subtotalAddons.toLocaleString("id-ID")}
                          </span>
                        </div>
                      )}
                      {billingDiscountAmount > 0 && (
                        <div
                          className={`${s.summaryRow} ${s.summaryRowDiscount}`}
                        >
                          <span>Diskon {billing.discount}%</span>
                          <span>
                            - Rp {billingDiscountAmount.toLocaleString("id-ID")}
                          </span>
                        </div>
                      )}
                      {promoDiscountAmount > 0 && (
                        <div
                          className={`${s.summaryRow} ${s.summaryRowDiscount}`}
                        >
                          <span>Promo ({promoResult?.promo.code})</span>
                          <span>
                            - Rp {promoDiscountAmount.toLocaleString("id-ID")}
                          </span>
                        </div>
                      )}

                      {/* Fee row — hanya tampil kalau customer yang nanggung */}
                      {feeBearer === "customer" && feeAmount > 0 && (
                        <div className={`${s.summaryRow} ${s.summaryRowFee}`}>
                          <span className={s.feeLabel}>
                            Biaya transaksi
                            <span title="Biaya dikenakan oleh payment gateway">
                              <Info className={s.feeInfo} />
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
                            className={`${s.summaryRow} ${s.summaryRowInfo}`}
                          >
                            <span className={s.feeLabel}>
                              Biaya transaksi
                              <span title="Ditanggung oleh merchant">
                                <Info className={s.feeInfo} />
                              </span>
                            </span>
                            <span className={s.feeFree}>Gratis</span>
                          </div>
                        )}
                    </div>

                    <div className={s.summaryDivider} />

                    <div className={s.summaryTotal}>
                      <span>Total</span>
                      <span className={s.summaryTotalAmount}>
                        Rp {total.toLocaleString("id-ID")}
                      </span>
                    </div>

                    {selectedChannel && (
                      <div className={s.summaryPayMethod}>
                        <CreditCard className={s.summaryPayIcon} />
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
                  <div className={s.summaryEmpty}>
                    <Package className={s.summaryEmptyIcon} />
                    <p>Pilih paket untuk melihat ringkasan</p>
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={
                    !selectedPackage || !selectedChannel || isSubmitting
                  }
                  className={s.submitBtn}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className={s.spinSm} /> Memproses...
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
