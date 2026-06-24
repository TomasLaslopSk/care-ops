package uk.co.cera.carer.shared.visits

import io.ktor.client.HttpClient
import io.ktor.client.call.body
import io.ktor.client.request.get
import io.ktor.client.request.post
import io.ktor.client.request.put
import io.ktor.client.request.setBody
import io.ktor.http.ContentType
import io.ktor.http.contentType
import uk.co.cera.carer.shared.network.apiBaseUrl
import uk.co.cera.carer.shared.network.dto.TaskToggleRequest
import uk.co.cera.carer.shared.network.dto.Visit
import uk.co.cera.carer.shared.network.dto.VisitReportRequest
import uk.co.cera.carer.shared.network.dto.VisitsResponse

class VisitsRepository(
    private val client: HttpClient,
) {
    // The backend scopes the list by token (carer -> own, relative -> their client).
    suspend fun getVisits(): Result<List<Visit>> =
        runCatching {
            client.get("$apiBaseUrl/visits?limit=100").body<VisitsResponse>().data
        }

    suspend fun getVisit(id: String): Result<Visit> =
        runCatching { client.get("$apiBaseUrl/visits/$id").body() }

    suspend fun checkIn(id: String): Result<Visit> =
        runCatching { client.post("$apiBaseUrl/visits/$id/check-in").body() }

    suspend fun checkOut(id: String): Result<Visit> =
        runCatching { client.post("$apiBaseUrl/visits/$id/check-out").body() }

    suspend fun saveReport(id: String, report: String): Result<Visit> =
        runCatching {
            client.put("$apiBaseUrl/visits/$id/report") {
                contentType(ContentType.Application.Json)
                setBody(VisitReportRequest(report))
            }.body()
        }

    suspend fun toggleTask(id: String, taskId: String, done: Boolean): Result<Visit> =
        runCatching {
            client.put("$apiBaseUrl/visits/$id/tasks/$taskId") {
                contentType(ContentType.Application.Json)
                setBody(TaskToggleRequest(done))
            }.body()
        }
}
