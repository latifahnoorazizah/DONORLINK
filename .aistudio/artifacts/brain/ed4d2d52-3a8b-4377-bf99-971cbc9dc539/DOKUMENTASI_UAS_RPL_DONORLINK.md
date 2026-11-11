# DOKUMENTASI REKAYASA PERANGKAT LUNAK (UAS RPL)
## SISTEM INFORMASI & KOORDINASI DONOR DARAH SUKARELA KOTA & KABUPATEN CIREBON
### PLATFORM: DONORLINK

---

## 1. IDENTITAS PROYEK & LATAR BELAKANG STUDI KASUS

| Parameter | Informasi Proyek |
| :--- | :--- |
| **Nama Aplikasi** | **DONORLINK** (*Menghubungkan Kebaikan, Menyelamatkan Kehidupan*) |
| **Kategori Mata Kuliah** | Rekayasa Perangkat Lunak (RPL) — Ujian Akhir Semester |
| **Wilayah Operasional** | **Kota Cirebon** dan **Kabupaten Cirebon**, Jawa Barat |
| **Super Administrator** | **Latifah Noor Azizah** (`latifahnoorazizah7@gmail.com`) |
| **Identitas Visual Resmi** | Logo Tetesan Darah dengan Ornamen Khas Cirebon **Batik Mega Mendung** |
| **Tautan Publik (Production)** | `https://ais-pre-bjkyu4ftr2ov7hu2xzymdx-758253768503.asia-east1.run.app` |
| **Tautan Development** | `https://ais-dev-bjkyu4ftr2ov7hu2xzymdx-758253768503.asia-east1.run.app` |
| **Arsitektur Eksekusi** | Full-Stack Node.js (Express + Vite + React 19 + TypeScript) pada Port 3000 |

### 1.1. Latar Belakang Masalah
Kebutuhan darah di wilayah Cirebon (mencakup rujukan RSUD Gunung Jati, RS Mitra Plumbon, RS Sumber Kasih, RS Ciremai, serta UTD PMI Kota dan Kabupaten Cirebon) seringkali menghadapi tantangan kritis:
1. **Penyebaran Informasi Darurat yang Tidak Terstruktur**: Keluarga pasien kerap menyebarkan pesan berantai (broadcast) di WhatsApp/media sosial yang tidak tervalidasi, nomor kontak sering kedaluwarsa, atau kebutuhan darah telah terpenuhi namun pesan terus beredar.
2. **Ketiadaan Verifikasi Medis Awal**: Broadcast darurat sering tidak menyertakan verifikasi formulir permintaan transfusi resmi dari Bank Darah Rumah Sakit (BDRS), memicu risiko calo atau penipuan.
3. **Pemisahan Jalur Layanan Donor**: Banyak pendonor sukarela tidak mengetahui perbedaan antara *Donor Rutin Terjadwal di PMI* dengan *Donor Pengganti Darurat untuk Pasien Tertentu di RS*, sehingga alur kedatangan relawan menjadi tidak efisien.
4. **Privasi & Keamanan Data (UU PDP No. 27/2022)**: Nomor telepon pendonor dan keluarga pasien sering terekspos secara terbuka di ruang publik, menimbulkan risiko pelecehan dan penyalahgunaan data.

### 1.2. Solusi & Batasan Platform DONORLINK
DONORLINK hadir sebagai platform web koordinasi internal terintegrasi antar-aktor resmi di wilayah Cirebon.
- **Batasan Medis**: DONORLINK tidak menyimpan darah fisik, tidak memungut biaya, dan tidak menggantikan uji skrining laboratorium (HIV, Hepatitis, Sifilis) yang menjadi wewenang mutlak UTD PMI dan BDRS Rumah Sakit.
- **Batasan Institusional**: DONORLINK mengimplementasikan integrasi koordinasi internal antarakun pengguna (BDRS RS, UTD PMI, Relawan, Pasien) dalam platform terpusat, tanpa mengklaim integrasi API tertutup sepihak dari pihak eksternal.

---

## 2. SOFTWARE REQUIREMENTS SPECIFICATION (SRS)

### 2.1. Kebutuhan Fungsional (Functional Requirements)

