// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use basedrop::Collector;
use cpal::traits::{DeviceTrait, HostTrait, StreamTrait};
use daw_engine::{
    audio::sample::AudioSample,
    engine::AudioEngine,
    processor::{AudioOutput, Filter, Mixer, Sampler},
};
use std::{
    io::BufReader,
    sync::{
        atomic::{AtomicI64, AtomicU64},
        Arc,
    },
};

static FREQ: AtomicU64 = AtomicU64::new(440);
static AMP: AtomicI64 = AtomicI64::new(10);
static PAN: AtomicI64 = AtomicI64::new(0);

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn greet(name: f64) {
    FREQ.store(name as u64, std::sync::atomic::Ordering::Relaxed);
}

#[tauri::command]
fn greet2(name: f64) {
    AMP.store((name * 1000.0) as i64, std::sync::atomic::Ordering::Relaxed);
}

#[tauri::command]
fn greet3(name: f64) {
    PAN.store(name as i64, std::sync::atomic::Ordering::Relaxed);
}

fn main() {
    std::thread::spawn(|| {
        play_audio();
    });

    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![greet, greet2, greet3])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

fn play_audio() {
    use std::sync::atomic::Ordering;
    let mut freq = FREQ.load(Ordering::Relaxed) as f32;
    let mut amp = (AMP.load(Ordering::Relaxed) as f32) / 1000.0;
    let mut pan = PAN.load(Ordering::Relaxed) as f32 / 50.0;

    // Create a collector
    let collector = Collector::new();

    // Create sampler
    let mut audio_in = Sampler::new_empty();
    let file = std::fs::File::open("123_House.wav").unwrap();
    let reader = BufReader::new(file);
    let clip = AudioSample::read_wav(reader, None).unwrap();
    // let clip = clip.trim(0, 22000);
    let clip = Arc::new(clip);
    audio_in.set_sample(clip);

    // Create mixer
    let mixer = Mixer::new();

    // Create the audio output processor
    let host = cpal::default_host();
    let device = host.default_output_device().unwrap();
    let config = device.default_output_config().unwrap();
    let sample_rate = config.sample_rate();
    let (audio_out, stream) =
        AudioOutput::from_cpal(device, &config.into(), 2048, &collector.handle());
    stream.play().unwrap();

    // Create a filter effect
    let filter = Filter::new();

    // Create the audio engine
    let mut engine = AudioEngine::new();
    let audio_in = engine.add_device(Box::new(audio_in));
    let filter = engine.add_device(Box::new(filter));
    let mixer = engine.add_device(Box::new(mixer));
    let audio_out = engine.add_device(Box::new(audio_out));
    engine.test_connect(&[audio_in, filter, mixer, audio_out]);

    // Configure the audio engine
    engine.set_sample_rate(sample_rate.0);

    // Processing loop
    loop {
        engine.get_device_mut(filter).set_parameter(0, freq);
        engine.get_device_mut(mixer).set_parameter(0, amp);
        engine.get_device_mut(mixer).set_parameter(1, pan);
        engine.process(256);
        freq = FREQ.load(Ordering::Relaxed) as f32;
        amp = AMP.load(Ordering::Relaxed) as f32 / 1000.0;
        pan = PAN.load(Ordering::Relaxed) as f32 / 50.0;
    }
}
