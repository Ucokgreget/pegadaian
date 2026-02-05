export const botRuntime = new Map();
// userId => { status, qr, updatedAt }

export function setRuntime(userId, data) {
  botRuntime.set(userId, {
    ...botRuntime.get(userId),
    ...data,
    updatedAt: Date.now(),
  });
}

export function getRuntime(userId) {
  return (
    botRuntime.get(userId) ?? {
      status: "loading",
      qr: null,
    }
  );
}
