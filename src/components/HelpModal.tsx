'use client';
import { useState } from 'react';
import { useMe } from '@/lib/hooks';

export default function HelpModal() {
  const [open, setOpen] = useState(false);
  const { data: me } = useMe();
  const role = me?.role;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-slate-100 w-full text-left"
      >
        <span>💡</span>
        <span>Panduan & Bantuan</span>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-2xl max-h-[85vh] flex flex-col rounded-xl bg-white shadow-xl">
            {/* Header */}
            <div className="flex items-center justify-between border-b px-5 py-4">
              <div className="flex items-center gap-2">
                <span className="text-xl">💡</span>
                <h2 className="text-lg font-bold text-slate-900">
                  Panduan Aplikasi ({role ? role.replace('_', ' ').toUpperCase() : 'PENGGUNA'})
                </h2>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            {/* Content per role */}
            <div className="p-5 overflow-y-auto space-y-4 text-sm text-slate-700">
              {role === 'admin' && (
                <div className="space-y-3">
                  <div className="rounded-lg bg-blue-50 p-3 text-blue-900 text-xs">
                    <b>Peran Admin:</b> Mengelola seluruh data master sekolah, jadwal pelajaran, pembagian akun, dan siklus tahun ajaran/semester.
                  </div>
                  <ol className="list-decimal pl-5 space-y-2">
                    <li>
                      <b>Setup Profil Sekolah:</b> Buka menu <i>Profil Sekolah</i> untuk melengkapi Nama Sekolah, Alamat, serta Tanda Tangan & Stempel digital Kepala Sekolah (format PNG/JPG).
                    </li>
                    <li>
                      <b>Impor Data Master:</b> Buka menu <i>Impor Data</i>. Lakukan secara berurutan:
                      <ul className="list-disc pl-4 mt-1 text-xs text-slate-600">
                        <li>1. Guru (termasuk NIP & username)</li>
                        <li>2. Kelas (pilih wali kelas)</li>
                        <li>3. Siswa (otomatis membuat akun login jika dicentang)</li>
                        <li>4. Mata Pelajaran</li>
                        <li>5. Penugasan Guru (menghubungkan guru ke mapel & kelas)</li>
                      </ul>
                    </li>
                    <li>
                      <b>Jadwal Pelajaran:</b> Masuk ke menu <i>Jadwal Pelajaran</i> untuk mengatur jam mengajar. Sistem otomatis mendeteksi jika terjadi bentrok guru atau ruang.
                    </li>
                    <li>
                      <b>Laporan & Kartu Ujian:</b> Gunakan menu <i>Laporan & Cetak</i> untuk mengunduh legger nilai kelas, cetak lembar absensi kosong, atau cetak kartu login siswa.
                    </li>
                    <li>
                      <b>Kenaikan Kelas & Tutup Semester:</b> Di akhir semester genap, buka <i>Semester & Rapor</i> untuk memproses kenaikan kelas, lalu klik <i>Tutup Semester</i> setelah seluruh rapor disetujui.
                    </li>
                  </ol>
                </div>
              )}

              {role === 'guru' && (
                <div className="space-y-3">
                  <div className="rounded-lg bg-emerald-50 p-3 text-emerald-900 text-xs">
                    <b>Peran Guru:</b> Melakukan presensi, membagikan materi, memberi tugas, menyelenggarakan ujian CBT, dan menginput nilai rapor.
                  </div>
                  <ol className="list-decimal pl-5 space-y-2">
                    <li>
                      <b>Presensi Harian:</b> Buka menu <i>Presensi</i> setiap hari. Anda bisa klik <i>Semua Hadir</i> lalu menandai siswa yang Sakit, Izin, atau Alpa. Orang tua siswa otomatis menerima notifikasi bila anaknya alpa/sakit.
                    </li>
                    <li>
                      <b>Materi & Tugas:</b> Buka menu <i>Materi & Tugas</i>. Anda dapat membagikan link bahan ajar (Google Drive / YouTube) dan membuat tugas dengan tenggat waktu. Jawaban siswa dapat dinilai langsung dengan komentar umpan balik.
                    </li>
                    <li>
                      <b>Ujian Online (CBT):</b> Buat soal di <i>Bank Soal</i>, lalu terbitkan jadwal di menu <i>Ujian (CBT)</i>. Nilai ujian pilihan ganda dan isian dinilai otomatis oleh server.
                    </li>
                    <li>
                      <b>Input Nilai & Kunci Nilai:</b> Pada akhir semester, buka menu <i>Input Nilai</i>. Isi nilai Formatif & SAS, lalu klik <b>Kunci Nilai</b>. Nilai akhir, predikat, dan narasi Kurikulum Merdeka akan otomatis digenerate.
                    </li>
                    <li>
                      <b>Wali Kelas (Jika ditugaskan):</b> Masuk ke menu <i>Wali Kelas</i> untuk mengisi catatan perkembangan, ekstrakurikuler, dan keputusan kenaikan kelas, lalu klik <i>Kirim ke Kepala Sekolah</i>.
                    </li>
                  </ol>
                </div>
              )}

              {role === 'siswa' && (
                <div className="space-y-3">
                  <div className="rounded-lg bg-indigo-50 p-3 text-indigo-900 text-xs">
                    <b>Peran Siswa:</b> Mengakses jadwal, materi belajar, mengerjakan tugas, mengikuti ujian CBT, dan melihat nilai e-Rapor.
                  </div>
                  <ol className="list-decimal pl-5 space-y-2">
                    <li>
                      <b>Ujian CBT Online:</b> Di tab <i>Ujian (CBT)</i>, klik <i>Mulai Ujian</i> saat jam ujian telah dibuka. Jika koneksi terputus saat mengerjakan, jangan panik: jawaban Anda tersimpan aman di perangkat dan akan terkirim otomatis saat internet pulih.
                    </li>
                    <li>
                      <b>Tugas Sekolah:</b> Buka tab <i>Tugas</i> untuk melihat tugas aktif. Klik <i>Kumpulkan Tugas</i> lalu masukkan tautan pengerjaan Anda (Google Docs/Drive/YouTube).
                    </li>
                    <li>
                      <b>Materi Pembelajaran:</b> Buka tab <i>Materi</i> untuk membuka modul, materi bacaan, atau rekaman video yang dibagikan oleh guru mata pelajaran.
                    </li>
                    <li>
                      <b>e-Rapor:</b> Klik tab <i>e-Rapor</i> untuk mengunduh dokumen laporan hasil belajar resmi berformat PDF yang telah disetujui Kepala Sekolah.
                    </li>
                  </ol>
                </div>
              )}

              {role === 'orang_tua' && (
                <div className="space-y-3">
                  <div className="rounded-lg bg-amber-50 p-3 text-amber-900 text-xs">
                    <b>Peran Orang Tua:</b> Memantau kehadiran, nilai harian, tugas, dan mengunduh e-Rapor ananda.
                  </div>
                  <ol className="list-decimal pl-5 space-y-2">
                    <li>
                      <b>Pemilihan Anak:</b> Jika Anda memiliki lebih dari 1 anak yang bersekolah di sini, gunakan tombol tab nama anak di bagian atas untuk beralih.
                    </li>
                    <li>
                      <b>Kehadiran Ananda:</b> Tab <i>Kehadiran</i> menampilkan persentase serta rekap Hadir, Sakit, Izin, dan Alpa lengkap dengan log tanggal presensi harian.
                    </li>
                    <li>
                      <b>Nilai & Ujian:</b> Tab <i>Nilai & Ujian</i> menyajikan capaian nilai formatif, sumatif akhir semester (SAS), serta riwayat skor ujian online ananda.
                    </li>
                    <li>
                      <b>Tugas Sekolah:</b> Tab <i>Tugas</i> memuat daftar tugas dan status pengerjaan ananda beserta catatan umpan balik dari bapak/ibu guru.
                    </li>
                    <li>
                      <b>e-Rapor & Catatan:</b> Unduh lembar e-Rapor resmi PDF dan baca catatan perkembangan karakter/sikap yang dituliskan oleh guru.
                    </li>
                  </ol>
                </div>
              )}

              {role === 'kepala_sekolah' && (
                <div className="space-y-3">
                  <div className="rounded-lg bg-purple-50 p-3 text-purple-900 text-xs">
                    <b>Peran Kepala Sekolah:</b> Memantau mutu akademik sekolah dan menyetujui penerbitan e-Rapor resmi.
                  </div>
                  <ol className="list-decimal pl-5 space-y-2">
                    <li>
                      <b>Dashboard Analytics & KPI:</b> Menampilkan rerata nilai sekolah, tingkat kehadiran, serta grafik sebaran predikat dan rerata nilai per mapel.
                    </li>
                    <li>
                      <b>Persetujuan e-Rapor:</b> Klik <i>Setujui Semua</i> pada kelas yang telah siap. Tindakan ini membekukan seluruh data rapor menjadi arsip permanen dan membubuhkan stempel digital Anda.
                    </li>
                    <li>
                      <b>Unduh Arsip Massal (ZIP):</b> Klik tombol <i>Unduh ZIP</i> per kelas untuk menyimpan seluruh berkas PDF e-Rapor siswa kelas tersebut ke komputer Anda dalam satu paket kompresi.
                    </li>
                  </ol>
                </div>
              )}

              <div className="rounded-lg border border-slate-200 p-3 text-xs text-slate-500 bg-slate-50">
                <b>Punya kendala atau lupa kata sandi?</b> Hubungi staf Tata Usaha / Admin sekolah untuk bantuan lebih lanjut.
              </div>
            </div>

            {/* Footer */}
            <div className="border-t px-5 py-3 flex justify-end">
              <button className="btn btn-primary" onClick={() => setOpen(false)}>
                Saya Mengerti
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
