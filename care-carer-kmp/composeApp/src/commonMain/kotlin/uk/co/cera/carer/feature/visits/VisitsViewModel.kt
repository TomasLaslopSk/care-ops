package uk.co.cera.carer.feature.visits

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import uk.co.cera.carer.shared.network.dto.Visit
import uk.co.cera.carer.shared.visits.VisitsRepository

data class VisitsUiState(
    val loading: Boolean = true,
    val visits: List<Visit> = emptyList(),
    val error: String? = null,
)

class VisitsViewModel(
    private val visitsRepository: VisitsRepository,
) : ViewModel() {
    private val _state = MutableStateFlow(VisitsUiState())
    val state: StateFlow<VisitsUiState> = _state.asStateFlow()

    init {
        load()
    }

    fun load() {
        _state.value = _state.value.copy(loading = true, error = null)
        viewModelScope.launch {
            visitsRepository.getVisits()
                .onSuccess { _state.value = VisitsUiState(loading = false, visits = it) }
                .onFailure { _state.value = VisitsUiState(loading = false, error = "Failed to load visits.") }
        }
    }
}
