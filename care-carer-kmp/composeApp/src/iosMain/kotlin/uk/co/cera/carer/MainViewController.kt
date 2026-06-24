package uk.co.cera.carer

import androidx.compose.ui.window.ComposeUIViewController
import platform.UIKit.UIViewController
import uk.co.cera.carer.app.App
import uk.co.cera.carer.di.initKoin

// Koin starts once, the first time iOS asks for the view controller.
private val koinStarted: Boolean by lazy {
    initKoin()
    true
}

@Suppress("FunctionName", "unused")
fun MainViewController(): UIViewController {
    koinStarted
    return ComposeUIViewController { App() }
}
