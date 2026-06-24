package uk.co.cera.carer.app.navigation

import kotlinx.serialization.Serializable

// Type-safe Compose Navigation routes (same @Serializable pattern as family_app).
sealed interface AppRoute {
    @Serializable
    data object Login : AppRoute

    @Serializable
    data object Visits : AppRoute

    @Serializable
    data class VisitDetail(val visitId: String) : AppRoute

    @Serializable
    data object Chat : AppRoute
}
