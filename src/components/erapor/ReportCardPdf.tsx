import { Document, Page, Text, View, Image, StyleSheet } from '@react-pdf/renderer';

// ---------- types (match the JSON built in /api/reports/approve) ----------
export interface ReportSnapshot {
  student: { name: string; nis: string; nisn?: string | null };
  class: { name: string; grade_level: number; jenjang: 'TK' | 'SD' | 'SMP' };
  semester: { kind: 'ganjil' | 'genap'; year: string };
  grades: { subject: string; score: number | null; predicate: string | null; narrative: string | null; kkm: number }[];
  attendance: { hadir: number; izin: number; sakit: number; alpa: number };
  extracurriculars: { name: string; grade: string; description?: string }[];
  homeroom_notes: string | null;
  promotion_status: 'naik' | 'tinggal' | 'lulus' | 'pindah' | null;
  homeroom_teacher: string | null;
  approved_at?: string;
}
export interface UnitSchoolProfile {
  name?: string | null;
  npsn?: string | null;
  address?: string | null;
  principalName?: string | null;
  principalNip?: string | null;
  stampDataUrl?: string | null;
}

export interface SchoolProfile {
  name: string;
  address: string;
  principalName: string;
  principalNip?: string | null;
  stampDataUrl?: string | null; // PNG data URL of signature/stamp (embed as data: URI; no network fetch)
  units?: Partial<Record<'TK' | 'SD' | 'SMP', UnitSchoolProfile>>;
}

// ---------- styles: DO NOT change column widths once released (layout contract) ----------
const COL = { no: 24, subject: 120, score: 40, pred: 40 };
const s = StyleSheet.create({
  page: { paddingTop: 36, paddingBottom: 56, paddingHorizontal: 36, fontSize: 10, fontFamily: 'Helvetica', color: '#111827' },
  head: { alignItems: 'center', borderBottomWidth: 1.5, borderBottomColor: '#111827', paddingBottom: 8, marginBottom: 10 },
  school: { fontSize: 14, fontFamily: 'Helvetica-Bold' },
  addr: { fontSize: 8.5, color: '#4b5563', marginTop: 2 },
  title: { fontSize: 12, fontFamily: 'Helvetica-Bold', textAlign: 'center', marginBottom: 8 },
  idRow: { flexDirection: 'row', marginBottom: 2 },
  idCol: { flex: 1 },
  idLabel: { width: 70, color: '#4b5563' },
  h2: { fontFamily: 'Helvetica-Bold', fontSize: 10.5, marginTop: 12, marginBottom: 4 },
  tHead: { flexDirection: 'row', backgroundColor: '#e5e7eb', borderWidth: 0.7, borderColor: '#9ca3af' },
  tRow: { flexDirection: 'row', borderLeftWidth: 0.7, borderRightWidth: 0.7, borderBottomWidth: 0.7, borderColor: '#9ca3af' },
  cell: { padding: 4, borderRightWidth: 0.7, borderRightColor: '#9ca3af' },
  cellLast: { padding: 4 },
  bold: { fontFamily: 'Helvetica-Bold' },
  box: { borderWidth: 0.7, borderColor: '#9ca3af', padding: 6, minHeight: 36 },
  sigRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 22 },
  sig: { width: '30%', alignItems: 'center' },
  sigSpace: { height: 54, justifyContent: 'center', alignItems: 'center' },
  stamp: { width: 54, height: 54, objectFit: 'contain' },
  watermark: { position: 'absolute', top: 330, left: 70, opacity: 0.06, transform: 'rotate(-30deg)' },
  footer: { position: 'absolute', bottom: 24, left: 36, right: 36, flexDirection: 'row', justifyContent: 'space-between', fontSize: 8, color: '#6b7280' },
});

const PROMO: Record<string, (lvl: number, j: string) => string> = {
  naik: () => 'Naik ke kelas berikutnya',
  tinggal: (l) => `Tinggal di kelas ${l}`,
  lulus: () => 'LULUS',
  pindah: () => 'Pindah sekolah',
};

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={s.idRow}>
      <Text style={s.idLabel}>{label}</Text>
      <Text>: {value}</Text>
    </View>
  );
}

