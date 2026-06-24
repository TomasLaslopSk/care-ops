package uk.co.cera.carer.shared.di

import org.koin.dsl.module
import uk.co.cera.carer.shared.auth.AuthRepository
import uk.co.cera.carer.shared.chat.MessagesRepository
import uk.co.cera.carer.shared.network.createHttpClient
import uk.co.cera.carer.shared.session.SessionStore
import uk.co.cera.carer.shared.visits.VisitsRepository

// Koin module for the shared layer (same DI approach as family_app).
val sharedModule =
    module {
        single { SessionStore() }
        single { createHttpClient(get()) }
        single { AuthRepository(client = get(), session = get()) }
        single { VisitsRepository(client = get()) }
        single { MessagesRepository(client = get()) }
    }
