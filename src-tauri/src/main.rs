// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use io::play_audio;
use std::sync::atomic::AtomicU64;

mod io;

static FREQ: AtomicU64 = AtomicU64::new(440);
static DEPTH: AtomicU64 = AtomicU64::new(0);

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn greet(name: &str) {
    if let Ok(v) = name.parse::<u64>() {
        FREQ.store(v, std::sync::atomic::Ordering::Relaxed);
    }
}

#[tauri::command]
fn greet2(name: &str) {
    if let Ok(v) = name.parse::<u64>() {
        DEPTH.store(v, std::sync::atomic::Ordering::Relaxed);
    }
}

fn main() {
    let stream = play_audio(&FREQ, &DEPTH);

    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![greet, greet2])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
