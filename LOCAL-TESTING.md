# Panduan Testing Lokal

> Belum pernah memasang apa pun di laptop? Mulai dari **[SETUP-LAPTOP.md](SETUP-LAPTOP.md)** (langkah demi langkah dari nol), lalu kembali ke sini untuk skenario uji.

Ada tiga cara menguji. Mulai dari **A** (paling cepat), lanjut ke **B** bila ingin tes otomatis.

| | Tujuan | Database | Perintah utama |
|---|---|---|---|
| **A. Mode demo** | Mencoba semua layar dengan data contoh | `lms_test` (boleh dihapus) | `npm run demo:setup` → `npm run dev:demo` |
| **B. Tes otomatis** | Playwright (login, impor, presensi, ujian offline, tampilan tabel) | `lms_test` | `npm test` |
| **C. Setup sungguhan** | Memakai data sekolah sendiri | `lms` | `npm run db:migrate` → `npm run db:bootstrap` |

## 0. Prasyarat

- **Node.js ≥ 20.12** (`node -v`)
- **PostgreSQL 14+** , pilih salah satu:
  - Docker (paling mudah, lihat 1a), atau
  - PostgreSQL yang sudah terpasang di komputer (lihat 1b)

## 1. Siapkan database

### 1a. Dengan Docker

```bash
docker compose up -d          # membuat database "lms" dan "lms_test" (user: lms, sandi: lms)
docker compose ps             # tunggu sampai status "healthy"
```

Mematikan: `docker compose down` (data tetap ada). Reset total: `docker compose down -v`.

### 1b. PostgreSQL yang sudah terpasang

```bash
psql -U postgres -c "CREATE USER lms WITH PASSWORD 'lms';"
psql -U postgres -c "CREATE DATABASE lms OWNER lms;"
psql -U postgres -c "CREATE DATABASE lms_test OWNER lms;"
```

## 2. Pasang dependensi & isi konfigurasi

```bash
unzip school-lms.zip && cd lms
npm install
```

Buat dua berkas konfigurasi (nilai di bawah cocok dengan Docker di atas):

```bash
# .env       → database data sungguhan
DATABASE_URL=postgres://lms:lms@localhost:5432/lms
SESSION_SECRET=ganti-dengan-teks-acak-minimal-32-karakter
NEXT_PUBLIC_BUILD_ID=dev

# .env.test  → database demo / tes (NAMA DB WAJIB MENGANDUNG "test")
DATABASE_URL=postgres://lms:lms@localhost:5432/lms_test
SESSION_SECRET=ganti-dengan-teks-acak-minimal-32-karakter
NEXT_PUBLIC_BUILD_ID=dev
```

> Membuat `SESSION_SECRET` acak: `openssl rand -base64 32` (atau `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"`).

## A. Mode demo (coba semua layar)

```bash
npm run demo:setup     # membuat tabel + mengisi data contoh di lms_test
npm run dev:demo       # http://localhost:3000
```

⚠️ `demo:setup` **menghapus seluruh isi `lms_test`** setiap dijalankan. Aman: skrip menolak bekerja bila nama database tidak mengandung "test".

**Akun demo**: semua berkata sandi `Passw0rd!`

| Nama pengguna | Peran | Catatan |
|---|---|---|
| `admin` | Admin | |
| `guru1` | Guru + Wali Kelas 7A | mengajar IPA |
| `guru2` | Guru | mengajar Matematika di 7A (bukan wali) |
| `siswa1` · `siswa2` · `siswa3` | Siswa | kelas 7A (NIS 1001–1003) |
| `ortu1` | Orang tua | anak: Siswa Satu & Siswa Dua (uji pengalih anak) |
| `kepsek` | Kepala Sekolah | |

Data contoh: tahun ajaran 2026/2027 (semester Ganjil aktif), kelas 7A, mapel IPA & Matematika, satu ujian IPA 5 soal yang sedang dibuka.

