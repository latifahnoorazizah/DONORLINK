# MASTER DEVELOPMENT PLAN DONORLINK (TAHAP DEMO)
## Platform Koordinasi & Pendataan Donor Darah Sukarela Wilayah Kota & Kabupaten Cirebon

> **Status Saat Ini:** Tahap Prototipe & Demo Interaktif Terintegrasi  
> **Datastore:** 1 Shared Demo Datastore (`/data/donorlink_database.json`) dengan label **DATA DEMO**  
> **Arsitektur:** 6 Fase Pengembangan Terstruktur (Tanpa Penambahan Fase Ketujuh)

---

## 1. RINGKASAN EKSEKUTIF & PRINSIP UTAMA

1. **Strict UI/UX & Flow Preservation**:
   - Mempertahankan tata letak, palet warna (*Rose Maroon* `#BE123C`, *Emerald* `#059669`, *Amber* `#D97706`, *Slate Neutral*), tipografi *Plus Jakarta Sans*, dan navigasi 5 dashboard independen (`DONOR`, `REQUESTER`, `HOSPITAL`, `UTD_PMI`, `ADMIN`).
   - Tidak melakukan *rewrite* dari nol; seluruh modul yang sudah ada dikembangkan (*extend existing functionality*).
2. **Shared Demo Datastore & Label DATA DEMO**:
   - Seluruh 5 role berbagi satu sumber data terpusat (shared demo datastore) agar interaksi antar-aktor (cth: Requester membuat permintaan $\rightarrow$ RS memverifikasi $\rightarrow$ Pendonor merespons $\rightarrow$ PMI mencatat kantong $\rightarrow$ Admin mengaudit) berjalan konsisten secara real-time.
   - Seluruh data simulasi diberi label eksplisit **DATA DEMO**.
3. **Penyempurnaan 3 Kebutuhan Utama**:
   - **Integrasi Pendamping Keluarga**: Disatukan sebagai pilihan opsional di dalam Formulir Permintaan Darah (bukan menu/pendaftaran wajib terpisah).
   - **Recipient-Based Notification Center**: Notifikasi terisolasi per akun (`recipientId`) berdasarkan peran dan aktivitas pengguna; tidak ada notifikasi global yang tercampur.
   - **Modul Laporan Rumah Sakit & Ekspor PDF**: Penambahan menu Laporan di Dashboard RS dengan 4 jenis laporan, filter periode (harian, mingguan, bulanan, tahunan, kustom), dan ekspor PDF resmi berlabel DATA DEMO.

---

## 2. DETAIL TIGA PENYESUAIAN FITUR UTAMA

### 2.1. Penyesuaian Fitur Pendamping Keluarga (Family Companion)

#### A. Titik Integrasi: Form Permintaan Darah
Fitur Pendamping Keluarga **tidak lagi berupa menu registrasi terpisah**, melainkan disematkan langsung sebagai opsi opsional pada saat Pemohon (Pencari Donor) mengisi formulir kebutuhan darah pasien.

Terdapat sakelar/checkbox opsional:
> *"Saya mengajukan permintaan darah untuk orang lain dan ingin menambahkan pendamping."*

#### B. Sub-Formulir Pendamping (Kondisional saat diaktifkan)
1. **Nama Lengkap Pendamping** (`fullName`: string, wajib).
2. **Nomor HP / WhatsApp Aktif** (`phone`: string, format Indonesia `08xx`, wajib).
3. **Hubungan dengan Pasien** (`relationship`: string, pilihan: *Orang Tua, Anak, Suami/Istri, Saudara Kandung, Kerabat, Teman*, wajib).
4. **Email Pendamping** (`email`: string, opsional).
5. **Akun DONORLINK Pendamping** (`existingUserId`: string, dicocokkan otomatis jika nomor HP/email telah terdaftar, opsional).
6. **Izin Akses Khusus**:
   - `VIEW`: Melihat detail permintaan dan memantau status pemenuhan kantong darah.
   - `CHAT`: Turut serta berkomunikasi dengan relawan donor di dalam ruang chat internal.
   - `CONFIRM`: Membantu konfirmasi kehadiran pendonor di fasilitas kesehatan.
7. **Persetujuan Pemberian Akses Data** (`consentGiven`: boolean, wajib dicentang).

#### C. Ketentuan Hak Akses & Keamanan Pendamping
- **Undangan Tertunda (*Invited / Pending Approval*)**: Jika nomor HP/email pendamping belum memiliki akun di DONORLINK, data disimpan dengan status `INVITED_PENDING_REGISTRATION`. Ketika pendamping mendaftar dengan nomor HP yang cocok, akses langsung terhubung.
- **Isolasi Akses**: Pendamping **hanya** dapat mengakses data permohonan darah spesifik yang dibagikan kepadanya. Pendamping tidak memiliki akses ke data akun pribadi pemohon.
- **Pencabutan Akses**: Pemilik permohonan dapat mengubah tingkat izin atau mencabut (*revoke*) akses pendamping kapan saja.
- **Pemisahan Narahubung**: Narahubung pasien (*Contact Person*) tidak otomatis menjadi pendamping kecuali didaftarkan dan menyetujui peran pendamping.
- **Tanpa Pembagian Password**: Sistem tidak pernah meminta atau membagikan kata sandi. Otentikasi tetap menggunakan akun mandiri pendamping.