| Kode | Nama Fitur | Deskripsi Kebutuhan Sistem |
| :--- | :--- | :--- |
| **FR-01** | Registrasi Publik Terbuka | Sistem menyediakan formulir registrasi publik untuk Masyarakat (Pendonor & Pencari) serta Fasilitas Kesehatan (Rumah Sakit BDRS & UTD PMI). |
| **FR-02** | Otentikasi & Keamanan Kredensial | Password di-hash menggunakan PBKDF2 (16-byte cryptographically secure salt, 10.000 iterasi). Sesi diamankan dengan token HMAC-SHA256. |
| **FR-03** | Verifikasi Faskes oleh Super Admin | Akun RS dan PMI yang mendaftar berstatus `PENDING_VERIFICATION` dan wajib disetujui oleh Super Admin (`latifahnoorazizah7@gmail.com`) sebelum dapat bertransaksi. |
| **FR-04** | Role-Based Access Control (RBAC) | Sistem mengisolasi 5 role secara ketat: `DONOR`, `REQUESTER`, `HOSPITAL`, `UTD_PMI`, dan `ADMIN`. Akses lintas peran tanpa izin dialihkan ke `RoleAccessGuard`. |
| **FR-05** | Fleksibilitas Peran Pengguna Umum | Satu akun pengguna umum dapat mengaktifkan kemampuan Pendonor Sukarela, Pencari Donor, atau keduanya secara bersamaan tanpa mendaftar ulang. |
| **FR-06** | Kartu Donor Digital (Digital Card) | Sistem menerbitkan Kartu Identitas Pendonor Digital berornamen Mega Mendung lengkap dengan Nomor ID Unik (`DL-CRB-XXXX`), golongan darah, dan kode QR. |
| **FR-07** | Dua Jalur Layanan Donor | Sistem memisahkan secara tegas: **Jalur 1 (Donor Sukarela Terjadwal di PMI)** dan **Jalur 2 (Donor Kebutuhan Pasien Darurat di RS)**. |
| **FR-08** | Manajemen Antrean Donor PMI (Jalur 1) | Pendonor dapat memilih jadwal dan slot di PMI. Tiket hanya terbit setelah menekan "Ambil Antrean & Konfirmasi". Sistem menerapkan aturan antrean aktif tunggal (1 antrean per waktu) dan kuota 20 donor/slot. |
| **FR-09** | Formulir Kebutuhan Darah Pasien (Jalur 2) | Keluarga/pasien dapat mengajukan kebutuhan transfusi darah bertahap (Data Pasien, Golongan Darah/Rhesus, Komponen Darah, Rumah Sakit di Cirebon, Urgensi). |
| **FR-10** | Verifikasi Kebutuhan oleh BDRS RS | Petugas Bank Darah RS memvalidasi formulir transfusi fisik pasien. Status permintaan berubah menjadi `OPEN` hanya setelah diverifikasi oleh pihak Rumah Sakit. |
| **FR-11** | Deteksi Duplikasi Permintaan | Sistem secara otomatis mendeteksi jika terdapat permohonan berulang untuk pasien yang sama di RS yang sama dalam kurun 48 jam untuk mencegah spam. |
| **FR-12** | Algoritma Pencocokan Relawan (Matching) | Sistem mencocokkan kebutuhan darah dengan pendonor aktif berdasarkan aturan kompatibilitas ABO/Rhesus dan filter wilayah Kota/Kabupaten Cirebon. |
| **FR-13** | Komitmen Kehadiran Pendonor | Pendonor yang relevan dapat menyatakan komitmen kehadiran ("Saya Bersedia Membantu") dengan estimasi waktu tiba (ETA). |
| **FR-14** | In-App Secure Chat & Family Companion | Koordinasi antara pendonor dan keluarga pasien dilakukan melalui chat internal dalam aplikasi. Fitur Companion memungkinkan pendamping keluarga memantau chat. |
| **FR-15** | Pencatatan Penerimaan Kantong Darah | Petugas RS/PMI mencatat nomor seri kantong darah fisik (`bagSerialNumber`), hasil uji saring lab, dan memperbarui kuota terpenuhi hingga `CLOSED_FULFILLED`. |
| **FR-16** | Manajemen Stok Darah PMI | UTD PMI dapat memantau stok per komponen (WB, PRC, TC, FFP), menetapkan ambang batas kritis, mencatat distribusi ke RS, dan membuang kantong kadaluwarsa/lisis. |
| **FR-17** | Pusat Pengaduan & Moderasi Konten | Pengguna dapat melaporkan indikasi pungli, calo, atau spam. Administrator dapat menginvestigasi, memberikan sanksi, atau membekukan akun (`SUSPENDED`). |
| **FR-18** | Audit Trail Log Sistem | Setiap aksi kritikal (login, pendaftaran, persetujuan faskes, update stok, komitmen donor) dicatat dalam tabel audit log sistem secara permanen. |
| **FR-19** | Unduh Laporan Rekapitulasi Resmi (PDF) | Administrator dan UTD PMI dapat mengekspor laporan resmi berformat cetak PDF dengan kop surat standar, nomor dokumen otomatis, dan stempel digital. |
| **FR-20** | Pemisahan Data Demo vs Data Uji Coba | Sistem membedakan secara visual data demo bawaan (`DEMO SIMULASI`) dari akun dan data baru yang didaftarkan oleh dosen penguji (`UJI COBA BARU`). |

### 2.2. Kebutuhan Non-Fungsional (Non-Functional Requirements)

1. **Keamanan (Security)**:
   - Password hashing: PBKDF2 dengan salt kriptografis unik 16-byte, 10.000 putaran SHA-256.
   - Token otentikasi: HMAC-SHA256 berbatas waktu (24 jam) dengan payload terenkripsi.
   - Sanitasi input: Seluruh string input disanitasi dari potensi serangan Cross-Site Scripting (XSS).
   - Privasi Data: Masking nomor telepon publik, kepatuhan consent data sesuai UU PDP No. 27/2022.
2. **Kinerja (Performance)**:
   - Waktu respon rata-rata REST API backend < 50 milidetik pada beban normal.
   - Pemuatan awal antarmuka web (First Contentful Paint) < 1.2 detik via Vite bundling.
   - Penulisan database terpusat menggunakan metode *atomic write-and-rename* dengan pembuatan snapshot cadangan bergulir (*rolling backup*).
