package uk.co.cera.carer.util

import kotlinx.datetime.LocalDate
import kotlinx.datetime.TimeZone
import kotlinx.datetime.toLocalDateTime
import kotlin.time.Clock
import kotlin.time.Instant

private val systemTz get() = TimeZone.currentSystemDefault()

// Today's local date — used as the default selection in the schedule calendar.
fun today(): LocalDate = Clock.System.now().toLocalDateTime(systemTz).date

// True if the visit's start is now or in the future (drives "My next visits").
fun isUpcoming(iso: String?): Boolean {
    if (iso.isNullOrBlank()) return false
    return runCatching { Instant.parse(iso) >= Clock.System.now() }.getOrDefault(false)
}

// The local calendar date of an ISO instant — used to group visits by day.
fun localDateOf(iso: String?): LocalDate? {
    if (iso.isNullOrBlank()) return null
    return runCatching { Instant.parse(iso).toLocalDateTime(systemTz).date }.getOrNull()
}

// Local "HH:mm" for a visit's time within a day.
fun formatTime(iso: String?): String {
    if (iso.isNullOrBlank()) return "—"
    return runCatching {
        Instant.parse(iso).toLocalDateTime(systemTz).toString().substringAfter("T").take(5)
    }.getOrDefault("—")
}

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
