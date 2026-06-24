package uk.co.cera.carer.di

import org.koin.core.context.startKoin
import org.koin.dsl.KoinAppDeclaration
import uk.co.cera.carer.shared.di.sharedModule

// Single entry point that starts Koin with both modules. Android passes androidContext
// via the appDeclaration; iOS calls it with no extra config.
fun initKoin(appDeclaration: KoinAppDeclaration = {}) =
    startKoin {
        appDeclaration()
        modules(sharedModule, appModule)
    }