3. **Ketersediaan & Keandalan (Availability & Reliability)**:
   - Server beroperasi secara kontinyu pada platform Google Cloud Run dengan dukungan health-check otomatis di `/api/health`.
   - Mekanisme fail-safe: Jika koneksi server lokal terganggu, client fallback memanfaatkan cache hydrated local storage secara transparan.
4. **Usabilitas (Usability)**:
   - Desain responsif diuji pada 3 ukuran layar: Mobile (360px–480px), Tablet (768px–1024px), dan Desktop (1280px+).
   - Tipografi berstandar Plus Jakarta Sans dengan kontras warna memenuhi kriteria aksesibilitas WCAG 2.1 Level AA.

---

## 3. PEMODELAN SISTEM (UML DIAGRAMS)

### 3.1. Use Case Diagram

```
+----------------------------------------------------------------------------------------------------+
|                                    SISTEM DONORLINK CIREBON                                        |
+----------------------------------------------------------------------------------------------------+

  [ Pendonor Sukarela ]
          |
          +---> ( Registrasi & Kelola Profil Fleksibel )
          +---> ( Lihat & Unduh Kartu Donor Digital Mega Mendung )
          +---> [Jalur 1] ( Ambil Antrean & Konfirmasi Donor PMI )
          +---> [Jalur 1] ( Reschedule / Batalkan Antrean Donor )
          +---> [Jalur 2] ( Telusuri Kebutuhan Darah Pasien di RS Cirebon )
          +---> [Jalur 2] ( Nyatakan Komitmen Kehadiran / Respon )
          +---> ( Berkoordinasi via In-App Chat Terenkripsi )
          +---> ( Lapor Penyalahgunaan / Calo Darah )

  [ Pencari Donor / Pasien ]
          |
          +---> ( Registrasi Publik & Login )
          +---> ( Buat Formulir Permintaan Darah Bertahap )
          +---> ( Pantau Status & Timeline Real-Time )
          +---> ( Hubungkan Family Companion ke Chat Permintaan )
          +---> ( Berkoordinasi dengan Relawan Donor via Chat )

  [ Petugas Rumah Sakit (BDRS) ]
          |
          +---> ( Registrasi Faskes -> Menunggu Approval Admin )
          +---> ( Verifikasi Formulir Transfusi Fisik Pasien )
          +---> ( Rekam Penerimaan Kantong Darah Fisik / Bag Serial )
          +---> ( Validasi Kecocokan Crossmatching Laboratorium )

  [ Petugas PMI / UTD ]
          |
          +---> ( Registrasi Faskes -> Menunggu Approval Admin )
          +---> ( Kelola Loket Antrean Donor & Panggil Nomor )
          +---> ( Skrining Hb, Tekanan Darah & Catat Donor Selesai )
          +---> ( Manajemen Inventori Stok Darah Wilayah Cirebon )
          +---> ( Unduh Laporan Rekapitulasi Pelayanan Darah PDF )

  [ Super Administrator (Latifah Noor Azizah) ]
          |
          +---> ( Login Super Admin via Kredensial Khusus )
          +---> ( Verifikasi & Validasi Surat Izin Operasional Faskes Baru )
          +---> ( Tolak Pengajuan Faskes Ilegal / Tidak Lengkap )
          +---> ( Moderasi Tiket Pengaduan Penyalahgunaan )
          +---> ( Inspeksi Audit Log & Aktivitas Sistem Lengkap )
          +---> ( Unduh Laporan Rekapitulasi Komprehensif PDF )
```

---

### 3.2. Activity Diagram: Alur Dua Jalur Layanan Donor

```
                              [ MULAI: Akun Pendonor ]
                                         |
                                         v
                      +--------------------------------------+
                      |      Pilih Jalur Layanan Donor       |
                      +--------------------------------------+
                                  /              \
                                 /                \
          [ JALUR 1: DONOR RUTIN PMI ]       [ JALUR 2: PASIEN DARURAT RS ]
                        |                                   |
                        v                                   v
       +---------------------------------+   +---------------------------------+
       | Pilih Unit PMI & Tanggal/Slot   |   | Buka Daftar Permintaan Darah RS |
       +---------------------------------+   +---------------------------------+
                        |                                   |
                        v                                   v
       +---------------------------------+   +---------------------------------+
       | Sistem Cek: Ada Antrean Aktif?  |   | Sistem Cocokkan Golongan Darah  |
       +---------------------------------+   +---------------------------------+
               /                 \                          |
          [ Ya ]               [ Tidak ]                    v
             /                     \         +---------------------------------+
            v                       v        | Klik "Saya Bersedia Membantu"   |
   +-----------------+    +----------------+ +---------------------------------+
   | Tampilkan Pering|    | Klik Tombol:   |                |
   | katan Antrean   |    | "Ambil Antrean |                v
   | Masih Berjalan  |    |  & Konfirmasi" | +---------------------------------+
   +-----------------+    +----------------+ | Masukkan Estimasi Waktu (ETA)   |
                                   |         +---------------------------------+
                                   v                        |
                          +----------------+                v
                          | Terbitkan No.  | +---------------------------------+
                          | Tiket & Barcode| | Buka Chat Koordinasi Keluarga   |
                          +----------------+ +---------------------------------+
                                   |                        |
                                   v                        v
                          +----------------+ +---------------------------------+
                          | Hadir di PMI & | | Hadir di BDRS Rumah Sakit       |
                          | Skrining Medis | +---------------------------------+
                          +----------------+                |
                                   |                        v
                                   v         +---------------------------------+
                          +----------------+ | BDRS Rekam No. Seri Kantong     |
                          | Status Antrean | +---------------------------------+
                          | "Selesai"      |                |
                          +----------------+                v
                                   |         +---------------------------------+
                                   v         | Status Permintaan: "TERPENUHI"  |
                          +----------------+ +---------------------------------+
                          | Dapat Mengambil|
                          | Antrean Baru   |
                          +----------------+
```

