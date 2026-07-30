import axiosClient from "./axiosClient";

export const barcodeApi = {
  scanBarcode: (barcode) => axiosClient.post("/barcode/scan", { barcode }),
};
