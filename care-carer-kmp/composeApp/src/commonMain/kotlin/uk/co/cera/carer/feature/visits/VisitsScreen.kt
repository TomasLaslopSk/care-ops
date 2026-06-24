package uk.co.cera.carer.feature.visits

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.Card
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import org.koin.compose.viewmodel.koinViewModel
import uk.co.cera.carer.shared.network.dto.Visit
import uk.co.cera.carer.util.formatDateTime
import uk.co.cera.carer.util.isUpcoming

@Composable
fun VisitsScreen(
    onOpenVisit: (String) -> Unit,
    onOpenChat: () -> Unit,
    viewModel: VisitsViewModel = koinViewModel(),
) {
    val state by viewModel.state.collectAsStateWithLifecycle()

    when {
        state.loading ->
            Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) { CircularProgressIndicator() }
        state.error != null ->
            Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                Text(state.error!!, color = MaterialTheme.colorScheme.error)
            }
        else -> {
            // Only future visits — past ones live in the Schedule calendar.
            val upcoming = state.visits.filter { isUpcoming(it.scheduledAt) }.sortedBy { it.scheduledAt }
            LazyColumn(
                modifier = Modifier.fillMaxSize().padding(16.dp),
                verticalArrangement = Arrangement.spacedBy(8.dp),
            ) {
                item {
                    Row(
                        modifier = Modifier.fillMaxWidth().padding(bottom = 8.dp),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically,
                    ) {
                        Text("My next visits (${upcoming.size})", style = MaterialTheme.typography.titleLarge)
                        OutlinedButton(onClick = onOpenChat) { Text("Chat") }
                    }
                }
                if (upcoming.isEmpty()) {
                    item {
                        Text(
                            "No upcoming visits.",
                            style = MaterialTheme.typography.bodyMedium,
                            color = MaterialTheme.colorScheme.onSurfaceVariant,
                        )
                    }
                }
                items(upcoming) { VisitRow(it, onClick = { onOpenVisit(it.id) }) }
            }
        }
    }
}

@Composable
private fun VisitRow(v: Visit, onClick: () -> Unit) {
    Card(modifier = Modifier.fillMaxWidth().clickable(onClick = onClick)) {
        Column(Modifier.padding(14.dp)) {
            Text(v.client, style = MaterialTheme.typography.titleMedium)
            Text(
                "${formatDateTime(v.scheduledAt)} · ${v.durationMin} min · ${v.status.replace("_", " ")}",
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
            )
        }
    }
}