---

### 3.3. Sequence Diagram: Pendaftaran & Verifikasi Faskes oleh Super Admin

```
Dosen/Petugas Faskes      DONORLINK Frontend        Express Backend API      Super Admin (Latifah)
        |                         |                         |                         |
        |-- 1. Isi Form Faskes -->|                         |                         |
        |   (Nama RS, No. Izin,   |                         |                         |
        |    PIC, WhatsApp)       |                         |                         |
        |                         |-- 2. POST /facilities ->|                         |
        |                         |   POST /auth/register   |                         |
        |                         |                         |-- 3. Simpan Faskes      |
        |                         |                         |   status: PENDING_VERIF |
        |                         |<-- 4. Status PENDING ---|                         |
        |<-- 5. Toast Info -------|                         |                         |
        |                         |                         |                         |
        |                         |                         |-- 6. Login Super Admin->|
        |                         |                         |<-- 7. Akses Dashboard --|
        |                         |                         |                         |
        |                         |                         |-- 8. Buka Tab Faskes -->|
        |                         |                         |   (Muncul Pengajuan)    |
        |                         |                         |                         |
        |                         |                         |<- 9. Klik "Setujui" ---|
        |                         |                         |   verifyFacility(id)    |
        |                         |                         |                         |
        |                         |-- 10. Update Status --->|-- 11. fac.isVerified=t  |
        |                         |    Akun Faskes: ACTIVE  |   user.status='ACTIVE'  |
        |                         |<-- 12. Audit Log Created|   Simpan ke Database    |
        |                         |                         |                         |
```

---

### 3.4. Class Diagram (Data Model Structure)

```
+------------------------------------+          +------------------------------------+
|                User                |          |         HealthcareFacility         |
+------------------------------------+          +------------------------------------+
| id: string (PK)                    |          | id: string (PK)                    |
| fullName: string                   |          | name: string                       |
| email: string                      |          | type: 'HOSPITAL' | 'UTD_PMI'       |
| phone: string                      |          | city: string                       |
| role: UserRole                     |1        *| address: string                    |
| status: 'ACTIVE' | 'PENDING' | ... |<-------->| phone: string                      |
| facilityId?: string (FK)           |          | permitNumber: string               |
| isDonorEnabled: boolean            |          | picName: string                    |
| isRequesterEnabled: boolean        |          | isVerified: boolean                |
| donorIdNumber?: string             |          | isDemoData: boolean                |
| isDemoData: boolean                |          +------------------------------------+
+------------------------------------+
                  | 1
                  |
                  | *
+------------------------------------+          +------------------------------------+
|            DonorBooking            |          |            BloodRequest            |
+------------------------------------+          +------------------------------------+
| id: string (PK)                    |          | id: string (PK)                    |
| queueNumber: string                |          | requesterId: string (FK)           |
| donorId: string (FK)               |          | hospitalId: string (FK)            |
| facilityId: string (FK)            |          | patientIdentifier: string          |
| bookingDate: string                |          | bloodType: BloodType               |
| timeSlot: 'MORNING' | 'AFTERNOON'  |          | rhesus: Rhesus                     |
| status: 'CONFIRMED'|'COMPLETED'|...|          | componentType: ComponentType       |
| hbLevel?: number                   |          | bagsNeeded: number                 |
| bloodPressure?: string             |          | bagsFulfilled: number              |
+------------------------------------+          | status: RequestStatus              |
                                                | urgency: UrgencyLevel              |
                                                | isVerifiedByHospital: boolean      |
                                                | isDemoData: boolean                |
                                                +------------------------------------+
                                                                  | 1
                                                                  |
                                                                  | *
                                                +------------------------------------+
                                                |            BloodBagItem            |
                                                +------------------------------------+
                                                | id: string (PK)                    |
                                                | bagSerialNumber: string            |
                                                | requestId: string (FK)             |
                                                | bloodType: BloodType               |
                                                | rhesus: Rhesus                     |
                                                | componentType: ComponentType       |
                                                | status: 'QUARANTINE'|'RELEASED'|...|
                                                +------------------------------------+
```

---

## 4. ENTITY RELATIONSHIP DIAGRAM (ERD)

Sistem DONORLINK mengorganisasi relasi antar-entitas sebagai berikut:

