# Integrasi Wokwi Simulator

## Overview

Aplikasi Simulasi AI Otomotif SMK Negeri 1 Punggelan telah diintegrasikan dengan **Wokwi Simulator** untuk memberikan pengalaman hands-on yang lebih realistis dalam pembelajaran Arduino dan sistem otomotif.

## Fitur Integrasi Wokwi

### 1. **Embedded Wokwi Projects**
- Proyek Arduino yang sudah dikonfigurasi untuk sistem otomotif
- Kode lengkap dengan komentar dalam Bahasa Indonesia
- Diagram rangkaian yang sudah siap pakai
- Library dependencies yang sudah ditentukan

### 2. **Learning Module Integration**
- Wokwi simulator terintegrasi langsung dalam modul pembelajaran
- Objektif pembelajaran yang terstruktur
- Progress tracking untuk setiap proyek
- Panduan step-by-step untuk setiap simulasi

### 3. **Project Gallery**
- Koleksi proyek Arduino untuk berbagai sistem otomotif
- Filter berdasarkan kategori dan tingkat kesulitan
- Search functionality untuk mencari proyek spesifik
- Statistik proyek dan progress tracking

## Proyek Wokwi yang Tersedia

### 1. **Engine Temperature Monitor**
- **Kategori**: Cooling System
- **Tingkat**: Beginner
- **Komponen**: DS18B20, LCD 16x2, LED, Buzzer
- **Objektif**:
  - Connect DS18B20 temperature sensor
  - Display temperature on LCD
  - Implement warning system with LED and buzzer
  - Understand temperature sensor calibration

### 2. **Oil Pressure Monitoring System**
- **Kategori**: Fuel System
- **Tingkat**: Intermediate
- **Komponen**: Analog Pressure Sensor, Servo Motor, LCD, LED, Buzzer
- **Objektif**:
  - Read analog pressure sensor
  - Convert ADC values to pressure units
  - Display pressure on analog gauge
  - Implement low pressure warning

### 3. **Battery Voltage Monitoring**
- **Kategori**: Electrical System
- **Tingkat**: Beginner
- **Komponen**: Voltage Divider, LCD, LEDs, Buzzer
- **Objektif**:
  - Implement voltage divider circuit
  - Read and calibrate voltage measurements
  - Display voltage on LCD
  - Indicate charging status with LEDs

## Cara Menggunakan

### 1. **Akses Melalui Learning Module**
```
1. Buka tab "Modul Pembelajaran"
2. Pilih modul yang diinginkan (contoh: "Sistem Kelistrikan Otomotif")
3. Navigasi ke section "Praktik dengan Wokwi Simulator"
4. Klik "Buka di Wokwi" untuk memulai simulasi
```

### 2. **Akses Melalui Wokwi Gallery**
```
1. Buka tab "Proyek Wokwi"
2. Browse atau search proyek yang diinginkan
3. Filter berdasarkan kategori atau tingkat kesulitan
4. Klik "Mulai Proyek" untuk memulai
```

### 3. **Langkah-langkah Simulasi**
```
1. Klik "Buka di Wokwi" - simulator akan terbuka di tab baru
2. Copy kode Arduino dari aplikasi
3. Paste kode ke Wokwi editor
4. Tambahkan komponen sesuai diagram
5. Hubungkan komponen sesuai konfigurasi pin
6. Jalankan simulasi dan amati hasilnya
7. Centang objektif pembelajaran yang tercapai
```

## Struktur Proyek Wokwi

### Code Structure
```cpp
// Header dengan informasi proyek
#include <Library1.h>
#include <Library2.h>

// Pin definitions
#define SENSOR_PIN A0
#define OUTPUT_PIN 13

// Setup function
void setup() {
  // Initialization code
}

// Main loop
void loop() {
  // Main program logic
}
```

### Diagram Structure
```json
{
  "version": 1,
  "author": "SMK Negeri 1 Punggelan",
  "editor": "wokwi",
  "parts": [
    // Component definitions
  ],
  "connections": [
    // Wiring connections
  ]
}
```

## Komponen yang Didukung

### Input Components
- **DS18B20** - Temperature sensor
- **Analog Joystick** - Pressure simulation
- **Potentiometer** - Voltage simulation
- **Push Buttons** - User input

### Output Components
- **LCD 16x2** - Data display
- **LEDs** - Status indicators
- **Servo Motors** - Analog gauges
- **Buzzer** - Audio alerts

### Processing
- **Arduino Uno** - Main microcontroller
- **Arduino Nano** - Compact version

## Libraries yang Digunakan

### Core Libraries
- `LiquidCrystal` - LCD display control
- `Servo` - Servo motor control
- `OneWire` - DS18B20 communication
- `DallasTemperature` - Temperature sensor library

### Installation
Libraries akan otomatis tersedia di Wokwi, tidak perlu instalasi manual.

## Tips Penggunaan

### 1. **Optimasi Simulasi**
- Gunakan delay yang wajar (1000ms) untuk monitoring
- Implementasi threshold yang realistis
- Tambahkan serial output untuk debugging

### 2. **Best Practices**
- Selalu inisialisasi serial communication
- Gunakan konstanta untuk pin definitions
- Implementasi error handling untuk sensor readings
- Tambahkan komentar yang jelas

### 3. **Troubleshooting**
- Pastikan semua koneksi sudah benar
- Cek pin definitions sesuai dengan diagram
- Verifikasi library dependencies
- Gunakan serial monitor untuk debugging

## Pengembangan Lebih Lanjut

### Menambah Proyek Baru
1. Buat kode Arduino dengan struktur yang konsisten
2. Definisikan diagram rangkaian dalam format JSON
3. Tentukan objektif pembelajaran yang jelas
4. Tambahkan ke array `WOKWI_PROJECTS`

### Kustomisasi
- Sesuaikan threshold values dengan kondisi real
- Tambahkan fitur kalibrasi sensor
- Implementasi data logging
- Integrasi dengan sistem AI detection

## Resources

### Wokwi Documentation
- [Wokwi Official Docs](https://docs.wokwi.com/)
- [Arduino Reference](https://www.arduino.cc/reference/en/)
- [Component Library](https://docs.wokwi.com/parts/)

### SMK Learning Resources
- Modul pembelajaran terintegrasi dalam aplikasi
- Video tutorial (akan ditambahkan)
- Panduan troubleshooting
- Forum diskusi siswa

## Support

Untuk bantuan teknis atau pertanyaan mengenai integrasi Wokwi:
- Hubungi guru pembimbing
- Gunakan forum diskusi dalam aplikasi
- Dokumentasi lengkap tersedia di aplikasi

---

**Catatan**: Integrasi Wokwi ini dirancang khusus untuk mendukung pembelajaran sistem otomotif di SMK Negeri 1 Punggelan dengan pendekatan hands-on yang praktis dan interaktif.