export function ReportCardPdf({ data, school }: { data: ReportSnapshot; school: SchoolProfile }) {
  const semLabel = `${data.semester.kind === 'ganjil' ? 'Ganjil' : 'Genap'} · ${data.semester.year}`;
  const showPromotion = data.semester.kind === 'genap' && data.promotion_status;
  const unit = school.units?.[data.class.jenjang];
  const schoolName = unit?.name || school.name;
  const schoolAddress = unit?.address || school.address;
  const principalName = unit?.principalName || school.principalName;
  const principalNip = unit?.principalNip !== undefined && unit?.principalNip !== null ? unit.principalNip : school.principalNip;
  const stampDataUrl = unit?.stampDataUrl || school.stampDataUrl;

  return (
    <Document title={`e-Rapor ${data.student.name}`} author={schoolName}>
      <Page size="A4" style={s.page} wrap>
        {/* watermark on every page */}
        <View fixed style={s.watermark}>
          <Text style={{ fontSize: 70, fontFamily: 'Helvetica-Bold' }}>E-RAPOR RESMI</Text>
        </View>

        <View style={s.head}>
          <Text style={s.school}>{schoolName}</Text>
          <Text style={s.addr}>
            {schoolAddress}
            {unit?.npsn ? ` · NPSN: ${unit.npsn}` : ''}
          </Text>
        </View>
        <Text style={s.title}>LAPORAN HASIL BELAJAR (RAPOR) — JENJANG {data.class.jenjang}</Text>

        <View style={{ flexDirection: 'row' }}>
          <View style={s.idCol}>
            <Row label="Nama" value={data.student.name} />
            <Row label="NIS / NISN" value={`${data.student.nis}${data.student.nisn ? ' / ' + data.student.nisn : ''}`} />
          </View>
          <View style={s.idCol}>
            <Row label="Kelas" value={`${data.class.name} (${data.class.jenjang})`} />
            <Row label="Semester" value={semLabel} />
          </View>
        </View>

        {/* ---- Capaian kompetensi ---- */}
        <Text style={s.h2}>A. Capaian Pembelajaran</Text>
        <View style={s.tHead} fixed>
          <Text style={[s.cell, s.bold, { width: COL.no }]}>No</Text>
          <Text style={[s.cell, s.bold, { width: COL.subject }]}>Mata Pelajaran</Text>
          <Text style={[s.cell, s.bold, { width: COL.score }]}>Nilai</Text>
          <Text style={[s.cell, s.bold, { width: COL.pred }]}>Pred.</Text>
          <Text style={[s.cellLast, s.bold, { flex: 1 }]}>Capaian Kompetensi</Text>
        </View>
        {data.grades.map((g, i) => (
          <View key={i} style={s.tRow} wrap={false}>
            <Text style={[s.cell, { width: COL.no }]}>{i + 1}</Text>
            <Text style={[s.cell, { width: COL.subject }]}>{g.subject}</Text>
            <Text style={[s.cell, { width: COL.score }]}>{g.score != null ? Math.round(g.score) : '-'}</Text>
            <Text style={[s.cell, { width: COL.pred }]}>{g.predicate ?? '-'}</Text>
            <Text style={[s.cellLast, { flex: 1 }]}>{g.narrative ?? ''}</Text>
          </View>
        ))}

        {/* ---- Ekstrakurikuler ---- */}
        <Text style={s.h2}>B. Ekstrakurikuler</Text>
        {data.extracurriculars.length === 0 ? (
          <View style={s.box}><Text>-</Text></View>
        ) : (
          <>
            <View style={s.tHead}>
              <Text style={[s.cell, s.bold, { width: 150 }]}>Kegiatan</Text>
              <Text style={[s.cell, s.bold, { width: 40 }]}>Nilai</Text>
              <Text style={[s.cellLast, s.bold, { flex: 1 }]}>Keterangan</Text>
            </View>
            {data.extracurriculars.map((e, i) => (
              <View key={i} style={s.tRow} wrap={false}>
                <Text style={[s.cell, { width: 150 }]}>{e.name}</Text>
                <Text style={[s.cell, { width: 40 }]}>{e.grade}</Text>
                <Text style={[s.cellLast, { flex: 1 }]}>{e.description ?? ''}</Text>
              </View>
            ))}
          </>
        )}

        {/* ---- Kehadiran ---- */}
        <Text style={s.h2}>C. Ketidakhadiran</Text>
        <View style={s.box} wrap={false}>
          <Text>Sakit: {data.attendance.sakit} hari     Izin: {data.attendance.izin} hari     Tanpa keterangan: {data.attendance.alpa} hari</Text>
        </View>

        {/* ---- Catatan wali kelas ---- */}
        <Text style={s.h2}>D. Catatan Wali Kelas</Text>
        <View style={s.box} wrap={false}>
          <Text>{data.homeroom_notes || '-'}</Text>
        </View>

        {showPromotion && (
          <View style={[s.box, { marginTop: 8 }]} wrap={false}>
            <Text style={s.bold}>
              Keputusan: {PROMO[data.promotion_status!](data.class.grade_level, data.class.jenjang)}
            </Text>
          </View>
        )}

        {/* ---- Signatures (kept together on one page) ---- */}
        <View style={s.sigRow} wrap={false}>
          <View style={s.sig}>
            <Text>Orang Tua / Wali</Text>
            <View style={s.sigSpace} />
            <Text>(................................)</Text>
          </View>
          <View style={s.sig}>
            <Text>Wali Kelas</Text>
            <View style={s.sigSpace} />
            <Text style={s.bold}>{data.homeroom_teacher ?? '................................'}</Text>
          </View>
          <View style={s.sig}>
            <Text>Kepala Sekolah {data.class.jenjang}</Text>
            <View style={s.sigSpace}>
              {stampDataUrl ? <Image src={stampDataUrl} style={s.stamp} /> : null}
            </View>
            <Text style={s.bold}>{principalName}</Text>
            {principalNip ? <Text style={{ fontSize: 8 }}>NIP. {principalNip}</Text> : null}
          </View>
        </View>

        <View fixed style={s.footer}>
          <Text>{data.student.name} · {data.class.name} · {semLabel}</Text>
          <Text render={({ pageNumber, totalPages }) => `Halaman ${pageNumber} / ${totalPages}`} />
        </View>
      </Page>
    </Document>
  );
}