```
[USERS] 1 ----- * [DONOR_PROFILES] (One-to-One / Profile Extension)
[USERS] 1 ----- * [DONOR_BOOKINGS] (One-to-Many: Riwayat Antrean Sukarela PMI)
[USERS] 1 ----- * [BLOOD_REQUESTS] (One-to-Many: Permintaan Darah Pasien oleh Keluarga)
[HEALTHCARE_FACILITIES] 1 ----- * [USERS] (One-to-Many: Petugas Institusi RS/PMI)
[HEALTHCARE_FACILITIES] 1 ----- * [BLOOD_REQUESTS] (One-to-Many: Pasien Dirawat di RS)
[HEALTHCARE_FACILITIES] 1 ----- * [DONOR_BOOKINGS] (One-to-Many: Loket PMI yang Dituju)
[HEALTHCARE_FACILITIES] 1 ----- * [BLOOD_STOCKS] (One-to-Many: Inventori Kantong Darah)
[BLOOD_REQUESTS] 1 ----- * [DONOR_RESPONSES] (One-to-Many: Relawan Menyatakan Komitmen)
[BLOOD_REQUESTS] 1 ----- * [BLOOD_BAGS] (One-to-Many: Kantong Darah Fisik Diterima)
[BLOOD_REQUESTS] 1 ----- 1 [CHAT_THREADS] (One-to-One: Ruang Koordinasi Obrolan)
[CHAT_THREADS] 1 ----- * [CHAT_MESSAGES] (One-to-Many: Pesan Percakapan Aman)
[USERS] 1 ----- * [AUDIT_LOGS] (One-to-Many: Jejak Audit Keamanan Sistem)
[USERS] 1 ----- * [ABUSE_REPORTS] (One-to-Many: Laporan Indikasi Pelanggaran/Calo)
```

---

## 5. ARSITEKTUR SISTEM & STRATEGI KEAMANAN

### 5.1. 3-Tier Layered Architecture

1. **Presentation Layer (Frontend Client SPA)**:
   - Framework: React 19 dengan TypeScript, Tailwind CSS, dan Lucide Icons.
   - Manajemen State Terpusat: `AppContext.tsx` dengan sinkronisasi REST API real-time.
   - Guard Navigasi: `RoleAccessGuard` mencegah role pendonor mengakses dashboard rumah sakit atau admin secara ilegal.
2. **Application Layer (Node.js Express Server pada Port 3000)**:
   - Berkas Utama: `server.ts` yang mengintegrasikan Vite middleware dalam mode dev dan static serving dalam mode production.
   - Endpoint REST API Terstruktur:
     - `/api/health`: Health-check status server dan status database.
     - `/api/bootstrap`: Hidrasi data awal seluruh entitas terpusat.
     - `/api/auth/*`: Registrasi pengguna baru, verifikasi token, dan profil.
     - `/api/facilities/*`: Pendaftaran dan verifikasi fasilitas kesehatan.
     - `/api/requests/*`: Pengajuan kebutuhan darah, verifikasi RS, dan penerimaan kantong darah.
     - `/api/donor/*`: Antrean donor sukarela, komitmen kehadiran, dan pembatalan.
     - `/api/reports/*`: Pelaporan indikasi calo/pungli dan penanganan moderasi.
3. **Data Layer (Centralized Database & Rolling Backups)**:
   - Penyimpanan Utama: `/data/donorlink_database.json` yang menyimpan data terpadu untuk semua pengguna dan transaksi.
   - Penulisan Atomik (*Atomic Writes*): Data ditulis ke berkas sementara (`.tmp`) lalu di-*rename* secara atomik untuk mencegah *data corruption* saat server menerima banyak request serentak.
   - Rolling Backups Otomatis: Setiap kali server dijalankan, dibuat snapshot cadangan berstempel waktu di `/data/backups/`.

### 5.2. Kepatuhan Regulasi & Keamanan (UU PDP No. 27/2022)
- **Minimisasi Data (Data Minimization)**: Nomor WhatsApp keluarga pasien tidak ditampilkan di ruang publik secara telanjang, melainkan melalui koordinasi Chat Internal aplikasi. Nomor baru dapat dibagikan hanya jika pengguna secara eksplisit menekan tombol izin kontak WhatsApp.
- **Audit Logging**: Setiap aksi pembacaan data medis sensitif dicatat ke dalam tabel `auditLogs` mencakup `actorName`, `actorRole`, `action`, dan `timestamp`.

---

## 6. SISTEM DESAIN UI/UX & IDENTITAS VISUAL

### 6.1. Palet Warna & Tipografi
- **Warna Utama**: Deep Maroon `#BE123C` (Warna darah medis yang humanis, terhormat, dan profesional).
- **Warna Sukses**: Emerald Green `#059669` (Status kantong darah terpenuhi, antrean selesai, dan akun terverifikasi).
- **Warna Peringatan**: Amber Warm `#D97706` (Status menunggu verifikasi admin, stok darah menipis).
- **Warna Latar & Netral**: White `#FFFFFF`, Slate-50 `#F8FAFC`, Slate-200 `#E2E8F0`, Slate-900 `#0F172A`.
- **Tipografi**: `Plus Jakarta Sans` untuk teks antarmuka dan `JetBrains Mono` untuk kode tiket, nomor seri kantong darah, dan nomor surat izin faskes.

