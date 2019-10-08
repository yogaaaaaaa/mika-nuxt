package id.mikaapp.sdk.api

import com.google.gson.FieldNamingPolicy
import com.google.gson.Gson
import com.google.gson.GsonBuilder
import com.google.gson.TypeAdapter
import com.google.gson.stream.JsonReader
import com.google.gson.stream.JsonToken
import com.google.gson.stream.JsonWriter
import id.mikaapp.sdk.BuildConfig
import id.mikaapp.sdk.MikaSdk
import okhttp3.Interceptor
import okhttp3.OkHttpClient
import okhttp3.ResponseBody
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Converter
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import java.lang.reflect.Type
import java.math.BigDecimal
import java.util.concurrent.TimeUnit

internal class MikaRestAdapter {

    fun newMikaApiService(): Api {

        return newRetrofitService().create(Api::class.java)
    }

    fun newRetrofitService(): Retrofit {
        val baseUrl = if (MikaSdk.instance.isSandbox)
            BuildConfig.BASE_URL_SANDBOX
        else
            BuildConfig.BASE_URL

        val timeout = 60

        return Retrofit.Builder()
            .baseUrl(baseUrl)
            .client(newOkHttpClient(timeout))
            .addConverterFactory(GsonConverterFactory.create(newGson()))
            .build()
    }

    private fun newHttpLoggingInterceptor(): HttpLoggingInterceptor {
        val httpLoggingInterceptor = HttpLoggingInterceptor()
        httpLoggingInterceptor.level = if (BuildConfig.DEBUG) {
            HttpLoggingInterceptor.Level.BODY
        } else {
            HttpLoggingInterceptor.Level.NONE
        }
        return httpLoggingInterceptor
    }

    private fun newGson(): Gson {
        return GsonBuilder()
            .setFieldNamingPolicy(FieldNamingPolicy.IDENTITY)
            .registerTypeAdapter(BigDecimal::class.java, object : TypeAdapter<BigDecimal>() {
                override fun write(out: JsonWriter?, value: BigDecimal?) {
                }

                override fun read(reader: JsonReader): BigDecimal? {
                    val token = reader.peek()
                    return if (token == JsonToken.STRING) {
                        val stringNum = reader.nextString()
                        if (stringNum == null || stringNum.isEmpty()) {
                            null
                        } else {
                            BigDecimal(stringNum)
                        }
                    } else if (token == JsonToken.NUMBER) {
                        BigDecimal(reader.nextInt())
                    } else {
                        reader.skipValue()
                        null
                    }
                }

            })
            .setLenient()
            .create()
    }

    private fun newHeaderInterceptor(): Interceptor {
        return Interceptor { chain ->
            val request = chain.request()
            val headerInterceptedRequest = request.newBuilder()
                .addHeader("Content-Type", "application/json")
                .build()

            chain.proceed(headerInterceptedRequest)
        }
    }

    private fun newOkHttpClient(timeout: Int): OkHttpClient {
        val builder = OkHttpClient.Builder()
        return builder
            .addInterceptor(newHttpLoggingInterceptor())
            .addInterceptor(newHeaderInterceptor())
            .connectTimeout(timeout.toLong(), TimeUnit.SECONDS)
            .readTimeout(timeout.toLong(), TimeUnit.SECONDS)
            .writeTimeout(timeout.toLong(), TimeUnit.SECONDS)
            .build()
    }
}