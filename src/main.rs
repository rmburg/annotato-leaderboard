use std::{collections::HashMap, ops::Deref, path::PathBuf, sync::Arc};

use axum::{
    extract::{Path, State},
    routing::{get, get_service},
    Json, Router,
};
use color_eyre::Result;
use serde_json::Value;
use tokio::sync::Mutex;
use tower_http::services::ServeDir;

#[tokio::main(flavor = "current_thread")]
async fn main() -> Result<()> {
    let database = Arc::new(Mutex::new(load_from_file().await?));

    let app = Router::new()
        .route("/api", get(fetch_json))
        .with_state(database.clone())
        .route("/score/:user", get(add_score))
        .with_state(database.clone())
        .fallback(get_service(ServeDir::new("frontend/dist")));

    let listener = tokio::net::TcpListener::bind("0.0.0.0:3000").await.unwrap();

    axum::serve(listener, app).await?;

    Ok(())
}

async fn fetch_json(State(database): State<Arc<Mutex<HashMap<String, u64>>>>) -> Json<Value> {
    let content = database.lock().await.deref().clone();
    Json(serde_json::to_value(content).unwrap())
}

async fn add_score(
    Path(user): Path<String>,
    State(database): State<Arc<Mutex<HashMap<String, u64>>>>,
) {
    let mut database = database.lock().await;

    let entry = database.entry(user.clone()).or_insert(0);
    *entry += 1;
    save_to_file(database.deref()).await.unwrap();
}

async fn load_from_file() -> Result<HashMap<String, u64>> {
    if !PathBuf::from("scores.json").exists() {
        return Ok(HashMap::new());
    }
    let content = tokio::fs::read_to_string("scores.json").await?;
    let content: HashMap<String, u64> = serde_json::from_str(&content)?;

    Ok(content)
}

async fn save_to_file(content: &HashMap<String, u64>) -> Result<()> {
    let content = serde_json::to_string(content)?;
    tokio::fs::write("scores.json", content).await?;

    Ok(())
}
