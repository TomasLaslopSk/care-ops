package uk.co.cera.carer.feature.visitdetail

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material3.Button
import androidx.compose.material3.Checkbox
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import org.koin.compose.viewmodel.koinViewModel
import org.koin.core.parameter.parametersOf
import uk.co.cera.carer.util.formatDateTime

@Composable
fun VisitDetailScreen(
    visitId: String,
    onBack: () -> Unit,
    viewModel: VisitDetailViewModel = koinViewModel { parametersOf(visitId) },
) {
    val state by viewModel.state.collectAsStateWithLifecycle()
    val v = state.visit

    Column(
        modifier = Modifier.fillMaxSize().verticalScroll(rememberScrollState()).padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp),
    ) {
        OutlinedButton(onClick = onBack) { Text("← Back") }

        if (state.loading) {
            Text("Loading…")
            return@Column
        }
        if (v == null) {
            Text(state.error ?: "Not found", color = MaterialTheme.colorScheme.error)
            return@Column
        }

        // Gated flow: check in -> fill report -> check out.
        val checkedIn = v.checkInAt != null
        val checkedOut = v.checkOutAt != null
        val hasReport = !v.report.isNullOrBlank()
        val reportEditable = state.canAct && checkedIn && !checkedOut

        Text(v.client, style = MaterialTheme.typography.headlineSmall)
        Text("Visit ${v.id}", style = MaterialTheme.typography.bodyMedium, color = MaterialTheme.colorScheme.onSurfaceVariant)
        Text("Scheduled: ${formatDateTime(v.scheduledAt)} · ${v.durationMin} min")
        Text("Status: ${v.status.replace("_", " ")}")
        Text("Checked in: ${formatDateTime(v.checkInAt)}")
        Text("Checked out: ${formatDateTime(v.checkOutAt)}")
        Text("Address: ${v.clientAddress}")

        // Tasks the carer ticks off during the visit (editable after check-in).
        if (v.tasks.isNotEmpty()) {
            Text("Tasks", style = MaterialTheme.typography.titleMedium)
            v.tasks.forEach { task ->
                Row(verticalAlignment = androidx.compose.ui.Alignment.CenterVertically, modifier = Modifier.fillMaxWidth()) {
                    Checkbox(
                        checked = task.done,
                        onCheckedChange = { viewModel.toggleTask(task.id, it) },
                        enabled = reportEditable,
                    )
                    Text(task.label)
                }
            }
        }

        OutlinedTextField(
            value = state.report,
            onValueChange = viewModel::onReportChange,
            label = { Text("Visit report") },
            enabled = reportEditable,
            placeholder = { Text(if (checkedIn) "Write the visit report…" else "Check in first") },
            modifier = Modifier.fillMaxWidth(),
            minLines = 3,
        )

        if (state.canAct) {
            // 1) Check in (only before check-in)
            Button(onClick = viewModel::checkIn, enabled = !checkedIn, modifier = Modifier.fillMaxWidth()) {
                Text("Check in")
            }

            // 2) Save report (only after check-in, before check-out, needs text)
            OutlinedButton(
                onClick = viewModel::saveReport,
                enabled = reportEditable && state.report.isNotBlank(),
                modifier = Modifier.fillMaxWidth(),
            ) {
                Text("Save report")
            }

            // 3) Check out (only after a report is saved)
            Button(
                onClick = viewModel::checkOut,
                enabled = checkedIn && !checkedOut && hasReport,
                modifier = Modifier.fillMaxWidth(),
            ) {
                Text("Check out")
            }

            val hint = when {
                !checkedIn -> "Check in to start the visit."
                checkedOut -> "Visit completed."
                !hasReport -> "Save a report, then you can check out."
                else -> "Ready to check out."
            }
            Text(hint, style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
        } else {
            Text(
                "Read-only — only the assigned carer can check in/out.",
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
            )
        }
    }
}
