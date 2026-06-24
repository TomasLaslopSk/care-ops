package uk.co.cera.carer.util

import kotlinx.datetime.TimeZone
import kotlinx.datetime.toLocalDateTime
import kotlin.time.Instant

// Formats an ISO-8601 instant (e.g. "2026-06-22T15:38:40.088Z") into a readable
// local "dd/MM HH:mm". Uses kotlinx-datetime only for the timezone conversion, then
// reformats from the (stable) ISO local string — avoids version-specific field APIs.
fun formatDateTime(iso: String?): String {
    if (iso.isNullOrBlank()) return "—"
    return runCatching {
        // local looks like "2026-06-23T09:00" or "2026-06-23T09:00:00"
        val local = Instant.parse(iso).toLocalDateTime(TimeZone.currentSystemDefault()).toString()
        val (date, time) = local.split("T")
        val parts = date.split("-") // [year, month, day]
        val hhmm = time.take(5) // "HH:mm"
        "${parts[2]}/${parts[1]} $hhmm"
    }.getOrDefault(iso)
}
