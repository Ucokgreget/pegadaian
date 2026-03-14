import Chat from "@/components/ui/chat";
import IphoneFrame from "@/components/ui/iphone-frame";
import styles from "./PhonePreview.module.css";

export function PhonePreview() {
  const messages = [
    {
      id: "1",
      name: "Customer",
      message: "Halo, mau beli akun Netflix 1 bulan dong 🙏",
      timestamp: "10:45",
    },
    {
      id: "2",
      name: "Sijaka.id Bot",
      message:
        "Halo! Selamat datang di Sijaka.id 👋\nAda yang bisa kami bantu?",
      timestamp: "10:45",
    },
    {
      id: "3",
      name: "Sijaka.id Bot",
      message: "Berikut pilihan paket Netflix kami:",
      timestamp: "10:46",
    },
    {
      id: "4",
      name: "Sijaka.id Bot",
      message:
        "💎 *Netflix Premium — 1 Bulan*\n✅ 4 Screen UHD\n✅ Garansi penuh\n\n*Harga: Rp45.000*",
      timestamp: "10:46",
    },
    {
      id: "5",
      name: "Customer",
      message: "Oke, mau yang itu!",
      timestamp: "10:47",
    },
    {
      id: "6",
      name: "Sijaka.id Bot",
      message:
        "✅ Pesanan diterima!\nSilakan transfer ke:\n🏦 BCA 1234567890\n\nOtomatis aktif dalam 2 menit setelah konfirmasi. 🚀",
      timestamp: "10:47",
    },
  ];

  return (
    <div className={styles.wrapper}>
      {/* Glow behind */}
      <div className={styles.glowRing} />

      {/* Phone */}
      <div className={styles.phoneFloat}>
        <IphoneFrame>
          <Chat
            messages={messages}
            currentUser="Customer"
            users={[
              {
                name: "Customer",
                avatar:
                  "https://api.dicebear.com/7.x/avataaars/png?seed=Customer",
              },
              {
                name: "Sijaka.id Bot",
                avatar:
                  "https://api.dicebear.com/7.x/avataaars/png?seed=SijakaBot",
              },
            ]}
          />
        </IphoneFrame>
      </div>
    </div>
  );
}
