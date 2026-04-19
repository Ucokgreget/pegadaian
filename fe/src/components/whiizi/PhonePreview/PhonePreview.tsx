import Chat from "@/components/ui/chat";
import IphoneFrame from "@/components/ui/iphone-frame";

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
    <div className="flex items-center justify-center relative lg:justify-end">
      {/* Glow behind */}
      <div className="absolute w-[300px] h-[300px] rounded-full top-1/2 left-1/2 pointer-events-none -translate-x-1/2 -translate-y-1/2 animate-[glowPulse_4s_ease-in-out_infinite] bg-[radial-gradient(circle,rgba(34,197,94,0.15)_0%,rgba(16,185,129,0.08)_40%,transparent_70%)]" />

      {/* Phone */}
      <div className="relative z-[2] drop-shadow-[0_32px_48px_rgba(34,197,94,0.2)] animate-[phoneFloat_6s_ease-in-out_infinite]">
        <IphoneFrame>
          <Chat
            messages={messages}
            currentUser="Customer"
            users={[
              {
                name: "Customer",
                avatar: "/logo-sijaka-png-transparent.png",
              },
              {
                name: "Sijaka.id Bot",
                avatar: "/logo-sijaka-png-transparent.png",
              },
            ]}
          />
        </IphoneFrame>
      </div>
    </div>
  );
}
