# Panduan Testing Upload File dengan Postman

Berikut langkah-langkah untuk melakukan pengetesan upload file produk menggunakan Postman:

## 1. Konfigurasi Request
*   **Method**: `POST`
*   **URL**: `http://localhost:8000/product` (pastikan backend berjalan)

## 2. Authorization
*   Pilih tab **Authorization**.
*   Type: **Bearer Token**.
*   Masukkan **Token** login user Anda (bisa didapat dari response login).

## 3. Body Request (Multipart)
*   Pilih tab **Body**.
*   Pilih opsi **form-data**.
*   Masukkan key-value untuk data produk:
    *   `name`: `Nama Produk` (Text)
    *   `price`: `10000` (Text)
    *   `stock`: `5` (Text)
    *   `description`: `Keterangan produk...` (Text)
*   **Untuk File Gambar**:
    *   Masukkan Key: `image` (harus `image` sesuai kode backend).
    *   Ubah tipe input dari **Text** menjadi **File** (muncul saat hover di kanan kolom Key).
    *   Pada kolom **Value**, klik tombol upload dan pilih file gambar dari komputer Anda.

## 4. Send
*   Klik tombol **Send**.
*   Jika berhasil, Anda akan mendapat response JSON produk baru dengan properti `imageUrl`.

## 5. Cek Hasil
*   File gambar akan tersimpan di folder `be/public/uploads/products`.
*   URL gambar dapat diakses di `http://localhost:8000/{imageUrl}`.
