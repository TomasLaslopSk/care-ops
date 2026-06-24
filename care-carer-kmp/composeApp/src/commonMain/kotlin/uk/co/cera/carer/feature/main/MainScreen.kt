package uk.co.cera.carer.feature.main

import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import org.koin.compose.koinInject
import uk.co.cera.carer.feature.schedule.ScheduleScreen
import uk.co.cera.carer.feature.visits.VisitsScreen
import uk.co.cera.carer.shared.auth.AuthRepository
import uk.co.cera.carer.theme.BrandLogo

// Tabbed shell shown after login: Home (next visits) + Schedule (day calendar).
// Visit detail and Chat are pushed on top as full-screen routes by the nav graph.
@Composable
fun MainScreen(
    onOpenVisit: (String) -> Unit,
    onOpenChat: () -> Unit,
    onLogout: () -> Unit,
) {
    var tab by remember { mutableStateOf(0) }
    val auth = koinInject<AuthRepository>()

    Scaffold(
        bottomBar = {
            NavigationBar {
                NavigationBarItem(
                    selected = tab == 0,
                    onClick = { tab = 0 },
                    icon = { Text("🏠") },
                    label = { Text("Home") },
                )
                NavigationBarItem(
                    selected = tab == 1,
                    onClick = { tab = 1 },
                    icon = { Text("🗓") },
                    label = { Text("Schedule") },
                )
            }
        },
    ) { innerPadding ->
        Column(Modifier.fillMaxSize().padding(innerPadding)) {
            Row(
                modifier = Modifier.fillMaxWidth().padding(start = 16.dp, end = 8.dp, top = 12.dp, bottom = 4.dp),
                verticalAlignment = Alignment.CenterVertically,
            ) {
                BrandLogo()
                Spacer(Modifier.weight(1f))
                TextButton(onClick = {
                    auth.logout()
                    onLogout()
                }) { Text("Log out") }
            }
            Box(Modifier.fillMaxSize().weight(1f)) {
                when (tab) {
                    0 -> VisitsScreen(onOpenVisit = onOpenVisit, onOpenChat = onOpenChat)
                    else -> ScheduleScreen(onOpenVisit = onOpenVisit)
                }
            }
        }
    }
}
