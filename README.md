# 🚗 Simulasi AI Otomotif - SMK Negeri 1 Punggelan

Aplikasi web interaktif untuk pembelajaran sistem otomotif dengan integrasi AI detection, Arduino simulation, dan **Wokwi hands-on practice**.

![Next.js](https://img.shields.io/badge/Next.js-15.4.5-black)
![React](https://img.shields.io/badge/React-18-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-cyan)
![Wokwi](https://img.shields.io/badge/Wokwi-Integrated-green)

## 🚀 Fitur Utama

### 1. **Dashboard Real-time**
- Monitoring sensor otomotif secara real-time
- Visualisasi data dengan charts interaktif (line, gauge, histogram)
- Status indicators dengan color-coding
- Theme switching (light/dark mode)

### 2. **AI Detection System**
- Deteksi kesalahan menggunakan algoritma Random Forest
- Confidence scoring untuk setiap deteksi
- Rekomendasi perbaikan yang detail
- Riwayat hasil deteksi dengan filtering
- Konfigurasi model AI yang dapat disesuaikan

### 3. **Arduino IDE Simulator**
- Code editor dengan syntax highlighting
- Pin configuration untuk Arduino Uno/Nano
- Compilation simulation dengan error detection
- Serial monitor untuk debugging
- Project management system

### 4. **Learning Module System**
- Modul pembelajaran interaktif untuk sistem otomotif
- Progress tracking dengan achievements
- Simulasi terintegrasi dalam pembelajaran
- Code examples dengan syntax highlighting

### 5. **🆕 Wokwi Integration**
- **Embedded Wokwi Simulator** untuk praktik hands-on
- **3+ Proyek Arduino** siap pakai untuk sistem otomotif
- **Interactive Learning** dengan objektif terstruktur
- **Project Gallery** dengan filter dan search
- **Real Hardware Simulation** menggunakan Wokwi.com

### 6. **Responsive Design**
- Desktop dan mobile friendly
- Tab navigation dan sidebar navigation
- Toast notifications
- Dark/light theme support

## 🔧 Proyek Wokwi yang Tersedia

### 1. **Engine Temperature Monitor**
- **Sistem**: Pendingin Mesin
- **Level**: Pemula
- **Komponen**: DS18B20, LCD 16x2, LED, Buzzer
- **Fitur**: Real-time temperature monitoring dengan warning system

### 2. **Oil Pressure Monitoring**
- **Sistem**: Bahan Bakar & Pelumasan
- **Level**: Menengah
- **Komponen**: Analog Sensor, Servo Gauge, LCD, Alert System
- **Fitur**: Pressure monitoring dengan analog gauge display

### 3. **Battery Voltage Monitor**
- **Sistem**: Kelistrikan
- **Level**: Pemula
- **Komponen**: Voltage Divider, LCD, Status LEDs
- **Fitur**: Battery health monitoring dengan charging status

## 🛠️ Teknologi

- **Frontend**: Next.js 15, React 18, TypeScript
- **UI Framework**: Tailwind CSS, Radix UI
- **Charts**: Recharts untuk visualisasi data
- **Code Editor**: Monaco Editor untuk Arduino IDE
- **Simulator**: Wokwi.com integration
- **State Management**: React hooks dan context
- **Theme**: next-themes untuk dark/light mode

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm atau yarn

### Installation

1. **Clone repository**
```bash
git clone https://github.com/your-repo/simulasi-ai-otomotif.git
cd simulasi-ai-otomotif
```

2. **Install dependencies**
```bash
npm install
```

3. **Run development server**
```bash
npm run dev
```

4. **Open browser**
```
http://localhost:3202
```

## 📚 Cara Menggunakan Wokwi Integration

### 1. **Akses Melalui Learning Module**
1. Buka tab **"Modul Pembelajaran"**
2. Pilih modul (contoh: "Sistem Kelistrikan Otomotif")
3. Navigasi ke section **"Praktik dengan Wokwi Simulator"**
4. Klik **"Buka di Wokwi"** untuk memulai simulasi

### 2. **Akses Melalui Wokwi Gallery**
1. Buka tab **"Proyek Wokwi"**
2. Browse atau search proyek yang diinginkan
3. Filter berdasarkan kategori atau tingkat kesulitan
4. Klik **"Mulai Proyek"** untuk memulai

### 3. **Langkah Simulasi**
1. **Copy kode** Arduino dari aplikasi
2. **Buka Wokwi** di tab baru
3. **Paste kode** ke Wokwi editor
4. **Tambahkan komponen** sesuai diagram
5. **Hubungkan rangkaian** sesuai pin configuration
6. **Jalankan simulasi** dan amati hasilnya
7. **Centang objektif** pembelajaran yang tercapai

## 📖 Dokumentasi

- [Wokwi Integration Guide](docs/WOKWI_INTEGRATION.md)
- [Arduino Projects Documentation](docs/ARDUINO_PROJECTS.md)
- [Learning Module Structure](docs/LEARNING_MODULES.md)
- [AI Detection System](docs/AI_DETECTION.md)

## 🎯 Target Pembelajaran

### Sistem Kelistrikan
- Monitoring voltase baterai
- Sistem charging dan alternator
- Troubleshooting kelistrikan

### Sistem Pendingin
- Temperature monitoring
- Thermostat operation
- Cooling fan control

### Sistem Bahan Bakar
- Pressure monitoring
- Fuel injection basics
- System diagnostics

### Analisis Getaran
- Vibration analysis
- Engine health monitoring
- Predictive maintenance

## 🏫 Untuk Pendidik

### Fitur Khusus Guru
- **Progress tracking** siswa
- **Achievement system** untuk motivasi
- **Customizable modules** sesuai kurikulum
- **Real-time monitoring** aktivitas siswa

### Integrasi Kurikulum
- Sesuai dengan kurikulum SMK Otomotif
- Hands-on learning approach
- Theory + Practice combination
- Industry-relevant skills

## 🤝 Contributing

Kontribusi sangat diterima! Silakan:

1. Fork repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

## 👥 Tim Pengembang

- **SMK Negeri 1 Punggelan** - Konsep dan Requirements
- **AI Development Team** - Implementation dan Integration

## 📞 Support

- **Email**: support@smkn1punggelan.sch.id
- **Website**: [SMK Negeri 1 Punggelan](https://smkn1punggelan.sch.id)
- **Documentation**: [Docs](docs/)

---

**🎓 Dibuat khusus untuk mendukung pembelajaran sistem otomotif di SMK Negeri 1 Punggelan dengan pendekatan hands-on yang praktis dan interaktif.**
