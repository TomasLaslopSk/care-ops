package uk.co.cera.carer.shared.session

import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import uk.co.cera.carer.shared.network.dto.UserDto

// In-memory session (token + user). family_app persists this with multiplatform-settings;
// kept in-memory here to stay minimal — re-login on app restart.
class SessionStore {
    private val _user = MutableStateFlow<UserDto?>(null)
    val user: StateFlow<UserDto?> = _user.asStateFlow()

    var token: String? = null
        private set

    fun set(token: String, user: UserDto) {
        this.token = token
        _user.value = user
    }

    fun clear() {
        token = null
        _user.value = null
    }
}