### 6.2. Integrasi Logo Motif Batik Mega Mendung Khas Cirebon
Sesuai identitas budaya Cirebon, logo DONORLINK memadukan tetesan darah merah dengan motif awan Batik Mega Mendung. Logo ini diimplementasikan secara konsisten pada:
- Favicon browser & Apple Touch Icon (`index.html`)
- Header Navigasi Utama (`Navbar.tsx`)
- Landing Page Hero Section (`LandingPage.tsx`)
- Halaman Login & Registrasi (`AuthPage.tsx`)
- Kartu Identitas Pendonor Digital (`DigitalDonorCardModal.tsx`)
- Seluruh 5 Dashboard: Admin, Rumah Sakit, PMI, Pendonor, dan Pencari Donor
- Footer Resmi Aplikasi (`App.tsx`)

---

## 7. MATRIKS PENGUJIAN BLACK-BOX (BLACK-BOX TEST SUITE)

Seluruh 15 skenario pengujian utama telah diuji dan dinyatakan **MEMENUHI SYARAT (100% PASS)**:

| No. Test Case | Modul / Fitur yang Diuji | Langkah Pengujian | Hasil yang Diharapkan | Hasil Aktual | Status |
| :---: | :--- | :--- | :--- | :--- | :---: |
| **TC-01** | Registrasi Akun Masyarakat Baru | Pilih "Masyarakat Umum", isi form 4-step, pilih domisili Cirebon, centang persetujuan privasi. | Akun baru tersimpan dengan status `ACTIVE`, data tersinkron ke backend `/api/auth/register`. | Berhasil tersimpan, langsung diarahkan ke Dashboard. | **PASS** |
| **TC-02** | Registrasi Faskes Baru (RS / PMI) | Pilih "Fasilitas Kesehatan", isi nama RS/PMI, nomor izin Kemenkes, PIC, dan nomor WA. | Akun berstatus `PENDING_VERIFICATION`, masuk antrean verifikasi Super Admin. | Berhasil terdaftar dengan status `PENDING_VERIFICATION`. | **PASS** |
| **TC-03** | Verifikasi Faskes oleh Super Admin | Login sebagai Super Admin (`latifahnoorazizah7@gmail.com`), buka Tab Faskes, klik "Setujui". | `fac.isVerified` menjadi `true`, status user faskes berubah menjadi `ACTIVE`. | Faskes terverifikasi sah, akun petugas langsung aktif. | **PASS** |
| **TC-04** | Penolakan Faskes oleh Super Admin | Buka pengajuan faskes yang tidak valid di Dashboard Admin, klik "Tolak". | Faskes dihapus/ditolak, status user faskes berubah menjadi `SUSPENDED`. | Pengajuan ditolak, toast konfirmasi tampil, audit log tercatat. | **PASS** |
| **TC-05** | Isolasi Role & Guard Navigasi | Login sebagai `DONOR`, lalu coba akses URL/view `hospital-dashboard` secara langsung. | Sistem memblokir akses dan merender `RoleAccessGuard` dengan tombol switch role aman. | Pengguna dicegat dengan pesan "Akses Terbatas". | **PASS** |
| **TC-06** | Jalur 1: Ambil Antrean PMI | Pada tab "Jalur 1", pilih UTD PMI Cirebon, pilih slot waktu, klik "Ambil Antrean & Konfirmasi". | Tiket antrean diterbitkan dengan kode unik, sisa kuota berkurang 1. | Tiket antrean aktif terbit, status `CONFIRMED`. | **PASS** |
| **TC-07** | Jalur 1: Proteksi Antrean Ganda | Coba mengambil tiket antrean kedua di PMI saat antrean pertama belum berstatus "Selesai". | Sistem mencegah pengambilan antrean baru dan menampilkan peringatan antrean aktif. | Sistem memblokir dan meminta menyelesaikan antrean lama. | **PASS** |
| **TC-08** | Jalur 1: Penyelesaian Antrean di PMI | Login sebagai `UTD_PMI`, lakukan skrining Hb/tensi pada antrean, klik "Selesai Donor". | Antrean berstatus `COMPLETED`, pendonor kini diizinkan mengambil antrean baru. | Status berubah menjadi `COMPLETED`, antrean baru terbuka. | **PASS** |
| **TC-09** | Jalur 2: Pengajuan Kebutuhan Darah | Login sebagai `REQUESTER`, isi formulir pasien, pilih RS di Cirebon, pilih ABO/Rhesus. | Permohonan tersimpan dengan status `SUBMITTED`, menunggu verifikasi BDRS RS. | Permohonan terbuat, muncul di antrean BDRS RS. | **PASS** |
| **TC-10** | Jalur 2: Verifikasi Permohonan oleh RS | Login sebagai `HOSPITAL`, periksa formulir transfusi fisik, klik "Verifikasi Permohonan". | Status permohonan berubah menjadi `OPEN`, mulai dicocokkan ke relawan donor. | Status berubah menjadi `OPEN`, audit log terbit. | **PASS** |
| **TC-11** | Jalur 2: Komitmen Respon Pendonor | Login sebagai `DONOR`, klik permohonan darah yang cocok, isi estimasi kedatangan (ETA). | Status respon `COMMITTED`, timeline terupdate, chat thread terhubung otomatis. | Komitmen tercatat, ruang chat donor-keluarga aktif. | **PASS** |
| **TC-12** | Jalur 2: Pencatatan Kantong Darah | Login sebagai `HOSPITAL`, klik "Catat Penerimaan Kantong Darah", isi nomor seri kantong. | Kantong darah fisik tercatat di tabel `bloodBags`, kuota terpenuhi bertambah. | Nomor kantong tervalidasi, kuota bertambah. | **PASS** |
| **TC-13** | Ekspor Laporan Rekapitulasi PDF | Di Dashboard Admin / PMI, klik "Unduh Laporan Rekapitulasi (PDF)". | Modal cetak PDF resmi terbuka dengan kop surat, nomor dokumen, dan tabel rapi. | Modal cetak terbuka siap simpan sebagai PDF / cetak printer. | **PASS** |
| **TC-14** | Pemisahan Akun Demo vs Akun Baru | Buka Tab Pengguna di Dashboard Admin, amati label pada baris data pengguna. | Akun dosen/baru berlabel ungu `UJI COBA BARU`, akun simulasi berlabel abu-abu `DEMO SIMULASI`. | Terpisah jelas dengan filter chip berfungsi baik. | **PASS** |
| **TC-15** | Keberlanjutan Data Terpusat (Persistence) | Daftarkan akun baru, restart server Express, periksa kembali `/api/bootstrap`. | Seluruh data yang baru didaftarkan tetap ada di `/data/donorlink_database.json`. | Data persisten 100% tanpa ada data yang hilang. | **PASS** |

