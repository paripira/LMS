# Setup di Laptop dari Nol (Windows · macOS)

Targetnya: aplikasi jalan di laptop Anda dalam ±30 menit dan Anda bisa login dengan data contoh.
Semua langkah di bawah memakai **Terminal**, jadi cukup salin-tempel perintahnya.

> **Konsep singkat.** Aplikasi ini butuh dua hal di laptop: **(1) Node.js** untuk menjalankan aplikasi, dan **(2) PostgreSQL** sebagai database. Setelah keduanya terpasang, Anda cukup menjalankan beberapa perintah.

---

## Langkah 1: Pasang Node.js

1. Buka **https://nodejs.org** → unduh versi **LTS** (tombol hijau di sebelah kiri) → jalankan installer, klik *Next* sampai selesai (biarkan semua opsi default).
2. **Tutup lalu buka lagi** Terminal (penting), kemudian cek:

   ```
   node -v
   npm -v
   ```
   `node -v` harus menampilkan angka **v20.12 atau lebih baru** (mis. `v22.11.0`). Bila lebih lama, pasang ulang versi LTS terbaru.

**Cara membuka Terminal**
- **Windows**: tekan tombol Windows → ketik `PowerShell` → Enter. (Atau klik kanan folder proyek → *Open in Terminal*.)
- **macOS**: tekan `Cmd + Spasi` → ketik `Terminal` → Enter.

## Langkah 2: Pasang PostgreSQL (pilih SATU: 2A atau 2B)

### 2A. PostgreSQL biasa (disarankan, ringan, tanpa Docker)

1. Buka **https://www.postgresql.org/download/** → pilih sistem operasi Anda → unduh installer (EDB untuk Windows/macOS) → pasang **versi 16**.
2. Saat installer meminta:
   - **Password** untuk user `postgres` → **catat password ini**.
   - **Port** → biarkan `5432`.
   - Komponen: biarkan semua tercentang (termasuk *pgAdmin* dan *Command Line Tools*).
3. Setelah selesai, buka **SQL Shell (psql)** (Windows: cari "SQL Shell" di menu Start; macOS: buka Terminal lalu ketik `psql -U postgres`).
   Tekan **Enter** untuk setiap pertanyaan (Server, Database, Port, Username) sampai diminta *Password*, lalu isi password dari langkah 2.
4. Salin-tempel tiga baris ini (satu per satu, Enter di akhir):

   ```sql
   CREATE USER lms WITH PASSWORD 'lms';
   CREATE DATABASE lms_test OWNER lms;
   CREATE DATABASE lms OWNER lms;
   ```
   Setiap baris harus dibalas `CREATE ROLE` / `CREATE DATABASE`. Lalu ketik `\q` dan Enter untuk keluar.

   > Password `lms` hanya untuk laptop pribadi. Jangan dipakai di server sungguhan.

### 2B. Docker (alternatif, bila Anda sudah terbiasa)

1. Pasang **Docker Desktop** dari docker.com dan jalankan sampai ikonnya "Running". (Windows butuh WSL2; laptop RAM kecil bisa terasa berat. Bila begitu, pakai 2A.)
2. Nanti pada langkah 4, jalankan `docker compose up -d` di folder proyek. Itu otomatis membuat user `lms` dan database `lms` + `lms_test`.

## Langkah 3: Ekstrak proyek

