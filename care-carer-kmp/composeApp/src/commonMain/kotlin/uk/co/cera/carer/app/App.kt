package uk.co.cera.carer.app

import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.safeDrawingPadding
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.navigation.compose.rememberNavController
import uk.co.cera.carer.app.navigation.AppGraph
import uk.co.cera.carer.theme.CeraTheme

@Composable
fun App() {
    CeraTheme {
        val navController = rememberNavController()
        // Surface (not a bare Box) paints the background AND sets LocalContentColor to
        // onBackground — without it, Material3's default content color is black, which made
        // unstyled Text render black-on-dark. safeDrawingPadding keeps content clear of the
        // status bar / notch / nav bar.
        Surface(
            modifier = Modifier.fillMaxSize(),
            color = MaterialTheme.colorScheme.background,
        ) {
            Box(Modifier.fillMaxSize().safeDrawingPadding()) {
                AppGraph(navController = navController)
            }
        }
    }
}
