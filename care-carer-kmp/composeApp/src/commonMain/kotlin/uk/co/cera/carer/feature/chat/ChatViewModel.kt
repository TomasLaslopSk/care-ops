package uk.co.cera.carer.feature.chat

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import uk.co.cera.carer.shared.chat.MessagesRepository
import uk.co.cera.carer.shared.network.dto.Message
import uk.co.cera.carer.shared.session.SessionStore

data class ChatUiState(
    val messages: List<Message> = emptyList(),
    val draft: String = "",
)

class ChatViewModel(
    private val messagesRepository: MessagesRepository,
    session: SessionStore,
) : ViewModel() {
    val myName: String = session.user.value?.name ?: "You"

    private val _state = MutableStateFlow(ChatUiState())
    val state: StateFlow<ChatUiState> = _state.asStateFlow()

    init {
        // No EventSource on KMP, so poll every 4s (web uses SSE). Simple + good enough.
        viewModelScope.launch {
            while (true) {
                refresh()
                delay(4000)
            }
        }
    }

    private suspend fun refresh() {
        messagesRepository.getMessages().onSuccess { _state.value = _state.value.copy(messages = it) }
    }

    fun onDraftChange(value: String) {
        _state.value = _state.value.copy(draft = value)
    }

    fun send() {
        val body = _state.value.draft.trim()
        if (body.isEmpty()) return
        _state.value = _state.value.copy(draft = "")
        viewModelScope.launch { messagesRepository.send(body).onSuccess { refresh() } }
    }
}
