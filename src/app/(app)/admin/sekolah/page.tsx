import SchoolForm from '@/components/SchoolForm';

export default function SchoolPage() {
  return (
    <div className="w-full space-y-4">
      <div className="teramia-banner p-4 sm:p-5">
        <h1 className="text-lg sm:text-xl font-extrabold text-white">Profil Sekolah</h1>
        <p className="text-xs text-slate-200 mt-0.5">Dipakai pada kop e-Rapor. Tanda tangan/stempel Kepala Sekolah dicetak pada setiap e-Rapor yang disetujui.</p>
      </div>
      <SchoolForm />
    </div>
  );
}
