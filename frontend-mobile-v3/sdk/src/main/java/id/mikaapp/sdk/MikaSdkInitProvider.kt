package id.mikaapp.sdk

import android.content.ContentProvider
import android.content.ContentValues
import android.database.Cursor
import android.net.Uri
import id.mikaapp.sdk.di.MikaSdkKoinContext
import id.mikaapp.sdk.di.appModule
import org.koin.android.ext.koin.androidContext
import org.koin.dsl.koinApplication

internal class MikaSdkInitProvider : ContentProvider() {

    override fun onCreate(): Boolean {
        MikaSdkKoinContext.koinApp = koinApplication {
            androidContext(context!!)
            modules(listOf(appModule))
        }
        return true
    }

    override fun insert(p0: Uri, p1: ContentValues?): Uri? = null
    override fun query(p0: Uri, p1: Array<String>?, p2: String?, p3: Array<String>?, p4: String?): Cursor? = null
    override fun update(p0: Uri, p1: ContentValues?, p2: String?, p3: Array<String>?): Int = 0
    override fun delete(p0: Uri, p1: String?, p2: Array<String>?): Int = 0
    override fun getType(p0: Uri): String? = null
}