---

### 2.2. Pembaruan Sistem Notifikasi Berbasis Penerima (Recipient-Based Notification)

Setiap notifikasi dalam sistem kini wajib memiliki skema data:
```typescript
interface NotificationItem {
  id: string;
  recipientId: string; // Wajib: ID pengguna penerima spesifik
  title: string;
  message: string;
  category: NotificationCategory;
  type: 'MATCH' | 'STATUS_CHANGE' | 'CHAT' | 'REMINDER' | 'SYSTEM' | 'SECURITY';
  createdAt: string;
  isRead: boolean;
  sourceActivity: string; // Misal: 'REQUEST_VERIFIED', 'DONOR_COMMITTED'
  targetEntityId?: string; // ID Permintaan Darah / ID Antrean / ID Thread Chat
}
```

#### Matriks Kategori Notifikasi per Role

| Role Penerima | Kategori Notifikasi | Pemicu Aktivitas Sistem | Aksi Pengguna Terkait |
| :--- | :--- | :--- | :--- |
| **A. Pendonor** | **Permintaan Darah Cocok** (`MATCH`) | Pasien di Cirebon diverifikasi RS membutuhkan golongan darah & rhesus yang identik. | Membuka detail permintaan & tombol komitmen kehadiran. |
| | **Respons Kesediaan Donor** (`COMMITMENT_ACK`) | Rumah Sakit atau Keluarga mengonfirmasi komitmen kehadiran pendonor. | Membuka arahan lokasi dan instruksi persiapan medis. |
| | **Pesan Masuk** (`CHAT_MESSAGE`) | Keluarga pasien atau RS mengirim pesan di In-App Chat. | Membuka modal chat terenkripsi internal. |
| | **Perubahan Jadwal Donor Sukarela** (`SCHEDULE_UPDATE`) | Jadwal layanan donor darah di UTD PMI mengalami penyesuaian operasional. | Membuka opsi reschedule antrean donor. |
| | **Pengingat Antrean & Booking** (`QUEUE_REMINDER`) | H-1 atau 2 jam sebelum sesi antrean donor sukarela di UTD PMI. | Menampilkan QR tiket antrean untuk check-in. |
| **B. Pencari Donor** | **Pendonor Merespons Permintaan** (`DONOR_COMMITTED`) | Calon pendonor menyatakan "Bersedia Membantu" beserta estimasi waktu tiba (ETA). | Melihat profil relawan & memulai chat koordinasi. |
| | **Pesan Masuk** (`CHAT_MESSAGE`) | Calon pendonor mengirim pesan di In-App Chat. | Membuka modal chat koordinasi. |
| | **Perubahan Status Permintaan** (`REQUEST_STATUS`) | RS memverifikasi formulir (`OPEN`) atau permintaan ditolak. | Memantau perkembangan verifikasi berkas medis. |
| | **Informasi Pemenuhan Darah** (`BAG_FULFILLED`) | BDRS RS mencatat nomor seri kantong darah yang telah diterima. | Memantau progress kuota kantong darah (cth: 1 dari 2 kantong). |
| | **Permintaan Selesai / Dibatalkan** (`REQUEST_CLOSED`) | Seluruh kuota kantong terpenuhi atau permintaan dibatalkan. | Menutup permohonan & memberikan ucapan terima kasih. |
| **C. Rumah Sakit (BDRS)** | **Permintaan Darah Baru Masuk** (`NEW_REQUEST_SUBMITTED`) | Keluarga pasien mengajukan kebutuhan transfusi darah di RS tersebut. | Membuka modal verifikasi formulir transfusi fisik. |
| | **Pendonor Merespons Pasien RS** (`DONOR_ARRIVING`) | Relawan donor menyatakan komitmen hadir di BDRS RS tersebut. | Menyiapkan loket penerimaan donor pengganti. |
| | **Pembaruan Status Pemenuhan** (`FULFILLMENT_PROGRESS`) | Kantong darah fisik diterima dan dicocokkan di laboratorium. | Memperbarui kuota dan status klinis kantong. |
| | **Pembaruan Stok Darah PMI/UTD** (`PMI_STOCK_UPDATE`) | UTD PMI memperbarui stok atau menerbitkan status kritis komponen darah. | Melakukan koordinasi permintaan drop kantong darah dari PMI. |
| | **Pengingat Permintaan Tertunda** (`PENDING_VERIFICATION_ALERT`) | Terdapat permohonan pasien yang belum diverifikasi petugas > 2 jam. | Segera melakukan validasi berkas rujukan. |
| | **Notifikasi Aktivitas Laporan** (`REPORT_GENERATED`) | Laporan rekapitulasi pelayanan darah berhasil diekspor. | Mengunduh berkas laporan resmi PDF. |
| **D. PMI / UTD** | **Booking Donor Sukarela Baru** (`NEW_BOOKING`) | Relawan mengambil nomor antrean donor sukarela di loket PMI. | Memperbarui daftar kuota antrean sesi. |
| | **Check-in Pendonor di Loket** (`DONOR_CHECKIN`) | Pendonor tiba di PMI dan memindai QR tiket antrean. | Memanggil nomor antrean ke bilik skrining. |
| | **Perubahan Antrean** (`QUEUE_UPDATE`) | Nomor antrean dipanggil atau dialihkan ke loket berikutnya. | Memantau layar display antrean digital. |
| | **Hasil Skrining & Pencatatan Donor** (`SCREENING_COMPLETED`) | Petugas mencatat hasil Hb, tensi, dan keberhasilan donasi (atau gagal). | Menyimpan catatan klinis donor dan riwayat relawan. |
| | **Perubahan Stok Darah** (`STOCK_LEVEL_ALERT`) | Jumlah kantong darah melewati batas aman atau mendekati ambang kritis. | Mengaktifkan imbauan donor darah massal. |
| | **Permintaan Koordinasi Antar-Faskes** (`INTER_FACILITY_REQUEST`) | Rumah sakit di Cirebon mengajukan kebutuhan drop kantong darah. | Menyetujui alokasi dan penyerahan kantong darah. |
| **E. Administrator** | **Pendaftaran Akun Institusi Baru** (`FACILITY_REGISTRATION`) | Rumah Sakit atau UTD PMI baru mendaftar di sistem. | Memvalidasi berkas Surat Izin Operasional Kemenkes. |
| | **Permintaan Verifikasi Menunggu** (`PENDING_APPROVAL_ALERT`) | Terdapat pengajuan faskes yang belum disetujui > 24 jam. | Meninjau berkas perizinan di dashboard admin. |
| | **Aktivitas Penting Sistem** (`SYSTEM_SECURITY_EVENT`) | Terdeteksi login dari IP baru atau perubahan profil sensitif. | Memeriksa audit trail keamanan sistem. |
| | **Laporan Pengaduan & Abuse** (`ABUSE_REPORT_FILED`) | Pengguna melaporkan dugaan calo darah, pungli, atau broadcast palsu. | Membuka tiket investigasi & membekukan akun jika terbukti. |
| | **Aktivitas Administratif** (`ADMIN_MAINTENANCE`) | Pembuatan snapshot database terpusat atau reset data demo. | Memastikan integritas shared datastore. |

