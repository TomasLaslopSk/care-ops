package uk.co.cera.carer.shared.network

// Base URL differs per platform (emulator vs simulator). expect/actual is the KMP
// way to provide a platform-specific value from common code — same pattern family_app uses.
expect val apiBaseUrl: String
