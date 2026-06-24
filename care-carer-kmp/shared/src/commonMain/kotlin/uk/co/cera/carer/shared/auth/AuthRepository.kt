package uk.co.cera.carer.shared.auth

import io.ktor.client.HttpClient
import io.ktor.client.call.body
import io.ktor.client.request.post
import io.ktor.client.request.setBody
import io.ktor.http.ContentType
import io.ktor.http.contentType
import uk.co.cera.carer.shared.network.apiBaseUrl
import uk.co.cera.carer.shared.network.dto.LoginRequest
import uk.co.cera.carer.shared.network.dto.LoginResponse
import uk.co.cera.carer.shared.session.SessionStore

class AuthRepository(
    private val client: HttpClient,
    private val session: SessionStore,
) {
    suspend fun login(email: String, password: String): Result<Unit> =
        runCatching {
            val res: LoginResponse =
                client.post("$apiBaseUrl/auth/login") {
                    contentType(ContentType.Application.Json)
                    setBody(LoginRequest(email, password))
                }.body()
            session.set(res.token, res.user)
        }

    fun logout() = session.clear()
}
