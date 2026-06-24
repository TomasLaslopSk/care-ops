package uk.co.cera.carer.feature.schedule

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Card
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import kotlinx.datetime.DatePeriod
import kotlinx.datetime.LocalDate
import kotlinx.datetime.minus
import kotlinx.datetime.plus
import org.koin.compose.viewmodel.koinViewModel
import uk.co.cera.carer.feature.visits.VisitsViewModel
import uk.co.cera.carer.shared.network.dto.Visit
import uk.co.cera.carer.util.formatTime
import uk.co.cera.carer.util.localDateOf
import uk.co.cera.carer.util.today

// A by-day calendar for the signed-in carer: a week strip (tap a day, page weeks)
// shows that day's visits — past or future — so carers can review history too.
@Composable
fun ScheduleScreen(
    onOpenVisit: (String) -> Unit,
    viewModel: VisitsViewModel = koinViewModel(),
) {
    val state by viewModel.state.collectAsStateWithLifecycle()
    var selectedDate by remember { mutableStateOf(today()) }
    val weekStart = selectedDate.minus(DatePeriod(days = selectedDate.dayOfWeek.ordinal))

    Column(Modifier.fillMaxSize().padding(16.dp)) {
        Text("Schedule", style = MaterialTheme.typography.titleLarge)
        Spacer(Modifier.height(12.dp))

        Row(verticalAlignment = Alignment.CenterVertically, modifier = Modifier.fillMaxWidth()) {
            OutlinedButton(onClick = { selectedDate = selectedDate.minus(DatePeriod(days = 7)) }) { Text("‹") }
            Text(
                weekLabel(weekStart),
                style = MaterialTheme.typography.titleSmall,
                textAlign = TextAlign.Center,
                modifier = Modifier.weight(1f),
            )
            OutlinedButton(onClick = { selectedDate = selectedDate.plus(DatePeriod(days = 7)) }) { Text("›") }
        }

        Spacer(Modifier.height(8.dp))
        Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(4.dp)) {
            for (i in 0..6) {
                val day = weekStart.plus(DatePeriod(days = i))
                DayChip(
                    day = day,
                    selected = day == selectedDate,
                    isToday = day == today(),
                    hasVisits = state.visits.any { localDateOf(it.scheduledAt) == day },
                    onClick = { selectedDate = day },
                    modifier = Modifier.weight(1f),
                )
            }
        }

        Spacer(Modifier.height(12.dp))
        Row(verticalAlignment = Alignment.CenterVertically, modifier = Modifier.fillMaxWidth()) {
            Text(dayLabel(selectedDate), style = MaterialTheme.typography.titleMedium)
            Spacer(Modifier.weight(1f))
            TextButton(onClick = { selectedDate = today() }) { Text("Today") }
        }
        Spacer(Modifier.height(4.dp))

        when {
            state.loading ->
                Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) { CircularProgressIndicator() }
            state.error != null ->
                Text(state.error!!, color = MaterialTheme.colorScheme.error)
            else -> {
                val dayVisits = state.visits
                    .filter { localDateOf(it.scheduledAt) == selectedDate }
                    .sortedBy { it.scheduledAt }
                if (dayVisits.isEmpty()) {
                    Text(
                        "No visits on this day.",
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                        modifier = Modifier.padding(top = 16.dp),
                    )
                } else {
                    LazyColumn(
                        modifier = Modifier.fillMaxSize(),
                        verticalArrangement = Arrangement.spacedBy(8.dp),
                    ) {
                        items(dayVisits) { v -> ScheduleRow(v, onClick = { onOpenVisit(v.id) }) }
                    }
                }
            }
        }
    }
}

@Composable
private fun DayChip(
    day: LocalDate,
    selected: Boolean,
    isToday: Boolean,
    hasVisits: Boolean,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
) {
    val parts = day.toString().split("-") // [yyyy, mm, dd]
    val bg = if (selected) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.surfaceVariant
    val fg = if (selected) MaterialTheme.colorScheme.onPrimary else MaterialTheme.colorScheme.onSurface
    Column(
        modifier = modifier
            .clip(RoundedCornerShape(10.dp))
            .background(bg)
            .clickable(onClick = onClick)
            .padding(vertical = 8.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
    ) {
        Text(day.dayOfWeek.name.take(3), style = MaterialTheme.typography.labelSmall, color = fg)
        Text(
            parts[2],
            style = MaterialTheme.typography.titleMedium,
            color = fg,
            fontWeight = if (isToday) FontWeight.Bold else FontWeight.Normal,
        )
        Text(if (hasVisits) "•" else " ", style = MaterialTheme.typography.labelSmall, color = fg)
    }
}

@Composable
private fun ScheduleRow(v: Visit, onClick: () -> Unit) {
    Card(modifier = Modifier.fillMaxWidth().clickable(onClick = onClick)) {
        Row(Modifier.padding(14.dp), verticalAlignment = Alignment.CenterVertically) {
            Text(formatTime(v.scheduledAt), style = MaterialTheme.typography.titleMedium)
            Spacer(Modifier.width(12.dp))
            Column {
                Text(v.client, style = MaterialTheme.typography.titleSmall)
                Text(
                    "${v.durationMin} min · ${v.status.replace("_", " ")}",
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                )
            }
        }
    }
}

private fun dayLabel(date: LocalDate): String {
    val parts = date.toString().split("-")
    val weekday = date.dayOfWeek.name.lowercase().replaceFirstChar { it.uppercase() }
    return "$weekday ${parts[2]}/${parts[1]}"
}

private fun weekLabel(weekStart: LocalDate): String {
    val parts = weekStart.toString().split("-")
    return "Week of ${parts[2]}/${parts[1]}/${parts[0]}"
}
