plugins { id("com.android.application") }
android {
    namespace = "com.fieldops.mini.phone"
    compileSdk = 35
    defaultConfig { applicationId = "com.fieldops.mini"; minSdk = 28; targetSdk = 35; versionCode = 3; versionName = "0.3.0" }
    compileOptions { sourceCompatibility = JavaVersion.VERSION_17; targetCompatibility = JavaVersion.VERSION_17 }
    testOptions {
        unitTests.isIncludeAndroidResources = true
        // Conscrypt lowercases WINDOWS using the host locale (Turkish I breaks its DLL lookup).
        unitTests.all { it.systemProperty("user.language", "en"); it.systemProperty("user.country", "US") }
    }
}
dependencies {
    implementation(project(":shared")); implementation("androidx.webkit:webkit:1.12.1")
    testImplementation("junit:junit:4.13.2")
    testImplementation("org.robolectric:robolectric:4.14.1")
}
val webIndex = file("src/main/assets/web/index.html")
tasks.named("preBuild") { doFirst { check(webIndex.exists()) { "Run npm run build:mini from the repository root first." } } }
