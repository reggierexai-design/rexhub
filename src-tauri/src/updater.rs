//! Auto-update check for RexCode.
//!
//! Checks GitHub Releases for new versions. The actual update installation
//! is handled by tauri-plugin-updater, but since we're shipping unsigned
//! for beta, we provide a manual download link instead.

use tauri::AppHandle;

/// Check if an update is available by querying the GitHub releases endpoint.
#[tauri::command]
pub async fn check_for_updates(app: AppHandle) -> Result<Option<serde_json::Value>, String> {
    let current_version = app.config().version.as_deref().unwrap_or("1.0.0");

    let client = reqwest::Client::builder()
        .timeout(std::time::Duration::from_secs(10))
        .build()
        .map_err(|e| format!("HTTP client init failed: {e}"))?;

    let url = "https://github.com/reggierexai-design/rexhub/releases/latest/download/latest.json";

    let resp = client.get(url).send().await.map_err(|e| format!("Update check failed: {e}"))?;

    if !resp.status().is_success() {
        log::warn!("update: endpoint returned {}", resp.status());
        return Ok(None);
    }

    let manifest: serde_json::Value = resp.json().await.map_err(|e| format!("Invalid manifest: {e}"))?;

    let latest_version = manifest.get("version")
        .and_then(|v| v.as_str())
        .unwrap_or("0.0.0");

    if latest_version == current_version {
        log::info!("update: already on latest ({})", current_version);
        return Ok(None);
    }

    log::info!("update: v{} available (current: {})", latest_version, current_version);

    Ok(Some(serde_json::json!({
        "version": latest_version,
        "notes": manifest.get("notes").and_then(|v| v.as_str()).unwrap_or(""),
        "date": manifest.get("pub_date").and_then(|v| v.as_str()).unwrap_or(""),
        "download_url": format!(
            "https://github.com/reggierexai-design/rexhub/releases/tag/v{}",
            latest_version
        ),
    })))
}

/// Open the download page in the user's browser.
#[tauri::command]
pub async fn open_download_page(url: String) -> Result<(), String> {
    open::that(&url).map_err(|e| format!("Failed to open URL: {e}"))
}
