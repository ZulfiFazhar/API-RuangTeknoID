# API-RuangTeknoID

API-RuangTeknoID adalah backend server untuk aplikasi Ruang Tekno ID.

## Instalasi

1. Clone repository ini:

   ```bash
   git clone https://github.com/ZulfiFazhar/API-RuangTeknoID.git
   cd API-RuangTeknoID
   ```

2. Install dependencies

   ```bash
   npm install
   ```

3. Salin file `.env.example` menjadi `.env` untuk development dan `.env.production` untuk deployment

   ```bash
   cp .env.example .env
   ```

4. Konfigurasi file `.env` dengan informasi database dan konfigurasi lainnya.

## Menjalankan Server

Untuk menjalankan server yang terhubung ke database local

```bash
npm run dev
```

Untuk menjalankan server yang terhubung ke database server

```bash
npm start
```

## Struktur Folder

```
API-RuangTeknoID/
├── config/         # Konfigurasi database dan lainnya
├── controllers/    # Logika bisnis dan kontroler
├── middlewares/    # Middleware untuk aplikasi
├── models/         # Model database
├── routes/         # Routes API
├── utils/          # Utilitas dan alat bantu
├── .env            # File konfigurasi lingkungan
├── .env.example    # Contoh file konfigurasi env
├── .env.production # File konfigurasi env production
├── .gitignore      # File untuk mengabaikan file dan
direktori tertentu di Git
├── index.js        # File utama untuk menjalankan server
├── package-lock.json # File kunci dependensi npm
├── package.json    # File konfigurasi npm
└── README.md       # Dokumentasi

```
