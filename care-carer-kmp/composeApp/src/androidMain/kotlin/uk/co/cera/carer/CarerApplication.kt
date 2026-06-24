package uk.co.cera.carer

import android.app.Application
import org.koin.android.ext.koin.androidContext
import uk.co.cera.carer.di.initKoin

class CarerApplication : Application() {
    override fun onCreate() {
        super.onCreate()
        initKoin { androidContext(this@CarerApplication) }
    }
}