---

## 8. PANDUAN PENGUJIAN DOSEN (EVALUATION WALKTHROUGH)

Bapak/Ibu Dosen Penilai dapat menguji sistem DONORLINK secara langsung melalui skenario langkah-demi-langkah berikut:

### Skenario 1: Menguji Pendaftaran Akun Baru Masyarakat Umum
1. Buka tautan publik DONORLINK: `https://ais-pre-bjkyu4ftr2ov7hu2xzymdx-758253768503.asia-east1.run.app`
2. Klik tombol **"Masuk / Daftar"** pada navigasi atas.
3. Di panel sebelah kanan, klik tab **"Daftar Baru"**. Pastikan terpilih opsi **"Masyarakat Umum"**.
4. **Langkah 1 (Identitas)**: Masukkan nama lengkap (misal: `Budi Santoso`), tanggal lahir, nomor WhatsApp, pilih wilayah `Kota Cirebon` atau `Kabupaten Cirebon`, isi kecamatan, dan centang persetujuan privasi. Klik "Lanjut".
5. **Langkah 2 (Kemampuan)**: Pilih kemampuan akun: dapat memilih *Pendonor*, *Pencari Donor*, atau *keduanya sekaligus*. Klik "Lanjut".
6. **Langkah 3 (Data Golongan Darah)**: Pilih golongan darah (misal: `Golongan O`, `Rhesus Positif`). Klik "Lanjut".
7. **Langkah 4 (Konfirmasi)**: Periksa ringkasan pendaftaran dan klik **"Selesaikan Pendaftaran"**.
8. **Hasil**: Akun berhasil aktif, pengguna langsung diarahkan ke Dashboard dengan Kartu Donor Digital berornamen Mega Mendung yang siap dilihat atau diunduh.

---

### Skenario 2: Menguji Pendaftaran Faskes Baru & Verifikasi oleh Super Admin
1. Pada halaman **"Daftar Baru"**, pilih tab **"Fasilitas Kesehatan"**.
2. Pilih jenis fasilitas: **Rumah Sakit (BDRS)** atau **UTD PMI Wilayah**.
3. Masukkan data institusi:
   - Nama Faskes: contoh `RS Permata Cirebon`
   - Nomor Izin Operasional: contoh `503/089/DINKES-SIO/2026`
   - Wilayah: `Kabupaten Cirebon`, Kecamatan: `Kedawung`
   - PIC: `dr. Hendra Wijaya, Sp.PK`
   - WhatsApp PIC: `081322119988`
4. Centang pernyataan keabsahan izin operasional dan klik **"Ajukan Pendaftaran Fasilitas Kesehatan"**.
5. Sistem akan menampilkan notifikasi bahwa akun berstatus **`PENDING_VERIFICATION`**.
6. **Uji Verifikasi oleh Super Admin**:
   - Di panel kiri (1-Klik Akses Demo), klik tombol **"Administrator Sistem"** (akun `Latifah Noor Azizah` - `latifahnoorazizah7@gmail.com`).
   - Pada Dashboard Admin, buka Tab **"Verifikasi Fasilitas Kesehatan"**.
   - Pengajuan baru dari `RS Permata Cirebon` akan tampil dengan badge ungu **`UJI COBA BARU`** dan status **`MENUNGGU VERIFIKASI ADMIN`**.
   - Klik tombol hijau **"Setujui & Verifikasi Faskes"**.
   - Status faskes seketika berubah menjadi **`Terverifikasi Sah`** dan akun faskes tersebut resmi diaktifkan.