#### Aturan Sistem Notifikasi
1. **Penerima Spesifik (*No Global Leakage*)**: Query notifikasi selalu difilter `WHERE recipientId === currentUser.id`. Dashboard A tidak pernah memuat notifikasi milik Dashboard B.
2. **Akun Multi-Kemampuan (Pendonor + Pencari)**: Pengguna umum yang mengaktifkan kedua kemampuan akan menerima notifikasi kedua layanan dalam Notification Center pribadinya dengan penanda badge kategori (*Pendonor* vs *Permintaan Pasien*).
3. **Persistensi Penuh**: Notifikasi disimpan di shared demo datastore sehingga riwayat notifikasi tetap ada setelah refresh halaman atau pergantian sesi.
4. **Indikator Unread Badge**: Counter badge merah pada lonceng notifikasi mencerminkan jumlah notifikasi `isRead === false` milik pengguna aktif.

---

### 2.3. Penambahan Fitur Laporan Rumah Sakit (Hospital Reports & Analytics)

#### A. Menu Navigasi Baru pada Dashboard Rumah Sakit
Tambahkan tab/menu **"Laporan"** di navigasi utama `HospitalDashboard.tsx` sejajar dengan *Permintaan Darah*, *Verifikasi Formulir*, dan *Penerimaan Kantong Darah*.

#### B. Empat Kategori Laporan Rumah Sakit

```
┌────────────────────────────────────────────────────────────────────────┐
│                      MODUL LAPORAN RUMAH SAKIT                         │
├────────────────────┬────────────────────┬──────────────────────────────┤
│ 1. Permintaan      │ 2. Pemenuhan       │ 3. Pendonor Terhubung        │
│    Darah           │    Darah           │    - Respons Relawan         │
│    - Periode Waktu │    - Terpenuhi     │    - Bersedia Hadir          │
│    - Golongan/Rh   │    - Sebagian      │    - Hadir di Faskes         │
│    - Komponen WB/  │    - Belum         │    - Donasi Berhasil (Resmi) │
│      PRC/TC/FFP    │    - Dibatalkan /  │    - Donasi Gagal Skrining   │
│    - Status Medis  │      Kedaluwarsa   │ 4. Aktivitas Petugas RS      │
└────────────────────┴────────────────────┴──────────────────────────────┘
```