1. Letakkan `school-lms.zip` di folder yang pendek dan tanpa spasi, mis. `C:\proyek\` (Windows) atau `~/proyek/` (macOS). **Hindari** folder OneDrive/iCloud.
2. Klik kanan → *Extract All* (Windows) / klik dua kali (macOS). Hasilnya folder `lms`.
3. Buka Terminal **di dalam folder `lms`**:

   ```
   cd C:\proyek\lms          (Windows, sesuaikan lokasi Anda)
   cd ~/proyek/lms           (macOS)
   ```
   Cek Anda di tempat yang benar: perintah `dir` (Windows) atau `ls` (macOS) harus menampilkan `package.json`.

## Langkah 4: Pasang dependensi aplikasi

```
npm install
```
Tunggu 2–5 menit (butuh internet). Selesai bila muncul tulisan seperti `added 1xx packages`. Peringatan kuning (*warn / deprecated*) boleh diabaikan.

*(Hanya bila memilih Docker 2B: `docker compose up -d`, lalu `docker compose ps` sampai status "healthy".)*

## Langkah 5: Buat file konfigurasi `.env.test`

Ini berisi alamat database dan kunci rahasia.

**Windows (PowerShell):**
```
copy .env.example .env.test
notepad .env.test
```
**macOS:**
```
cp .env.example .env.test
open -e .env.test
```
Ganti isinya menjadi persis seperti ini (3 baris):

```
DATABASE_URL=postgres://lms:lms@localhost:5432/lms_test
SESSION_SECRET=isi-dengan-teks-acak-panjang-minimal-32-karakter
NEXT_PUBLIC_BUILD_ID=dev
```
- Untuk `SESSION_SECRET`, buat teks acak dengan perintah ini lalu salin hasilnya:
  ```
  node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
  ```
- Simpan (`Ctrl+S` / `Cmd+S`) dan tutup.
- ⚠️ Nama file harus **`.env.test`** (diawali titik, tanpa `.txt` di belakang). Di Windows, aktifkan *View → Show → File name extensions* di File Explorer untuk memeriksa.
- Nama database di `DATABASE_URL` **harus mengandung kata "test"** (pengaman: perintah berikutnya menghapus isi database itu).

## Langkah 6: Buat tabel dan isi data contoh

```
npm run demo:setup
```
Hasil yang benar (4 baris terakhir):
```
applied schema.sql
applied 002_extras.sql
...
Seed selesai. Semua akun demo memakai kata sandi: Passw0rd!
```

## Langkah 7: Jalankan aplikasi

```
npm run dev:demo
```
Tunggu sampai muncul `Ready`, lalu buka **http://localhost:3000** di browser (Chrome/Edge).
Login: **`admin`** / **`Passw0rd!`**. Untuk berhenti: tekan `Ctrl + C` di Terminal.

Akun contoh lain (sandi sama): `guru1` (wali kelas 7A), `guru2`, `siswa1`, `siswa2`, `siswa3`, `ortu1`, `kepsek`.

🎉 Bila halaman login dan Data Siswa tampil, setup berhasil.

## Langkah 8: Tur 10 menit (dianjurkan)

Buka `LOCAL-TESTING.md`, bagian **"Skenario uji manual"**. Urutannya sudah disusun dari Admin → Guru → Siswa → Orang tua → Kepala Sekolah. Gunakan jendela *Incognito* terpisah untuk tiap peran agar bisa login bersamaan.

## Langkah 9 (opsional): Tes otomatis

```
npx playwright install chromium     (sekali, ± 150 MB)
npm run test:update                 (sekali, membuat gambar acuan tampilan)
npm test
```
Bila ada tes yang gagal, jalankan `npx playwright show-report` lalu kirimkan tangkapan layarnya.

## Setiap kali ingin menjalankan lagi (hari berikutnya)

1. Pastikan PostgreSQL berjalan (biasanya otomatis menyala bersama laptop; Docker: buka Docker Desktop lalu `docker compose up -d`).
2. Buka Terminal di folder `lms` → `npm run dev:demo` → buka http://localhost:3000.
3. Ingin data contoh kembali bersih? `npm run demo:setup`.

## Nanti, untuk data sekolah yang sungguhan

Jangan pakai mode demo. Buat file **`.env`** (bukan `.env.test`) dengan `DATABASE_URL` ke database `lms`, lalu:

```
npm run db:migrate        (membuat tabel)
npm run db:bootstrap      (membuat akun admin; kata sandinya tampil SEKALI, catat!)
npm run dev
```
Lalu ikuti urutan di `README.md` (Profil Sekolah → Impor Guru → Kelas → Siswa → Mapel → Penugasan).

---

## Jika ada masalah

| Pesan / gejala | Penyebab & solusi |
|---|---|
| `'node' is not recognized` / `command not found: node` | Terminal belum dibuka ulang setelah memasang Node.js. Tutup & buka lagi. |
| PowerShell: `npm.ps1 cannot be loaded because running scripts is disabled` | Jalankan sekali: `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned` → jawab `Y`. Atau pakai *Command Prompt* (`cmd`). |
| `node: bad option: --env-file` | Versi Node terlalu lama. Pasang Node LTS terbaru (≥ 20.12). |
| `ECONNREFUSED 127.0.0.1:5432` | PostgreSQL belum jalan. Windows: *Services* → `postgresql-x64-16` → Start. macOS: buka aplikasi Postgres / `brew services start postgresql@16`. Docker: `docker compose up -d`. |
| `password authentication failed for user "lms"` | Password di `DATABASE_URL` tidak sama dengan yang dibuat di langkah 2A (`lms`). Ulangi `ALTER USER lms WITH PASSWORD 'lms';` di psql. |
| `database "lms_test" does not exist` | Langkah 2A butir 4 belum dijalankan. |
| `Seed menghapus SEMUA data… "test"` | Nama database di `.env.test` tidak mengandung "test". Itu pengaman, perbaiki namanya. |
| `Missing SESSION_SECRET` / login berulang kembali ke halaman login | `SESSION_SECRET` kosong di `.env.test`. Isi lalu jalankan ulang `npm run dev:demo`. |
| `Port 3000 is in use` | Pakai port lain: `npm run dev:demo -- -p 3300` lalu buka http://localhost:3300. |
| `npm install` gagal pada paket `xlsx` | Paket ini diunduh dari `cdn.sheetjs.com`. Pastikan internet/kantor tidak memblokirnya; coba jaringan lain. |
| Layar putih / error aneh setelah ganti versi | Hapus folder `.next` lalu jalankan ulang `npm run dev:demo`. |