### Skenario uji manual (±15 menit)

Gunakan jendela *incognito* terpisah per peran agar bisa login bersamaan.

1. **Login & akses**: login `admin` → muncul Data Siswa. Coba buka `/kepsek` → otomatis dikembalikan ke halaman Admin. Salah sandi → pesan ramah (tanpa error teknis).
2. **Impor (Admin)** → *Impor Data*: unduh template *Siswa*, isi 3 baris (satu sengaja salah, mis. NIS kosong), unggah. Harus tampil "2 baris valid · 1 baris bermasalah". Klik *Mulai Impor* → unduh *daftar akun*. Impor ulang file yang sama → "0 data baru, 2 diperbarui".
3. **Data master (Admin)**: tambah/ubah/arsip Guru, Kelas, Mapel, Penugasan. Tombol *Ekspor Excel* di tiap tabel. Coba arsipkan kelas 7A → ditolak karena masih ada siswa.
4. **Presensi (`guru1`)**: *Presensi* → *Semua Hadir* → ubah satu siswa jadi Sakit → *Simpan Presensi* → muat ulang halaman: pilihan tetap. Ganti ke "Per mata pelajaran". Isi bulan lalu *Ekspor rekap bulanan*.
4b. **Bank soal & ujian (`guru1`)**: menu *Bank Soal* → buat bank (pilih "Ilmu Pengetahuan Alam — 7A") → *+ Tambah soal*: coba keempat tipe (pilihan ganda, kompleks, benar/salah, isian). Kosongkan kunci lalu simpan → muncul pesan "Pilih satu jawaban yang benar". Menu *Ujian (CBT)* → *+ Buat ujian* → pilih soal tadi → *Simpan sebagai draf* → *Terbitkan*. Setelah terbit, soal tersebut tidak bisa diubah/dihapus (tombol abu-abu 🔒). Login `siswa3`, kerjakan ujian baru itu, lalu kembali ke `guru1` → *Ujian (CBT)* → **Hasil**: lihat rekap, analisis butir soal, dan *Izinkan ulang*.
5. **Ujian offline (`siswa1`)**: *Mulai* ujian → jawab 1–2 soal → **muat ulang halaman** (jawaban & sisa waktu harus tetap). Jawab semua → di DevTools (F12) → *Network* → pilih **Offline** → *Selesai & Kumpulkan* → muncul "Jawaban Anda aman di perangkat ini". Kembalikan ke **Online** → otomatis terkirim, tampil nilai.
6. **Input nilai (`guru1` untuk IPA, `guru2` untuk Matematika)**: *Input Nilai* → isi Formatif & SAS semua siswa → *Kunci Nilai*. Setelah terkunci, kolom tidak bisa diedit.
7. **Wali Kelas (`guru1`)**: *Wali Kelas* → isi catatan, tambah ekstrakurikuler → *Kirim ke Kepala Sekolah*. (Pesan "belum siap" muncul bila nilai Matematika belum dikunci oleh `guru2`.) Tambahkan juga *Catatan Perkembangan*.
8. **Persetujuan (`kepsek`)**: dashboard menampilkan grafik rerata nilai. Di "Persetujuan e-Rapor" klik *Setujui semua*. Unggah gambar tanda tangan/stempel (PNG/JPG ≤150 KB) di bagian bawah.
9. **e-Rapor (`siswa1` / `ortu1`)**: klik *Unduh e-Rapor (PDF)* → PDF dibuat di browser, lengkap dengan kop sekolah dan stempel. Login `ortu1`: ganti anak lewat tab nama.
10. **ZIP massal (`admin`)**: *Semester & Rapor* → *Unduh ZIP* pada kelas 7A.
11. **Pengumuman & kalender**: `guru1`/`admin` menerbitkan pengumuman; `admin` menambah agenda kalender. Login `siswa1` untuk memeriksa tampil.
12. **Tutup semester (`admin`)**: *Semester & Rapor* → pilih semester berikutnya → *Tutup Semester*. Setelah itu coba ubah nilai/e-Rapor lewat layar mana pun → ditolak ("Semester ini sudah ditutup").

