# School LMS: API & State Management Architecture

## 1. Shape of the system

```
Browser (Next.js App Router, client components, Tailwind)
 ├─ TanStack Query  → server-state cache (persisted to IndexedDB)
 ├─ Zustand         → UI state + active exam (persisted to localStorage)
 └─ @react-pdf      → e-Rapor PDFs rendered on the device
        │  HTTPS (JSON)
Next.js Route Handlers (/api/*)  ← one deployable, no separate backend
        │  postgres.js, pooled (PgBouncer, transaction mode)
Managed PostgreSQL (daily backups + PITR)
```

One deployable (Vercel / Cloud Run / any container host) plus one managed Postgres means nothing for the school to operate. Migrations run in the deploy pipeline (`drizzle-kit migrate` or `node-pg-migrate`). There are no cron jobs, queues or workers. Expired exam sessions need no sweeper because the server's `deadline_at` is checked at submit time.

## 2. Handling 400 simultaneous exam takers

| Moment | DB work per student | Total at 400 students |
|---|---|---|
| Start (burst) | 1 upsert on `exam_sessions`; the question paper is read once and memoised in-process for 5 min | about 400 tiny writes |
| During exam | **none** (answers and timer live in the browser) | 0 |
| Submit (burst) | 1 transaction: `SELECT … FOR UPDATE`, 1 key read, 1 `UPDATE` | about 400 short transactions |

- With a pool of 10 connections and about 10 ms per transaction, a 400-student burst clears in a few seconds.
- The auto-submit at timer zero adds **0–3 s random jitter** so 400 clients don't hit the server in the same millisecond.
- Submit is **idempotent**: a repeated POST returns the stored result, so retries after a network drop are safe.
- **Answer keys never leave the server.** They sit in `question_keys`, and grading happens in the submit handler.
- **Timer integrity.** The server sets `deadline_at`. The client stores the server/client clock offset, so a refresh or an offline period can't extend the exam. Late submissions (deadline plus 120 s grace) are still stored and graded but flagged `is_late` for teacher review, so a student on a bad connection never loses their work.

## 3. RBAC

| Capability | Admin | Guru Mapel | Wali Kelas* | Siswa | Orang Tua | Kepsek |
|---|:-:|:-:|:-:|:-:|:-:|:-:|
| Master data, import/export, close semester, bulk ZIP | ✔ | | | | | |
| Attendance marking | ✔ | ✔ | ✔ | | | |
| Question bank / exams / materials / assignments (own classes) | | ✔ | ✔ | | | |
| Take exam, submit assignment URL | | | | ✔ | | |
| Input SAS, **lock grades** (own assignments) | | ✔ | ✔ | | | |
| Homeroom notes, extracurricular, promotion decision | | | ✔ | | | |
| Approve e-Rapor, school analytics | | | | | | ✔ |
| View own / children's approved e-Rapor and attendance | | | | ✔ | ✔ | |

\*Wali Kelas is a **teacher with `classes.homeroom_teacher_id = teacher.id`**, not a separate login role. Every handler calls `requireRole(...)` and then checks **ownership** (the teaching assignment, class, or child link) in SQL.

## 4. API surface (Route Handlers)

| Method & path | Role | Notes |
|---|---|---|
| `POST /api/auth/login`, `POST /api/auth/logout` | all | httpOnly JWT cookie (`jose`); logout also clears the IndexedDB cache |
| `GET/POST/PATCH /api/{students,teachers,classes,subjects}` | admin | cursor pagination; `DELETE` = soft delete |
| `POST /api/import/:entity` | admin | parsed client-side (SheetJS), sent as validated JSON chunks of ≤500 rows, upserted in one transaction |
| `POST /api/admin/promote` | admin | calls `promote_students()` |
| `POST /api/admin/semester/close` | admin | calls `close_semester_and_open_next()` |
| `PUT /api/attendance/daily` | admin, guru | bulk `INSERT … ON CONFLICT DO UPDATE` |
| `GET /api/attendance/monthly?classId&month` | admin, guru | `attendance_range()`; CSV built client-side |
| `POST /api/exams/:id/start` | siswa | create or resume a session; returns the paper **without keys** |
| `POST /api/exams/:id/submit` | siswa | single payload, idempotent, graded server-side |
| `GET /api/exams/:id/results` | guru | scores, late flags |
| `GET/POST /api/{materials,assignments}` | guru, siswa | URLs only (`https?://` CHECK constraint) |
| `GET /api/children` | orang_tua | feeds the multi-child switcher |
| `POST /api/grades/lock` | guru | computes final score, predicate, narrative; sets `locked_at` |
| `POST /api/reports/approve` | kepsek | freezes `snapshot` JSON for a class |
| `GET /api/reports/:id` | siswa, ortu, staff | approved snapshot only for siswa/ortu |
| `GET /api/reports/bulk?classId&semesterId` | admin, kepsek, wali | all approved snapshots for ZIP generation |