1. **Laporan Permintaan Darah**:
   - Total volume pengajuan berdasarkan periode waktu.
   - Distribusi golongan darah (A, B, AB, O) dan rhesus (+/-).
   - Distribusi jenis komponen darah (*Whole Blood / WB*, *Packed Red Cells / PRC*, *Thrombocyte Concentrate / TC*, *Fresh Frozen Plasma / FFP*).
   - Jumlah kantong yang dibutuhkan vs status verifikasi dokter BDRS.
2. **Laporan Pemenuhan Darah**:
   - Persentase permintaan berstatus `CLOSED_FULFILLED` (terpenuhi 100%).
   - Permintaan berstatus `PARTIALLY_FULFILLED` (terpenuhi sebagian).
   - Permintaan `OPEN` / `SEARCHING` (masih mencari relawan).
   - Permintaan `CANCELLED` atau `EXPIRED` (dibatalkan keluarga/kedaluwarsa).
3. **Laporan Pendonor Terhubung (*Donor Engagement & Conversion*)**:
   - Jumlah relawan yang merespons panggilan darurat.
   - Jumlah relawan yang menyatakan komitmen bersedia hadir.
   - Jumlah relawan yang hadir secara fisik di Bank Darah RS.
   - **Jumlah Donasi yang Berhasil Dikonfirmasi BDRS** (setelah lolos uji saring Hb, tensi, dan crossmatching).
   - **Jumlah Donasi yang Tidak Dapat Dilanjutkan / Gagal Skrining** (Hb rendah, tensi tinggi, riwayat konsumsi obat, vena sulit).
   - *Prinsip Klinis Ketat*: Bersedia hadir **TIDAK SAMA** dengan donasi berhasil. Metrik keberhasilan hanya dihitung jika petugas BDRS telah menerbitkan nomor seri kantong darah sah.
4. **Laporan Aktivitas Rumah Sakit**:
   - Log riwayat verifikasi formulir permintaan oleh staf BDRS.
   - Riwayat pencatatan penerimaan kantong darah fisik.
   - Log pembaruan status dan pembatalan permintaan darurat.

#### C. Fitur Filter Periode & Aksi Ekspor PDF
- **Filter Waktu Interaktif**:
  - `Harian` (Hari ini)
  - `Mingguan` (7 hari terakhir)
  - `Bulanan` (Bulan berjalan / 30 hari terakhir)
  - `Tahunan` (Tahun berjalan)
  - `Rentang Khusus` (*Custom Date Range* dengan pemilih tanggal mulai & selesai)
- **Tombol Aksi**:
  - `Lihat Laporan`: Menampilkan pratinjau tabel analitik interaktif di dashboard dengan visualisasi ringkasan KPI.
  - `Unduh PDF`: Menghasilkan berkas PDF resmi berkualitas tinggi yang dapat diunduh langsung.
  - `Cetak Laporan`: Memicu dialog cetak (*browser print*) dengan stylesheet `@media print` teroptimasi (margin rapi, tanpa header/footer browser yang mengganggu).

#### D. Spesifikasi Tata Letak Dokumen PDF Resmi
1. **Kop Surat Resmi Fasilitas**: Memuat nama resmi faskes demo (cth: *RSUD Gunung Jati Cirebon* atau *RS Mitra Plumbon*), alamat lengkap, nomor izin operasional Kemenkes/Dinkes, nomor telepon hotline, serta logo DONORLINK berornamen Mega Mendung.
2. **Judul Laporan**: Nama laporan spesifik (cth: *Laporan Rekapitulasi Pelayanan Darah & Pemenuhan Transfusi BDRS*).
3. **Periode & Metadata**: Rentang tanggal data, tanggal dan jam pembuatan dokumen, serta nama petugas/PIC yang mencetak.
4. **Ringkasan Statistik (Executive KPI Cards)**: Total Permintaan, Kantong Terpenuhi, Tingkat Keberhasilan Donasi, Rata-rata Waktu Respons.
5. **Tabel Data Rinci**: Tabel rapi bergaris tipis (*hairline border*) dengan zebra-striping lembut, nomor urut, nomor rekam/kode permintaan, golongan darah, komponen, status, dan tanggal.
6. **Keterangan Status & Catatan Kaki Klinis**: Legenda status dan penegasan bahwa hasil akhir transfusi merupakan wewenang laboratorium BDRS.
7. **Nomor Halaman & Cap Digital**: Format *"Halaman X dari Y"* dan cap verifikasi digital BDRS.
8. **Label DATA DEMO**: Label tanda air (*watermark*) atau badge tegas bertuliskan **"DATA SIMULASI DEMO — BUKAN DOKUMEN REKAM MEDIS ASLI"** guna menjamin kepatuhan etika.
9. **Kepatuhan Privasi Pasien (UU PDP No. 27/2022)**: PDF **tidak boleh** memuat NIK pasien, nomor telepon pribadi keluarga, atau alamat rumah lengkap; identitas pasien disamarkan (cth: `Tn. S***** / Kamar 304`).

