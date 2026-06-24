package uk.co.cera.carer.shared.network

import io.ktor.client.HttpClient
import io.ktor.client.plugins.contentnegotiation.ContentNegotiation
import io.ktor.client.plugins.defaultRequest
import io.ktor.client.plugins.logging.LogLevel
import io.ktor.client.plugins.logging.Logging
import io.ktor.client.request.header
import io.ktor.http.HttpHeaders
import io.ktor.serialization.kotlinx.json.json
import kotlinx.serialization.json.Json
import uk.co.cera.carer.shared.session.SessionStore

// Builds the Ktor client. The engine (OkHttp on Android, Darwin on iOS) is supplied
// by the platform source sets, so common code just calls HttpClient { }.
// family_app uses a richer factory (Auth plugin + token refresh); here we attach the
// bearer token via defaultRequest to keep it minimal and obvious.
fun createHttpClient(session: SessionStore): HttpClient =
    HttpClient {
        install(ContentNegotiation) {
            json(Json { ignoreUnknownKeys = true })
        }
        install(Logging) { level = LogLevel.INFO }
        defaultRequest {
            session.token?.let { header(HttpHeaders.Authorization, "Bearer $it") }
        }
    }
