package uk.co.cera.carer.app.navigation

import androidx.compose.runtime.Composable
import androidx.navigation.NavHostController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.toRoute
import uk.co.cera.carer.feature.chat.ChatScreen
import uk.co.cera.carer.feature.login.LoginScreen
import uk.co.cera.carer.feature.visitdetail.VisitDetailScreen
import uk.co.cera.carer.feature.visits.VisitsScreen

// Compose Navigation graph (same composable<Route> pattern as family_app's AppGraph).
@Composable
fun AppGraph(navController: NavHostController) {
    NavHost(navController = navController, startDestination = AppRoute.Login) {
        composable<AppRoute.Login> {
            LoginScreen(
                onLoggedIn = {
                    navController.navigate(AppRoute.Visits) {
                        popUpTo(AppRoute.Login) { inclusive = true }
                        launchSingleTop = true
                    }
                },
            )
        }
        composable<AppRoute.Visits> {
            VisitsScreen(
                onOpenVisit = { id -> navController.navigate(AppRoute.VisitDetail(id)) },
                onOpenChat = { navController.navigate(AppRoute.Chat) },
            )
        }
        composable<AppRoute.VisitDetail> { entry ->
            val route = entry.toRoute<AppRoute.VisitDetail>()
            VisitDetailScreen(visitId = route.visitId, onBack = { navController.popBackStack() })
        }
        composable<AppRoute.Chat> {
            ChatScreen(onBack = { navController.popBackStack() })
        }
    }
}