---

## 3. MASTER PLAN 6 FASE PENGEMBANGAN TERPADU

Struktur 6 fase pengembangan dipertahankan secara utuh tanpa penambahan fase ketujuh:

```
┌────────────────────────────────────────────────────────────────────────┐
│                   ROADMAP 6 FASE PENGEMBANGAN DONORLINK                │
├─────────┬──────────────────────────────────────────────────────────────┤
│ FASE 1  │ Foundation, UI/UX Design System, Skema Data Model,           │
│         │ Struktur Hak Akses Pendamping, & Recipient Notification      │
├─────────┼──────────────────────────────────────────────────────────────┤
│ FASE 2  │ Permintaan Darah Pasien, Integrasi Form Pendamping Keluarga,  │
│         │ Verifikasi BDRS RS, & Manajemen Stok Darah PMI               │
├─────────┼──────────────────────────────────────────────────────────────┤
│ FASE 3  │ Donor Sukarela (Jalur 1), Booking, Kuota, & Antrean PMI      │
├─────────┼──────────────────────────────────────────────────────────────┤
│ FASE 4  │ Komunikasi Terarah, In-App Chat, Manajemen Akses Pendamping, │
│         │ & Notifikasi Real-Time per Peran                             │
├─────────┼──────────────────────────────────────────────────────────────┤
│ FASE 5  │ Riwayat, Statistik, Modul Laporan Rumah Sakit, Filter,       │
│         │ & Ekspor PDF Resmi Berlabel DATA DEMO                        │
├─────────┼──────────────────────────────────────────────────────────────┤
│ FASE 6  │ Integrasi Seluruh Fitur, Pengujian Hak Akses RBAC, Audit     │
│         │ Trail, Validasi Laporan RS, & Finalisasi Demo Siap Uji       │
└─────────┴──────────────────────────────────────────────────────────────┘
```

### Rincian Tiap Fase

#### FASE 1: Foundation, UI/UX, Struktur Data, & Recipient-Based Notification
- **Status Saat Ini:** Fondasi dasar sudah ada; perlu pembaruan arsitektur notifikasi & tipe pendamping.
- **Pekerjaan Utama**:
  1. Memperbarui tipe data TypeScript `NotificationItem` agar mewajibkan `recipientId`, `sourceActivity`, dan `targetEntityId`.
  2. Menyempurnakan skema data `FamilyCompanion` yang tertanam (*embedded*) di dalam entitas `BloodRequest` (bukan entitas independen terpisah).
  3. Mengonfigurasi `NotificationCenter` agar memfilter notifikasi hanya untuk `currentUser.id`.
  4. Menyiapkan token dan komponen UI untuk status label **DATA DEMO**.
- **Deliverables**:
  - `src/types/index.ts` terbarui dengan skema `recipientId` dan `FamilyCompanionData`.
  - `NotificationDrawer.tsx` terisolasi per penerima.

#### FASE 2: Permintaan Darah, Integrasi Form Pendamping, & Stok PMI
- **Status Saat Ini:** Formulir permintaan darah sudah ada; perlu penyisipan sub-form pendamping opsional.
- **Pekerjaan Utama**:
  1. Menambahkan opsi checkbox pada `CreateRequestView.tsx`: *"Saya mengajukan permintaan darah untuk orang lain dan ingin menambahkan pendamping."*
  2. Menampilkan sub-form data pendamping (Nama, No HP, Hubungan, Email, Izin Akses VIEW/CHAT/CONFIRM) secara kondisional.
  3. Memastikan narahubung darurat tidak otomatis dijadikan pendamping.
  4. Menyimpan data pendamping ke dalam `BloodRequest` di shared demo datastore dengan status undangan `INVITED_PENDING_REGISTRATION` jika belum ada akun.
  5. Memicu notifikasi `NEW_REQUEST_SUBMITTED` ke Rumah Sakit terkait berdasarkan `hospitalId`.
- **Deliverables**:
  - `CreateRequestView.tsx` dengan form pendamping terintegrasi.
  - Alur verifikasi permintaan oleh BDRS RS yang memicu notifikasi `REQUEST_STATUS` ke pemohon dan pendamping.

#### FASE 3: Donor Sukarela (Jalur 1), Booking, & Antrean PMI
- **Status Saat Ini:** Modul booking PMI dan dua jalur donor sudah berfungsi; perlu integrasi notifikasi antrean spesifik ke role PMI dan Pendonor.
- **Pekerjaan Utama**:
  1. Memastikan aksi "Ambil Antrean & Konfirmasi" memicu notifikasi `NEW_BOOKING` hanya ke akun staf `UTD_PMI`.
  2. Memastikan pemanggilan antrean atau pembatalan memicu notifikasi `QUEUE_UPDATE` hanya ke `recipientId` milik pendonor yang bersangkutan.
  3. Mempertahankan penegakan antrean aktif tunggal dan kuota 20 donor/slot.
