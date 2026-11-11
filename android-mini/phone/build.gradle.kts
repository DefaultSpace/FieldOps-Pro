plugins { id("com.android.application") }
android {
    namespace = "com.fieldops.mini.phone"
    compileSdk = 35
    defaultConfig { applicationId = "com.fieldops.mini"; minSdk = 28; targetSdk = 35; versionCode = 1; versionName = "0.1.0" }
    compileOptions { sourceCompatibility = JavaVersion.VERSION_17; targetCompatibility = JavaVersion.VERSION_17 }
}
dependencies { implementation(project(":shared")); implementation("androidx.webkit:webkit:1.12.1") }
val webIndex = file("src/main/assets/web/index.html")
tasks.named("preBuild") { doFirst { check(webIndex.exists()) { "Run npm run build:mini from the repository root first." } } }
