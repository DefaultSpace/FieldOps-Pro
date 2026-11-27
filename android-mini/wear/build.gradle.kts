plugins { id("com.android.application") }
android {
    namespace = "com.fieldops.mini.wear"
    compileSdk = 35
    defaultConfig { applicationId = "com.fieldops.mini"; minSdk = 30; targetSdk = 35; versionCode = 3; versionName = "0.3.0" }
    compileOptions { sourceCompatibility = JavaVersion.VERSION_17; targetCompatibility = JavaVersion.VERSION_17 }
}
dependencies { implementation(project(":shared")) }
