package uk.co.cera.carer.util

import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertFalse
import kotlin.test.assertNull
import kotlin.test.assertTrue

class DateFormatTest {
    @Test
    fun upcoming_far_future_is_true() {
        assertTrue(isUpcoming("2099-01-01T00:00:00Z"))
    }

    @Test
    fun upcoming_far_past_is_false() {
        assertFalse(isUpcoming("2000-01-01T00:00:00Z"))
    }

    @Test
    fun upcoming_null_or_blank_is_false() {
        assertFalse(isUpcoming(null))
        assertFalse(isUpcoming(""))
    }

    @Test
    fun localDate_of_null_is_null() {
        assertNull(localDateOf(null))
    }

    @Test
    fun null_inputs_format_as_dash() {
        assertEquals("—", formatTime(null))
        assertEquals("—", formatDateTime(null))
    }
}
