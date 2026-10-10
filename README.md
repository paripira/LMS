# Sistem Informasi Sekolah (LMS · CBT · e-Rapor)

Next.js 15 (App Router) + PostgreSQL. Satu aplikasi, tanpa worker/cron: cukup hosting + Postgres terkelola.

> **Baru pertama kali di laptop?** Ikuti **[SETUP-LAPTOP.md](SETUP-LAPTOP.md)** (dari nol, Windows/macOS).
> **Ingin langsung mencoba?** Lihat **[LOCAL-TESTING.md](LOCAL-TESTING.md)**: mode demo dengan data contoh, skenario uji manual per peran, dan tes otomatis.
> Berkas database: `database/schema.sql` + `database/002_extras.sql` (atau gabungan `database/full-setup.sql`).

## Mulai cepat

```bash
npm install
cp .env.example .env            # isi DATABASE_URL & SESSION_SECRET (openssl rand -base64 32)
npm run db:migrate              # menerapkan database/schema.sql + 002_extras.sql
npm run db:bootstrap            # membuat akun admin + tahun ajaran; kata sandi dicetak SEKALI
npm run dev
```

Urutan setup di sekolah (semua lewat layar Admin):
1. **Profil Sekolah** → nama, alamat, Kepala Sekolah.
2. **Impor Data** → Guru → Kelas → Siswa (urutan ini; template tersedia di layar).
3. **Mata Pelajaran** & **Penugasan Guru** (siapa mengajar apa di kelas mana).
4. Bagikan daftar akun hasil impor (kata sandi awal wajib diganti saat login pertama).

## Alur e-Rapor per semester

Guru: **Input Nilai** → *Kunci Nilai* (nilai akhir, predikat, narasi dibuat otomatis) →
Wali Kelas: catatan, ekskul, (genap: keputusan naik/tinggal/lulus) → *Kirim ke Kepala Sekolah* →
Kepala Sekolah: *Setujui semua* (e-Rapor dibekukan + stempel) →
Admin: *Unduh ZIP* per kelas, lalu **Semester & Rapor** → Kenaikan kelas → Tutup semester.

Siswa/orang tua mengunduh PDF langsung dari browser (tanpa beban server).

## Tes

```bash
createdb lms_test
cp .env.example .env.test       # DATABASE_URL harus mengarah ke DB berisi kata "test"
npx playwright install chromium
npm run test:update             # sekali: membuat baseline snapshot visual
npm test
```

Seed (`scripts/seed.ts`) **menghapus semua data** dan menolak berjalan di DB yang namanya tidak mengandung "test".
Akun demo (kata sandi `Passw0rd!`): `admin`, `guru1` (wali 7A), `guru2`, `siswa1`–`siswa3`, `ortu1`, `kepsek`.

## Catatan produksi

- Set `NEXT_PUBLIC_BUILD_ID` ke commit SHA setiap deploy agar cache browser lama dibuang otomatis.
- Gunakan koneksi pooled (PgBouncer, mode transaksi); klien sudah memakai `prepare: false`.
- Batas percobaan login bersifat per-instance (memori). Untuk multi-instance, pindahkan ke Redis/tabel DB.
- Aktifkan backup harian + PITR di Postgres terkelola. Tidak ada data yang dihapus permanen (trigger memblokir `DELETE`).

## Belum ada

Hasil ujian sudah ada, tetapi: materi & tugas (UI), input nilai per Tujuan Pembelajaran (TP),
tombol buka-kunci nilai oleh Admin, reset akun orang tua dari layar, perpanjangan waktu ujian lewat layar
(API `adjust` sudah ada), dan tes browser Playwright yang belum pernah dijalankan di lingkungan pembuat.
