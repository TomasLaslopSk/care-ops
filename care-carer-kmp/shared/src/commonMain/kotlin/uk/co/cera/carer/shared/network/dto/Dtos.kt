package uk.co.cera.carer.shared.network.dto

import kotlinx.serialization.Serializable

// DTOs mirror the care-api OpenAPI contract (kotlinx.serialization instead of TS types).

@Serializable
data class LoginRequest(
    val email: String,
    val password: String,
    val app: String = "mobile", // gates roles server-side: carers + relatives only
)

@Serializable
data class UserDto(
    val id: String,
    val name: String,
    val email: String,
    val role: String,
    val carerId: String? = null,
    val relatedClientId: String? = null,
)

@Serializable
data class LoginResponse(val token: String, val user: UserDto)

@Serializable
data class VisitTask(
    val id: String,
    val label: String,
    val done: Boolean,
)

@Serializable
data class Visit(
    val id: String,
    val clientId: String,
    val client: String,
    val clientLat: Double = 0.0,
    val clientLng: Double = 0.0,
    val clientAddress: String = "",
    val carerId: String,
    val carerName: String,
    val region: String,
    val scheduledAt: String,
    val durationMin: Int,
    val status: String,
    val tasks: List<VisitTask> = emptyList(),
    val checkInAt: String? = null,
    val checkOutAt: String? = null,
    val report: String? = null,
)

@Serializable
data class TaskToggleRequest(val done: Boolean)

@Serializable
data class VisitsResponse(val data: List<Visit>, val total: Int)

@Serializable
data class Message(
    val id: String,
    val channelId: String,
    val author: String,
    val body: String,
    val createdAt: String,
)

@Serializable
data class MessagesResponse(val data: List<Message>, val total: Int)

@Serializable
data class NewMessage(val body: String)

@Serializable
data class VisitReportRequest(val report: String)