Every handler is wrapped in `handle()` (`lib/api.ts`), which maps `ApiError`, validation errors and database `RAISE` codes to friendly Indonesian messages. Raw SQL and stack traces are never returned.

## 5. Client state: three layers, three jobs

1. **TanStack Query (server cache).** Provider config:

```tsx
const qc = new QueryClient({
  defaultOptions: { queries: {
    staleTime: 5 * 60_000,          // 5 min: tab switches render from cache instantly
    gcTime: 24 * 60 * 60_000,
    refetchOnWindowFocus: false,
    retry: 1,
    placeholderData: keepPreviousData,   // never blank while revalidating
  } },
});

<PersistQueryClientProvider client={qc} persistOptions={{
  persister: createAsyncStoragePersister({ storage: idbStorage }),  // idb-keyval wrapper
  maxAge: 24 * 60 * 60_000,
  buster: process.env.NEXT_PUBLIC_BUILD_ID,                          // new deploy → clean cache
  dehydrateOptions: { shouldDehydrateQuery: q => q.queryKey[0] !== 'exam' },
}}>
```

   Query keys follow `[entity, scope, params]`, e.g. `['attendance', classId, month]`.
2. **Prefetching.** Right after login, `prefetchQuery` runs for the role's top-level tabs (guru: classes, today's attendance; ortu: children, latest rapor). Nav links prefetch on `onMouseEnter`/`onTouchStart` and use `<Link prefetch>` for route chunks. The PDF chunk is prefetched when the download button is hovered.
3. **Zustand.** UI state (selected child, sidebar, filters) plus the **active exam store** (§6).

**Optimistic UI.** Attendance toggles, announcements, and assignment submissions use `useMutation` with `onMutate` (write to cache), `onError` (rollback and toast), `onSettled` (`invalidateQueries`).

**Honest note on "<50 ms, no spinners".** This holds for anything already cached or prefetched, which covers every tab after login. A brand-new, never-visited query on a slow network still needs a round trip. The design hides it with `keepPreviousData` and skeleton-free cached renders, but physics still applies.

## 6. Exam state (offline-first)

`useExamStore` (Zustand + `persist` → `localStorage`, 250 ms debounced writes, flushed on `pagehide`) holds `sessionId`, `deadlineAt`, `clockOffset`, the paper, `answers`, `flagged`, `current` and `phase`.

```
idle → running → sending → done
                    ↓ (offline / 5xx / timeout)
                  queued ──(online event or 15 s retry)──→ sending
```

- Refresh, crash or Wi-Fi drop: the runner rehydrates from localStorage and keeps counting down locally. It re-calls `/start` in the background (idempotent) only to refresh the clock offset.
- Question and option shuffling uses a **seeded PRNG keyed by `sessionId`**, so the order is stable across refreshes.
- On a shared school computer the store is wiped when the phase reaches `done` or a different student starts.

## 7. e-Rapor cycle

```
Guru:   input SAS + TP scores ─► POST /grades/lock   (final score, predicate, narrative; locked_at set)
Wali:   notes, ekskul, attendance summary, promotion ─► report_cards.status = 'submitted'
Kepsek: POST /reports/approve   (blocked unless ALL class grades are locked)
        └─ freezes report_cards.snapshot (JSONB), stamps approved_at/approved_by
Admin:  close_semester_and_open_next()   (blocked unless ALL reports approved)
Anyone: PDF rendered in the browser from the frozen snapshot (zero server load)
```

Because the PDF renders from `snapshot`, an archived rapor reprints identically years later, even if subjects or names change in master data. Closed semesters are read-only through the DB triggers, not just the UI.

## 8. UI consistency rules, enforced in code

- Every table is defined once as a **column-config module** (`columns/students.ts` etc.) and rendered by one shared `<DataTable>`. Layout changes require editing that file, which makes them visible in review.
- Playwright **visual snapshot tests** on each table and the PDF's first page run in CI.
- User-facing errors come only from the `PG_MESSAGES` and `ApiError` maps.

## 9. Dependencies

`next react zustand @tanstack/react-query @tanstack/react-query-persist-client @tanstack/query-async-storage-persister idb-keyval postgres zod jose @react-pdf/renderer jszip xlsx tailwindcss`
