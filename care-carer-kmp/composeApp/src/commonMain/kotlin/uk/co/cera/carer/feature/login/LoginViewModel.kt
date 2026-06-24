package uk.co.cera.carer.feature.login

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import uk.co.cera.carer.shared.auth.AuthRepository

data class LoginUiState(
    val email: String = "amara@care.test",
    val password: String = "carer123",
    val loading: Boolean = false,
    val error: String? = null,
)

class LoginViewModel(
    private val authRepository: AuthRepository,
) : ViewModel() {
    private val _state = MutableStateFlow(LoginUiState())
    val state: StateFlow<LoginUiState> = _state.asStateFlow()

    fun onEmail(value: String) {
        _state.value = _state.value.copy(email = value)
    }

    fun onPassword(value: String) {
        _state.value = _state.value.copy(password = value)
    }

    fun login(onSuccess: () -> Unit) {
        val s = _state.value
        _state.value = s.copy(loading = true, error = null)
        viewModelScope.launch {
            authRepository.login(s.email.trim(), s.password)
                .onSuccess {
                    _state.value = _state.value.copy(loading = false)
                    onSuccess()
                }
                .onFailure {
                    _state.value = _state.value.copy(loading = false, error = "Invalid email or password.")
                }
        }
    }
}