---

### Skenario 3: Menguji Dua Jalur Layanan Donor Darah
1. Masuk sebagai akun **Pendonor** (misal akun demo `Rian Hidayat` atau akun baru Bapak/Ibu Dosen).
2. Di Dashboard Pendonor, perhatikan dua kartu jalur di bagian atas:
   - **Jalur 1: Donor Sukarela di PMI**:
     - Klik tombol **"Buka Antrean Sukarela PMI"**.
     - Klik tombol **"Ambil Tiket Antrean Donor"**.
     - Pilih UTD PMI (Kota Cirebon / Kab. Cirebon), tanggal donor, dan slot waktu (Pagi/Siang).
     - Klik tombol hijau **"Ambil Antrean & Konfirmasi"**. Tiket antrean resmi terbit.
     - *Uji Validasi Antrean Tunggal*: Coba klik "Ambil Tiket" lagi. Sistem akan menampilkan peringatan bahwa Anda masih memiliki antrean aktif dan tidak boleh mengambil antrean ganda sebelum antrean sebelumnya selesai.
   - **Jalur 2: Tanggapi Kebutuhan Darah Pasien di RS**:
     - Beralih ke tab **"Jalur 2: Donor Kebutuhan Pasien RS"**.
     - Pilih salah satu permintaan darah pasien (misal pasien di RSUD Gunung Jati Cirebon).
     - Klik tombol merah **"Saya Bersedia Membantu"**, masukkan estimasi waktu kehadiran (misal: `30 menit`), dan konfirmasi.
     - Buka fitur **Chat Internal**; ruang obrolan aman dengan keluarga pasien telah otomatis terhubung.

---

### Skenario 4: Menguji Ekspor Laporan Rekapitulasi Administratif (PDF)
1. Masuk sebagai **Administrator Sistem** atau **PMI / Unit Transfusi Darah**.
2. Pada banner atas dashboard, klik tombol **"Unduh Laporan Rekapitulasi (PDF)"**.
3. Sistem akan memunculkan jendela modal pratinjau dokumen resmi yang memuat:
   - Kop Surat Resmi DONORLINK Wilayah Cirebon.
   - Nomor Surat Keputusan Administratif otomatis berstempel waktu.
   - Rekapitulasi metrik donor darah, jumlah faskes aktif, dan rincian transaksi kantong darah.
   - Kolom tanda tangan digital Super Admin / Kepala UTD PMI.
4. Klik tombol **"Cetak Dokumen / Simpan PDF"** untuk mengunduh laporan dalam format file PDF.

---

## 9. PANDUAN DEPLOYMENT & HOSTING LINGKUNGAN CLOUD

### 9.1. Konfigurasi Lingkungan (Environment Setup)
Aplikasi dikonfigurasi untuk berjalan secara mandiri tanpa dependensi eksternal yang rentan:

```bash
# Menjalankan dev server full-stack (Express + Vite) pada port 3000:
npm run dev

# Membangun aset bundle client untuk produksi:
npm run build

# Menjalankan server produksi terpadu:
npm start
```

### 9.2. Variabel Lingkungan (.env)
```env
PORT=3000
NODE_ENV=production
SUPER_ADMIN_EMAIL=latifahnoorazizah7@gmail.com
SUPER_ADMIN_PASSWORD=DonorLinkAdmin2026!
APP_SECRET=donorlink_secret_cirebon_pmi_rs_2026
```

### 9.3. Pemeliharaan & Snapshot Database Terpusat
Database berkas terpusat disimpan pada direktori `/data/donorlink_database.json`. Setiap penambahan pengguna, faskes, dan permohonan darah langsung disinkronkan secara atomik, sehingga data hasil evaluasi dosen tidak akan hilang meskipun tab browser ditutup atau dev server dimulai ulang.

---

## 10. KESIMPULAN

Platform **DONORLINK** telah berhasil direkayasa dan disempurnakan sesuai dengan standar mata kuliah **Rekayasa Perangkat Lunak (RPL)**. Sistem menghadirkan solusi konkret terhadap permasalahan distribusi darah di Kota dan Kabupaten Cirebon melalui pendekatan sistemik:
1. **Pemisahan 5 Role Terisolasi** yang menjamin akuntabilitas setiap aktor.
2. **Dua Jalur Layanan Donor** yang mencegah kebingungan relawan dan mengoptimalkan penyerapan stok darah.
3. **Pusat Otentikasi & Verifikasi Ketat Faskes** yang melindungi keselamatan klinis masyarakat dari praktik tidak resmi.
4. **Kepatuhan Privasi Data (UU PDP No. 27/2022)** melalui enkripsi kredensial, komunikasi chat internal, dan masking nomor kontak publik.
5. **Kesiapan Pengujian & Hosting Penuh** yang memungkinkan dosen penguji melakukan verifikasi end-to-end secara transparan dan andal.

---
*Dibuat untuk memenuhi evaluasi Ujian Akhir Semester (UAS) Rekayasa Perangkat Lunak.*  
**DONORLINK — Menghubungkan Kebaikan, Menyelamatkan Kehidupan.**
