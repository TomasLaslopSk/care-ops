package uk.co.cera.carer.theme

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

// Same palette as the web apps, expressed as a Material3 dark color scheme.
// family_app has a richer CeraTheme (typography, shapes, spacing tokens); trimmed here.
object CeraColors {
    val bg = Color(0xFF0B0F17)
    val surface = Color(0xFF121A28)
    val border = Color(0xFF243044)
    val text = Color(0xFFE7EEF9)
    val muted = Color(0xFF8AA0BD)
    val primary = Color(0xFF7C5CFF)
    val success = Color(0xFF2EC27E)
    val danger = Color(0xFFF4496D)
}

private val CeraColorScheme =
    darkColorScheme(
        primary = CeraColors.primary,
        background = CeraColors.bg,
        surface = CeraColors.surface,
        onPrimary = Color.White,
        onBackground = CeraColors.text,
        onSurface = CeraColors.text,
        error = CeraColors.danger,
    )

@Composable
fun CeraTheme(content: @Composable () -> Unit) {
    MaterialTheme(colorScheme = CeraColorScheme, content = content)
}
