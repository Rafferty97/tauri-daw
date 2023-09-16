use std::{f32::consts::PI, sync::atomic::AtomicU64};

use cpal::{
    traits::{DeviceTrait, HostTrait, StreamTrait},
    Stream,
};
use serde::de;

pub fn play_audio(frequency: &'static AtomicU64, depth_: &'static AtomicU64) -> Stream {
    let host = cpal::default_host();
    let device = host.default_output_device().unwrap();
    let config = device.default_output_config().unwrap();
    let sample_rate = config.sample_rate().0 as f32;
    let mut i = 0f32;
    let mut j = 0f32;
    let mut depth = 0.0;
    let mut freq = frequency.load(std::sync::atomic::Ordering::Relaxed) as f32;
    let stream = device
        .build_output_stream(
            &config.into(),
            move |data, _| {
                let next_depth = depth_.load(std::sync::atomic::Ordering::Relaxed) as f32 / 100.0;
                let next_freq = frequency.load(std::sync::atomic::Ordering::Relaxed) as f32;
                for frame in data.chunks_mut(2) {
                    frame[0] = 0.2 * (2.0 * PI * i).sin();
                    frame[1] = 0.2 * (2.0 * PI * i).cos();

                    j += 2.0 * freq / sample_rate;
                    if j > 1.0 {
                        j -= 1.0;
                    }

                    let fm = depth * (2.0 * PI * j).sin();
                    i += (freq * (1.0 + fm)) / sample_rate;
                    if i > 1.0 {
                        i -= 1.0;
                    }

                    freq = 0.999 * freq + 0.001 * next_freq;
                    depth = 0.999 * depth + 0.001 * next_depth;
                }
            },
            move |err| {
                eprintln!("an error occurred on stream: {}", err);
            },
            None,
        )
        .unwrap();
    stream.play().unwrap();
    stream
}
