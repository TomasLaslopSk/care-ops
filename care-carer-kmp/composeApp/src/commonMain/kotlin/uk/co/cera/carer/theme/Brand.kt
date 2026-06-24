package uk.co.cera.carer.theme

import androidx.compose.foundation.layout.Row
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight

// Wordmark mirroring the web console's "CareOps": "Care" in the text colour and the
// suffix in the brand purple. Mobile uses "CareApp".
@Composable
fun BrandLogo(modifier: Modifier = Modifier) {
    Row(modifier) {
        Text(
            "Care",
            style = MaterialTheme.typography.titleLarge,
            fontWeight = FontWeight.Bold,
            color = MaterialTheme.colorScheme.onBackground,
        )
        Text(
            "App",
            style = MaterialTheme.typography.titleLarge,
            fontWeight = FontWeight.Bold,
            color = MaterialTheme.colorScheme.primary,
        )
    }
}