- **Deliverables**:
  - Booking antrean donor dengan notifikasi tersinkronisasi per `recipientId`.

#### FASE 4: Komunikasi Terarah, In-App Chat, & Akses Pendamping
- **Status Saat Ini:** In-App Chat sudah tersedia; perlu penyesuaian hak akses multi-user untuk Pendamping Keluarga.
- **Pekerjaan Utama**:
  1. Mengizinkan akun pendamping yang telah disetujui (memiliki izin `CHAT`) untuk membuka thread chat permohonan darah pasien.
  2. Memberikan label identitas yang jelas pada pesan obrolan: `[Pemohon]`, `[Pendamping: Hubungan]`, `[Relawan Donor]`.
  3. Mengirimkan notifikasi `CHAT_MESSAGE` ke semua pihak yang berhak dalam thread tersebut (Pemohon, Pendamping, dan Relawan), **tanpa** mengirimkannya ke pihak lain.
  4. Menyediakan tombol bagi pemohon utama untuk mencabut akses pendamping di dalam detail permintaan.
- **Deliverables**:
  - `ChatModal.tsx` mendukung partisipasi pendamping dengan indikator role transparan.
  - Logika pencabutan akses (*access revocation*) yang langsung memutus hak chat pendamping.

#### FASE 5: Riwayat, Statistik, Modul Laporan Rumah Sakit, & Ekspor PDF
- **Status Saat Ini:** Laporan PDF Admin dan PMI sudah tersedia; Modul Laporan Rumah Sakit belum lengkap.
- **Pekerjaan Utama**:
  1. Membangun antarmuka tab **"Laporan"** di `HospitalDashboard.tsx`.
  2. Mengimplementasikan 4 sub-laporan: Permintaan Darah, Pemenuhan Darah, Pendonor Terhubung, dan Aktivitas Faskes.
  3. Menambahkan komponen pemfilter periode waktu (Harian, Mingguan, Bulanan, Tahunan, Custom Range).
  4. Membangun modal pratinjau dan pencetakan PDF khusus Rumah Sakit (`HospitalReportModal.tsx`) berstandar kop surat resmi, tabel data rapi, nomor halaman, stempel digital BDRS, dan watermark **DATA DEMO**.
  5. Menjamin pemisahan klinis ketat: jumlah pendonor yang bersedia/hadir dipisahkan secara tegas dari jumlah donasi yang berhasil dikonfirmasi BDRS.
- **Deliverables**:
  - Tab Laporan di `HospitalDashboard.tsx`.
  - Komponen `HospitalReportModal.tsx` siap unduh/cetak PDF.

#### FASE 6: Integrasi Penuh, Pengujian Hak Akses, Audit, & Finalisasi Demo
- **Status Saat Ini:** Pengujian menyeluruh terhadap 3 pembaruan fitur.
- **Pekerjaan Utama**:
  1. Melakukan pengujian isolasi notifikasi (*cross-role verification*): memastikan akun Pendonor tidak melihat notifikasi RS/PMI/Admin, dan sebaliknya.
  2. Menguji alur pendamping: pendaftaran dari form permintaan, penerimaan hak akses, partisipasi chat, dan pencabutan akses oleh pemohon.
  3. Menguji modul laporan RS: perhitungan statistik, filter periode tanggal, dan kelengkapan PDF berlabel DATA DEMO.
  4. Memastikan shared demo datastore `/data/donorlink_database.json` mempertahankan data baru secara persisten.
  5. Memperbarui checklist pengujian evaluasi dosen.
- **Deliverables**:
  - Sistem DONORLINK demo yang stabil, terintegrasi penuh, bebas konflik hak akses, dan siap dievaluasi langsung oleh dosen penguji.

---

## 4. MATRIKS FITUR: SUDAH TERSEDIA VS AKAN DIKEMBANGKAN

