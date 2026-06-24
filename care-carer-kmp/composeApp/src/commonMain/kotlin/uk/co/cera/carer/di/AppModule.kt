package uk.co.cera.carer.di

import org.koin.core.module.dsl.viewModel
import org.koin.dsl.module
import uk.co.cera.carer.feature.chat.ChatViewModel
import uk.co.cera.carer.feature.login.LoginViewModel
import uk.co.cera.carer.feature.visitdetail.VisitDetailViewModel
import uk.co.cera.carer.feature.visits.VisitsViewModel

// ViewModels for the UI layer (same viewModel { } DSL as family_app's AppModule).
val appModule =
    module {
        viewModel { LoginViewModel(authRepository = get()) }
        viewModel { VisitsViewModel(visitsRepository = get()) }
        viewModel { ChatViewModel(messagesRepository = get(), session = get()) }
        // visitId is passed in from the route via parametersOf(...)
        viewModel { (visitId: String) -> VisitDetailViewModel(visitId, get(), get()) }
    }
