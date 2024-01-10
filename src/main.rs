use axum::{
    routing::{get, get_service},
    Router,
};
use tower_http::services::ServeDir;

#[tokio::main(flavor = "current_thread")]
async fn main() {
    let app = Router::new()
        .route("/api", get(|| async { "JSON goes here" }))
        .fallback(get_service(ServeDir::new("frontend")));

    let listener = tokio::net::TcpListener::bind("0.0.0.0:3000").await.unwrap();
    axum::serve(listener, app).await.unwrap();
}