| Modul / Fitur | Status Kesiapan | Catatan Implementasi |
| :--- | :---: | :--- |
| **Autentikasi & RBAC 5 Role** | **SUDAH TERSEDIA** | Login 1-klik akun demo, registrasi publik, isolasi 5 role aktif. |
| **Fleksibilitas Role Pengguna Umum** | **SUDAH TERSEDIA** | 1 akun dapat menjadi Pendonor sekaligus Pencari Donor. |
| **Kartu Donor Digital Mega Mendung** | **SUDAH TERSEDIA** | ID unik `DL-CRB-XXXX`, QR code, logo Mega Mendung resmi. |
| **Dua Jalur Layanan Donor** | **SUDAH TERSEDIA** | Jalur 1 (PMI Sukarela) & Jalur 2 (Permintaan Darah Pasien RS) terpisah. |
| **Booking & Antrean PMI (Jalur 1)** | **SUDAH TERSEDIA** | Validasi antrean aktif tunggal, slot kuota 20, konfirmasi sadar. |
| **Matching Algorithm ABO/Rh & Wilayah** | **SUDAH TERSEDIA** | Kompatibilitas ABO/Rh khusus Kota & Kabupaten Cirebon. |
| **In-App Chat Koordinasi** | **SUDAH TERSEDIA** | Chat internal antara pemohon dan relawan donor. |
| **Laporan Rekapitulasi Admin & PMI (PDF)** | **SUDAH TERSEDIA** | `AdministrativeReportModal.tsx` dengan kop surat & stempel. |
| **Shared Demo Datastore & Backups** | **SUDAH TERSEDIA** | Persisten di `/data/donorlink_database.json` dengan atomic write. |
| **Integrasi Pendamping di Form Request** | **AKAN DITINGKATKAN** | Memindahkan input pendamping ke dalam `CreateRequestView.tsx` sebagai opsi opsional; menyimpan status undangan. |
| **Recipient-Based Notification Center** | **AKAN DITINGKATKAN** | Menghapus penumpukan notifikasi global; memisahkan daftar notifikasi per `recipientId` untuk 5 role. |
| **Modul Laporan Rumah Sakit (BDRS)** | **AKAN DIKEMBANGKAN** | Menu Laporan di Dashboard RS, 4 kategori laporan analitik, filter harian/mingguan/bulanan/custom. |
| **Ekspor PDF Laporan Rumah Sakit** | **AKAN DIKEMBANGKAN** | Template cetak PDF resmi RS berlabel DATA DEMO dengan proteksi privasi pasien. |

---

## 5. KETERGANTUNGAN ANTARFITUR (DEPENDENCY GRAPH)

```
[Skema Data Model & Recipient ID (Fase 1)]
       │
       ├───► [Integrasi Form Permintaan Darah + Sub-Form Pendamping (Fase 2)]
       │            │
       │            ├───► [Pemberian Akses & In-App Chat Pendamping (Fase 4)]
       │            │
       │            └───► [Pencatatan Kantong Darah BDRS RS (Fase 2)]
       │                        │
       │                        └───► [Modul Laporan Rumah Sakit & Filter (Fase 5)]
       │                                     │
       │                                     └───► [Ekspor PDF Resmi RS (Fase 5)]
       │
       ├───► [Booking & Antrean Sukarela UTD PMI (Fase 3)]
       │            │
       │            └───► [Notifikasi Status Antrean per Recipient (Fase 3)]
       │
       └────────────────────────────────────────────────────────────────────────┐
                                                                                ▼
                                                                [Integrasi & Uji RBAC Penuh (Fase 6)]
```

### Analisis Ketergantungan Kritis:
1. **Modul Laporan RS bergantung pada Pencatatan Penerimaan Kantong Darah Fisik**: Laporan "Donasi Berhasil" tidak boleh membaca data komitmen awal relawan, melainkan harus membaca data transaksi kantong darah fisik yang divalidasi oleh petugas BDRS.
2. **In-App Chat Pendamping bergantung pada Penyimpanan Izin Akses Permintaan**: Pendamping hanya dapat membuka ruang obrolan jika permohonan darah memiliki data pendamping dengan izin `CHAT` yang valid.
3. **Sistem Notifikasi menjadi Tulang Punggung Lintas Fase**: Setiap kali terjadi perubahan status pada Fase 2, 3, 4, dan 5, sistem memanggil fungsi `createRecipientNotification(recipientId, ...)` yang terisolasi.

---

## 6. URUTAN PENGERJAAN YANG PALING MASUK AKAL

1. **Langkah 1 (Persiapan Tipe & Model Data - Fase 1)**:
   - Perbarui tipe `NotificationItem` dengan kolom `recipientId`, `sourceActivity`, dan `targetEntityId`.
   - Perbarui tipe `BloodRequest` untuk menampung `companionData` opsional dengan daftar izin (`VIEW`, `CHAT`, `CONFIRM`) dan status undangan.
2. **Langkah 2 (Refactoring Notification State & Filter - Fase 1)**:
   - Perbarui fungsi `addNotification` di context agar selalu menyertakan `recipientId`.
   - Filter daftar notifikasi di `NotificationDrawer.tsx` dan badge counter agar hanya menghitung `n.recipientId === currentUser.id`.
3. **Langkah 3 (Integrasi Pendamping pada Form Permintaan - Fase 2)**:
   - Tambahkan checkbox dan sub-form pendamping di `CreateRequestView.tsx`.
   - Hubungkan data pendamping ke pembuatan request baru dan kirim notifikasi `NEW_REQUEST_SUBMITTED` ke RS terkait.
4. **Langkah 4 (Dukungan Akses Pendamping di Chat & Detail Permintaan - Fase 4)**:
   - Sesuaikan `RequestDetailModal.tsx` dan `ChatModal.tsx` agar mengenali pengguna sebagai pendamping jika nomor HP/email cocok.
   - Sediakan tombol pencabutan akses pendamping bagi pemohon utama.
