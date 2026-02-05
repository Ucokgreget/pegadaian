let qr = null;
let status = "disconnected";

export const setQR = (newQr) => {
  qr = newQr;
};

export const getQR = () => {
  return qr;
};

export const setStatus = (newStatus) => {
  status = newStatus;
};

export const getStatus = () => {
  return status;
};