## B. Tes otomatis (Playwright)

```bash
npx playwright install chromium     # sekali saja (± 150 MB)
npm run test:update                 # SEKALI: membuat gambar acuan (snapshot) tampilan tabel
npm test                            # jalankan semua tes
npx playwright show-report          # lihat laporan HTML bila ada yang gagal
```

- Tes memakai `.env.test` (database `lms_test`) dan **menyeed ulang** database tiap kali dijalankan. Server dev dijalankan otomatis di port **3100**.
- Hanya satu tes tertentu: `npx playwright test tests/auth.spec.ts`
- Melihat browser saat tes jalan: `npx playwright test --headed`
- Debug langkah demi langkah: `npx playwright test --ui`

Isi tes: `exam-authoring.spec.ts` (tes API: guru menyusun soal → menerbitkan → siswa mengerjakan → hasil & izin ulang) · `unit.spec.ts` (penilaian ujian, narasi e-Rapor, validasi impor) · `auth.spec.ts` (login & hak akses) · `import.spec.ts` · `attendance.spec.ts` · `exam-offline.spec.ts` (refresh & offline) · `zz-visual.spec.ts` (tata letak tabel tidak berubah).

> **Status jujur:** `unit.spec.ts` (6 tes) dan `exam-authoring.spec.ts` (tes API, tanpa browser) sudah dijalankan terhadap aplikasi + PostgreSQL sungguhan dan lulus. Spesifikasi yang memakai browser ditulis dan diperiksa, tetapi **belum pernah dijalankan** di lingkungan pembuatnya (tidak ada browser). Pada run pertama di komputer Anda, kemungkinan ada selector/teks yang perlu disesuaikan; kirim hasil laporan agar saya perbaiki.

## C. Setup data sungguhan

```bash
npm run db:migrate      # menerapkan database/schema.sql + 002_extras.sql ke DB "lms"
npm run db:bootstrap    # membuat akun admin + tahun ajaran; kata sandi dicetak SEKALI
npm run dev             # atau: npm run build && npm start
```

Lalu login sebagai admin (akan diminta ganti kata sandi) dan ikuti urutan di `README.md`.

Alternatif tanpa Node untuk membuat tabel: `psql "$DATABASE_URL" -f database/full-setup.sql` (hanya untuk database **kosong**).

## Masalah umum

| Gejala | Penyebab / solusi |
|---|---|
| `ECONNREFUSED 127.0.0.1:5432` | PostgreSQL belum jalan. Docker: `docker compose up -d`. |
| `password authentication failed` | `DATABASE_URL` tidak cocok dengan user/sandi database. |
| `Seed menghapus SEMUA data. Gunakan database yang namanya mengandung "test"` | `.env.test` mengarah ke DB yang bukan `*test*`. Perbaiki nama DB (ini pengaman, jangan dimatikan). |
| `type "user_role" already exists` | `schema.sql` dijalankan dua kali manual. Pakai `npm run db:migrate` (mencatat versi) atau buat DB baru. |
| Port 3000/3100 terpakai | `npm run dev:demo -- -p 3300` |
| Login terus kembali ke `/login` | `SESSION_SECRET` kosong / berubah setelah login. Isi di `.env`/`.env.test`, restart server. |
| Setelah 8× salah sandi: "Terlalu banyak percobaan" | Pembatas login (10 menit). Restart server mereset (data hanya di memori). |
| Ingin mengosongkan demo | `npm run demo:setup` (hapus & seed ulang). |
| Playwright: "snapshot doesn't exist" | Jalankan `npm run test:update` sekali. |
| Windows: `--env-file` tidak dikenali | Pastikan Node ≥ 20.12 (`node -v`). |
