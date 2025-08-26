package com.mostafanezar.furniromobile 

import android.app.Activity
import android.graphics.Color
import android.os.Build
import android.view.View
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

class StatusBarModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String {
        return "StatusBarModule"
    }

    @ReactMethod
    fun setColor(color: String) {
        val activity: Activity? = currentActivity
        activity?.window?.apply {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
                statusBarColor = Color.parseColor(color)
            }
        }
    }

    @ReactMethod
    fun setTextLight(isLight: Boolean) {
        val activity: Activity? = currentActivity
        activity?.window?.decorView?.apply {
            systemUiVisibility = if (isLight) {
                View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR // Icons/Text dark
            } else {
                0 // Icons/Text light
            }
        }
    }
}
