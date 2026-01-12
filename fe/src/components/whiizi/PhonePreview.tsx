import Chat from "@/components/ui/chat";
import IphoneFrame from "@/components/ui/iphone-frame";

export function PhonePreview() {
  const messages = [
    {
      id: "1",
      name: "Customer",
      message: "Halo, mau beli akun Netflix",
      timestamp: "10:45",
    },
    {
      id: "2",
      name: "Whiizi Bot",
      message: "Halo! 👋",
      timestamp: "10:46",
    },
    {
      id: "3",
      name: "Whiizi Bot",
      message: "Silakan pilih paket di bawah ini:",
      timestamp: "10:46",
    },
    {
      id: "4",
      name: "Whiizi Bot",
      message: "💎 Paket Premium 1 Bulan\nRp45.000",
      timestamp: "10:47",
    },
    {
      id: "5",
      name: "Whiizi Bot",
      message: "✅ Pembayaran akan diproses secara otomatis",
      timestamp: "10:48",
    },
  ];

  return (
    <div className="flex items-center justify-center lg:justify-end">
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
              name: "Whiizi Bot",
              avatar: "https://api.dicebear.com/7.x/avataaars/png?seed=Bot",
            },
          ]}
        />
      </IphoneFrame>
    </div>
  );
}
