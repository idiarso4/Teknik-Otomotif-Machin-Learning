// Seed script untuk database Aplikasi Simulasi AI Otomotif

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Mulai seeding database...')

  // Seed data sensor sample
  console.log('📊 Menambahkan data sensor sample...')
  const sensorData = []
  const now = new Date()
  
  for (let i = 0; i < 100; i++) {
    const timestamp = new Date(now.getTime() - (i * 60000)) // Data setiap menit mundur
    sensorData.push({
      engineTemp: 85 + Math.random() * 20 - 10, // 75-95°C
      oilPressure: 4 + Math.random() * 2 - 1,   // 3-5 bar
      batteryVoltage: 12.6 + Math.random() * 1.8 - 0.9, // 11.7-13.5V
      engineVibration: 10 + Math.random() * 20 - 10, // 0-20 Hz
      rpm: 2000 + Math.random() * 1000 - 500,   // 1500-2500 RPM
      timestamp: timestamp
    })
  }

  await prisma.sensorReading.createMany({
    data: sensorData
  })

  // Seed data deteksi AI sample
  console.log('🤖 Menambahkan hasil deteksi AI sample...')
  const aiDetections = [
    {
      parameter: 'engine_temp',
      confidence: 0.95,
      status: 'normal',
      recommendation: 'Suhu mesin dalam batas normal. Lanjutkan monitoring rutin.'
    },
    {
      parameter: 'oil_pressure',
      confidence: 0.88,
      status: 'warning',
      recommendation: 'Tekanan oli sedikit rendah. Periksa level oli dan filter oli.'
    },
    {
      parameter: 'battery_voltage',
      confidence: 0.92,
      status: 'normal',
      recommendation: 'Sistem kelistrikan berfungsi dengan baik.'
    },
    {
      parameter: 'engine_vibration',
      confidence: 0.76,
      status: 'warning',
      recommendation: 'Getaran mesin sedikit tinggi. Periksa engine mounting dan balancing.'
    }
  ]

  await prisma.aIDetection.createMany({
    data: aiDetections
  })

  // Seed progress pembelajaran sample
  console.log('📚 Menambahkan progress pembelajaran sample...')
  const userProgress = [
    {
      moduleId: 'electrical-basics',
      userSession: 'user-001',
      completionPercentage: 75.0,
      quizScores: JSON.stringify([
        { questionId: 'q1', score: 8, maxScore: 10 },
        { questionId: 'q2', score: 9, maxScore: 10 },
        { questionId: 'q3', score: 7, maxScore: 10 }
      ])
    },
    {
      moduleId: 'cooling-system',
      userSession: 'user-001',
      completionPercentage: 45.0,
      quizScores: JSON.stringify([
        { questionId: 'q1', score: 6, maxScore: 10 }
      ])
    }
  ]

  await prisma.userProgress.createMany({
    data: userProgress
  })

  // Seed proyek Arduino sample
  console.log('⚡ Menambahkan proyek Arduino sample...')
  const arduinoProjects = [
    {
      name: 'Sensor Suhu Mesin',
      code: `// Sensor Suhu Mesin
#define TEMP_PIN A0

void setup() {
  Serial.begin(9600);
  Serial.println("Sensor Suhu - Siap");
}

void loop() {
  int sensorValue = analogRead(TEMP_PIN);
  float temperature = (sensorValue * 5.0 / 1024.0 - 0.5) * 100;
  
  Serial.print("Suhu: ");
  Serial.print(temperature);
  Serial.println(" °C");
  
  delay(1000);
}`,
      pinConfig: JSON.stringify([
        { pin: 0, mode: 'INPUT', value: 0, connected: true, label: 'Sensor Suhu', sensorType: 'temperature' }
      ])
    },
    {
      name: 'Monitor Tekanan Oli',
      code: `// Monitor Tekanan Oli
#define PRESSURE_PIN A1

void setup() {
  Serial.begin(9600);
  Serial.println("Monitor Tekanan Oli - Siap");
}

void loop() {
  int sensorValue = analogRead(PRESSURE_PIN);
  float pressure = (sensorValue * 5.0 / 1024.0) * 2; // Konversi ke bar
  
  Serial.print("Tekanan Oli: ");
  Serial.print(pressure);
  Serial.println(" bar");
  
  if (pressure < 1.5) {
    Serial.println("PERINGATAN: Tekanan oli rendah!");
  }
  
  delay(500);
}`,
      pinConfig: JSON.stringify([
        { pin: 1, mode: 'INPUT', value: 0, connected: true, label: 'Sensor Tekanan', sensorType: 'pressure' }
      ])
    }
  ]

  await prisma.arduinoProject.createMany({
    data: arduinoProjects
  })

  // Seed konfigurasi sistem
  console.log('⚙️ Menambahkan konfigurasi sistem...')
  const systemConfigs = [
    {
      configKey: 'sensor_sampling_rate',
      configValue: '1000',
      description: 'Frekuensi sampling sensor dalam milliseconds'
    },
    {
      configKey: 'ai_detection_threshold',
      configValue: '0.7',
      description: 'Threshold confidence untuk deteksi AI'
    },
    {
      configKey: 'data_retention_days',
      configValue: '30',
      description: 'Jumlah hari penyimpanan data sensor'
    }
  ]

  await prisma.systemConfig.createMany({
    data: systemConfigs
  })

  console.log('✅ Seeding database selesai!')
  console.log(`📊 ${sensorData.length} data sensor ditambahkan`)
  console.log(`🤖 ${aiDetections.length} hasil deteksi AI ditambahkan`)
  console.log(`📚 ${userProgress.length} progress pembelajaran ditambahkan`)
  console.log(`⚡ ${arduinoProjects.length} proyek Arduino ditambahkan`)
  console.log(`⚙️ ${systemConfigs.length} konfigurasi sistem ditambahkan`)
}

main()
  .catch((e) => {
    console.error('❌ Error saat seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })