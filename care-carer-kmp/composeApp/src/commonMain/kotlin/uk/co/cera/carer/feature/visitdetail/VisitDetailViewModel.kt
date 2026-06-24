package uk.co.cera.carer.feature.visitdetail

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import uk.co.cera.carer.shared.network.dto.Visit
import uk.co.cera.carer.shared.session.SessionStore
import uk.co.cera.carer.shared.visits.VisitsRepository

data class VisitDetailUiState(
    val loading: Boolean = true,
    val visit: Visit? = null,
    val report: String = "",
    val canAct: Boolean = false, // only the assigned carer may check in/out + report
    val error: String? = null,
)

class VisitDetailViewModel(
    private val visitId: String,
    private val visitsRepository: VisitsRepository,
    private val session: SessionStore,
) : ViewModel() {
    private val _state = MutableStateFlow(VisitDetailUiState())
    val state: StateFlow<VisitDetailUiState> = _state.asStateFlow()

    init {
        load()
    }

    private fun apply(visit: Visit) {
        val isCarer = session.user.value?.role == "carer"
        _state.value = _state.value.copy(loading = false, visit = visit, report = visit.report ?: "", canAct = isCarer, error = null)
    }

    fun load() {
        _state.value = _state.value.copy(loading = true)
        viewModelScope.launch {
            visitsRepository.getVisit(visitId)
                .onSuccess { apply(it) }
                .onFailure { _state.value = _state.value.copy(loading = false, error = "Failed to load visit.") }
        }
    }

    fun onReportChange(value: String) {
        _state.value = _state.value.copy(report = value)
    }

    fun checkIn() = viewModelScope.launch { visitsRepository.checkIn(visitId).onSuccess { apply(it) } }

    fun checkOut() = viewModelScope.launch { visitsRepository.checkOut(visitId).onSuccess { apply(it) } }

    fun saveReport() = viewModelScope.launch {
        visitsRepository.saveReport(visitId, _state.value.report).onSuccess { apply(it) }
    }

    fun toggleTask(taskId: String, done: Boolean) = viewModelScope.launch {
        visitsRepository.toggleTask(visitId, taskId, done).onSuccess { apply(it) }
    }
}
