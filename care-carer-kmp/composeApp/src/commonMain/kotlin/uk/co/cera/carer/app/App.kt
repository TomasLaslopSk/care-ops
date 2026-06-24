package uk.co.cera.carer.app

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.safeDrawingPadding
import androidx.compose.material3.MaterialTheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.navigation.compose.rememberNavController
import uk.co.cera.carer.app.navigation.AppGraph
import uk.co.cera.carer.theme.CeraTheme

@Composable
fun App() {
    CeraTheme {
        val navController = rememberNavController()
        // safeDrawingPadding keeps content clear of the status bar / notch / nav bar,
        // so the back button and chat list aren't tucked under the system clock.
        Box(
            Modifier
                .fillMaxSize()
                .background(MaterialTheme.colorScheme.background)
                .safeDrawingPadding(),
        ) {
            AppGraph(navController = navController)
        }
    }
}