5. **Langkah 5 (Pembangunan Modul Laporan Rumah Sakit - Fase 5)**:
   - Tambahkan tab "Laporan" di `HospitalDashboard.tsx`.
   - Bangun komponen penyaji 4 kategori laporan (Permintaan, Pemenuhan, Pendonor Terhubung, Aktivitas Faskes) beserta kontrol filter periode tanggal.
6. **Langkah 6 (Komponen Ekspor PDF Rumah Sakit - Fase 5)**:
   - Buat komponen modal cetak `HospitalReportModal.tsx` dengan styling kop surat resmi RS, ringkasan statistik, tabel data rapi, dan watermark DATA DEMO.
7. **Langkah 7 (Audit, Validasi RBAC, & Pengujian Menyeluruh - Fase 6)**:
   - Lakukan pengujian black-box menyeluruh untuk memastikan tidak ada pencampuran notifikasi dan hak akses.

---

## 7. CHECKLIST PENGUJIAN HAK AKSES & INTEGRASI (TEST CHECKLIST)

### A. Pengujian Fitur Pendamping Keluarga
- [ ] Opsi penambahan pendamping muncul sebagai checkbox opsional di Form Permintaan Darah.
- [ ] Jika tidak dicentang, permohonan darah berhasil dibuat tanpa memerlukan data pendamping.
- [ ] Jika dicentang, seluruh field wajib (Nama, No HP, Hubungan, Izin Akses, Persetujuan) divalidasi dengan benar.
- [ ] Narahubung pasien tidak otomatis menjadi pendamping.
- [ ] Akun pendamping yang cocok hanya dapat melihat detail permohonan darah yang dibagikan kepadanya.
- [ ] Pendamping dengan izin `CHAT` dapat mengirim dan membaca pesan di ruang obrolan internal.
- [ ] Pendamping tanpa izin `CHAT` tidak dapat mengakses ruang obrolan.
- [ ] Pemohon utama dapat mencabut (*revoke*) akses pendamping kapan saja, dan akses pendamping seketika terputus.
- [ ] Sistem tidak pernah meminta atau membagikan password pendamping.

### B. Pengujian Recipient-Based Notification Center
- [ ] Akun Pendonor **hanya** menerima notifikasi: permintaan cocok, respons komitmen, pesan chat masuk, jadwal donor sukarela, dan pengingat antrean.
- [ ] Akun Pencari Donor **hanya** menerima notifikasi: respons pendonor, pesan chat masuk, perubahan status permintaan, dan informasi pemenuhan kantong darah.
- [ ] Akun Rumah Sakit **hanya** menerima notifikasi: permohonan darah baru masuk, relawan merespons, status pemenuhan kantong, update stok PMI, pengingat verifikasi tertunda, dan ekspor laporan.
- [ ] Akun PMI/UTD **hanya** menerima notifikasi: booking antrean donor baru, check-in pendonor, pemanggilan antrean, hasil skrining, perubahan stok darah, dan koordinasi antar-faskes.
- [ ] Akun Administrator **hanya** menerima notifikasi: pendaftaran faskes baru, permintaan verifikasi izin operasional, laporan abuse/calo, dan aktivitas audit sistem.
- [ ] Counter badge merah lonceng notifikasi hanya menghitung pesan belum dibaca milik pengguna aktif (`isRead === false`).
- [ ] Menandai notifikasi telah dibaca (*Mark as Read*) pada Akun A tidak memengaruhi status baca Akun B.
- [ ] Pengguna dengan dua kemampuan aktif (Pendonor + Pencari) menerima notifikasi kedua layanan dengan penanda kategori yang jelas.

### C. Pengujian Modul Laporan Rumah Sakit & Ekspor PDF
- [ ] Tab "Laporan" hanya dapat diakses oleh pengguna dengan role `HOSPITAL`. Pengguna role lain dicegat oleh Route Guard.
- [ ] Filter periode (Harian, Mingguan, Bulanan, Tahunan, Custom Range) menyaring data tabel secara akurat sesuai tanggal transaksi.
- [ ] Laporan Pendonor Terhubung membedakan secara tegas antara relawan yang menyatakan bersedia/hadir dengan donasi yang berhasil dikonfirmasi BDRS.
- [ ] Pratinjau laporan menampilkan ringkasan metrik (Total Permintaan, Terpenuhi, Dalam Proses, Donasi Berhasil).
- [ ] Tombol "Unduh PDF" dan "Cetak Laporan" menghasilkan dokumen berformat rapi, tidak terpotong saat dicetak, dan memuat kop surat resmi faskes demo.
- [ ] Dokumen PDF memuat nomor halaman, tanggal cetak, tanda tangan digital, serta label/watermark **DATA DEMO**.
- [ ] Dokumen PDF tidak menampilkan data pribadi sensitif pasien (NIK, HP pribadi, alamat lengkap disamarkan).

---
*Dokumen ini merupakan pedoman resmi pembaruan Master Development Plan DONORLINK tahap demo.*  
**DONORLINK — Menghubungkan Kebaikan, Menyelamatkan Kehidupan.**
