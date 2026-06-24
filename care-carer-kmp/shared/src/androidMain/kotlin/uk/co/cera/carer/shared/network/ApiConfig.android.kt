package uk.co.cera.carer.shared.network

// Android emulator reaches the host machine's localhost via 10.0.2.2.
// For a real device, change this to your Mac's LAN IP (e.g. http://192.168.0.42:3001/api).
actual val apiBaseUrl: String = "http://10.0.2.2:3001/api"
