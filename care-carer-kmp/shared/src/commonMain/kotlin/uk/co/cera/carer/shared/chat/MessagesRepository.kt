package uk.co.cera.carer.shared.chat

import io.ktor.client.HttpClient
import io.ktor.client.call.body
import io.ktor.client.request.get
import io.ktor.client.request.post
import io.ktor.client.request.setBody
import io.ktor.http.ContentType
import io.ktor.http.contentType
import uk.co.cera.carer.shared.network.apiBaseUrl
import uk.co.cera.carer.shared.network.dto.Message
import uk.co.cera.carer.shared.network.dto.MessagesResponse
import uk.co.cera.carer.shared.network.dto.NewMessage

class MessagesRepository(
    private val client: HttpClient,
) {
    // Backend forces the channel to the caller's own (carer -> carerId, relative -> clientId).
    suspend fun getMessages(): Result<List<Message>> =
        runCatching { client.get("$apiBaseUrl/messages").body<MessagesResponse>().data }

    suspend fun send(body: String): Result<Message> =
        runCatching {
            client.post("$apiBaseUrl/messages") {
                contentType(ContentType.Application.Json)
                setBody(NewMessage(body))
            }.body()
        }
}
