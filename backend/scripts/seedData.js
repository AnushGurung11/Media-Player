/**
 * Seed script: wipes tracks + playlists and inserts a curated demo library.
 *
 * Usage (from backend/):  node scripts/seedData.js
 *
 * Requires the same env vars as the app (MONGO_URI, SUPABASE_URL,
 * SUPABASE_SECRET_KEY). Audio/cover files are downloaded from free public
 * sample sources and uploaded to the Supabase "audio" / "cover" buckets.
 */
require("dotenv").config({ quiet: true });

const mongoose = require("mongoose");
const mm = require("music-metadata");
const { createClient } = require("@supabase/supabase-js");
const Track = require("../models/Track");
const Playlist = require("../models/Playlist");
const User = require("../models/User");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY
);

// 20 curated entries: 17 full SoundHelix songs + 3 short samplelib clips.
const TRACKS = [
  { title: "Ocean Drive", artist: "SoundHelix", album: "Sunset Sessions", genre: "Chill", description: "Warm guitar layers and a slow groove — the perfect soundtrack for a coastal drive at golden hour.", src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3", seed: "ocean-drive" },
  { title: "Neon Skyline", artist: "SoundHelix", album: "Night Lights", genre: "Synthwave", description: "Retro synths and a driving beat that capture the glow of a city after dark.", src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3", seed: "neon-skyline" },
  { title: "Morning Coffee", artist: "SoundHelix", album: "Slow Start", genre: "Acoustic", description: "Soft strings and a gentle rhythm to ease into the morning.", src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3", seed: "morning-coffee" },
  { title: "Paper Planes", artist: "SoundHelix", album: "Daydreams", genre: "Indie", description: "A light, playful melody that feels like watching paper planes drift across a blue sky.", src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3", seed: "paper-planes" },
  { title: "Rainy Window", artist: "SoundHelix", album: "Grey Skies", genre: "Lo-fi", description: "Mellow textures and unhurried drums for a quiet afternoon indoors.", src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3", seed: "rainy-window" },
  { title: "Mountain Air", artist: "SoundHelix", album: "Open Roads", genre: "Folk", description: "Bright acoustic tones that evoke crisp air and wide-open mountain trails.", src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3", seed: "mountain-air" },
  { title: "Midnight Train", artist: "SoundHelix", album: "Night Lights", genre: "Jazz", description: "Smoky chords and a steady bassline — a late-night journey in sound.", src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3", seed: "midnight-train" },
  { title: "Sunflower Field", artist: "SoundHelix", album: "Daydreams", genre: "Acoustic", description: "Cheerful plucked strings and a sunny, carefree mood.", src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3", seed: "sunflower-field" },
  { title: "City Lights", artist: "SoundHelix", album: "Night Lights", genre: "Electronic", description: "Pulsing synths and a driving tempo built for late-night walks downtown.", src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3", seed: "city-lights" },
  { title: "Quiet Library", artist: "SoundHelix", album: "Slow Start", genre: "Ambient", description: "Gentle, unobtrusive instrumentals made for deep focus and long reading sessions.", src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3", seed: "quiet-library" },
  { title: "Summer Breeze", artist: "SoundHelix", album: "Sunset Sessions", genre: "Pop", description: "An upbeat, feel-good tune with an infectious chorus.", src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-11.mp3", seed: "summer-breeze" },
  { title: "Desert Highway", artist: "SoundHelix", album: "Open Roads", genre: "Rock", description: "Gritty riffs and a steady groove for the long stretch of road ahead.", src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-12.mp3", seed: "desert-highway" },
  { title: "Frozen Lake", artist: "SoundHelix", album: "Grey Skies", genre: "Ambient", description: "Sparse, atmospheric sounds with a calm, wintry stillness.", src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-13.mp3", seed: "frozen-lake" },
  { title: "Afternoon Tea", artist: "SoundHelix", album: "Slow Start", genre: "Chill", description: "Delicate piano and soft percussion — a relaxing break in the middle of the day.", src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-14.mp3", seed: "afternoon-tea" },
  { title: "Neon Runner", artist: "SoundHelix", album: "Night Lights", genre: "Synthwave", description: "Fast arpeggios and a relentless beat for high-energy moments.", src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-15.mp3", seed: "neon-runner" },
  { title: "Old Bookstore", artist: "SoundHelix", album: "Daydreams", genre: "Lo-fi", description: "Dusty vinyl textures and a mellow groove, perfect for browsing shelves.", src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-16.mp3", seed: "old-bookstore" },
  { title: "Last Light", artist: "SoundHelix", album: "Sunset Sessions", genre: "Acoustic", description: "A reflective closer with warm harmonies and a fading horizon.", src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-17.mp3", seed: "last-light" },
  { title: "Three Second Spark", artist: "SampleLib", album: "Short Cuts", genre: "Experimental", description: "A tiny burst of sound — a quick palate cleanser between longer tracks.", src: "https://samplelib.com/lib/preview/mp3/sample-3s.mp3", seed: "three-second-spark" },
  { title: "Six Second Drift", artist: "SampleLib", album: "Short Cuts", genre: "Experimental", description: "A short, dreamy fragment that loops well in a chill playlist.", src: "https://samplelib.com/lib/preview/mp3/sample-6s.mp3", seed: "six-second-drift" },
  { title: "Nine Second Pulse", artist: "SampleLib", album: "Short Cuts", genre: "Electronic", description: "A compact rhythmic demo clip with a punchy electronic pulse.", src: "https://samplelib.com/lib/preview/mp3/sample-9s.mp3", seed: "nine-second-pulse" },
];

const PLAYLISTS = [
  { name: "Chill Evenings", description: "Unwind with soft guitars and mellow beats.", seed: "playlist-chill", indexes: [0, 2, 4, 9, 13, 16] },
  { name: "Night Drive", description: "Synths, neon and a steady tempo for the road.", seed: "playlist-night", indexes: [1, 6, 8, 14, 3] },
  { name: "Focus Mode", description: "Instrumentals that stay out of the way while you work.", seed: "playlist-focus", indexes: [9, 4, 13, 12, 15] },
  { name: "Weekend Mix", description: "A little bit of everything for a relaxed weekend.", seed: "playlist-weekend", indexes: [0, 10, 11, 7, 5, 16, 18] },
];

const fetchBuffer = async (url, label) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Download failed (${res.status}) for ${label}: ${url}`);
  return Buffer.from(await res.arrayBuffer());
};

const main = async () => {
  if (!process.env.MONGO_URI || !process.env.SUPABASE_URL || !process.env.SUPABASE_SECRET_KEY) {
    throw new Error("Missing MONGO_URI / SUPABASE_URL / SUPABASE_SECRET_KEY in environment");
  }

  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to MongoDB");

  // 1) Wipe tracks + playlists (users are deliberately kept).
  const oldTracks = await Track.find({}).select("audioKey coverKey").lean();
  const resultT = await Track.deleteMany({});
  const resultP = await Playlist.deleteMany({});
  console.log(`Deleted ${resultT.deletedCount} tracks and ${resultP.deletedCount} playlists`);

  // Clean up the old Supabase files so storage matches the new library.
  for (const t of oldTracks) {
    if (t.audioKey) await supabase.storage.from("audio").remove([t.audioKey]);
    if (t.coverKey) await supabase.storage.from("cover").remove([t.coverKey]);
  }

  // Use the existing admin account as uploader so admin views work.
  const admin = await User.findOne({ role: "admin" });
  if (!admin) throw new Error("No admin user found — cannot assign uploaderId");

  // 2) Download, upload and insert each curated track.
  const created = [];
  for (let i = 0; i < TRACKS.length; i += 1) {
    const t = TRACKS[i];
    console.log(`[${i + 1}/${TRACKS.length}] ${t.title}`);

    const audio = await fetchBuffer(t.src, t.title);
    const meta = await mm.parseBuffer(audio, "audio/mpeg", { duration: true });
    const duration = Math.round(meta.format.duration || 0);

    const cover = await fetchBuffer(
      `https://picsum.photos/seed/${t.seed}/600/600`,
      `cover for ${t.title}`
    );

    const stamp = Date.now();
    const suffix = Math.random().toString(36).slice(2, 8);
    const audioKey = `${stamp}-${suffix}.mp3`;
    const coverKey = `${stamp}-${suffix}.jpg`;

    const { error: audioErr } = await supabase.storage
      .from("audio")
      .upload(audioKey, audio, { contentType: "audio/mpeg", upsert: false });
    if (audioErr) throw new Error(`Audio upload failed: ${audioErr.message}`);

    const { error: coverErr } = await supabase.storage
      .from("cover")
      .upload(coverKey, cover, { contentType: "image/jpeg", upsert: false });
    if (coverErr) throw new Error(`Cover upload failed: ${coverErr.message}`);

    const doc = await Track.create({
      title: t.title,
      artist: t.artist,
      description: t.description,
      album: t.album,
      genre: t.genre,
      duration,
      audioKey,
      coverKey,
      license: "CC0",
      uploadState: "completed",
      uploaderId: admin._id,
      consentLoggedAt: new Date(),
      consentIp: "seed-script",
      playCount: (i * 7 + 3) % 41,
      createdAt: new Date(Date.now() - (TRACKS.length - i) * 3600000),
    });
    created.push(doc);
  }

  // 3) Recreate a few public playlists that group the new tracks.
  for (const p of PLAYLISTS) {
    const cover = await fetchBuffer(
      `https://picsum.photos/seed/${p.seed}/600/600`,
      `cover for ${p.name}`
    );
    const coverKey = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.jpg`;
    const { error } = await supabase.storage
      .from("cover")
      .upload(coverKey, cover, { contentType: "image/jpeg", upsert: false });
    if (error) throw new Error(`Playlist cover upload failed: ${error.message}`);

    await Playlist.create({
      name: p.name,
      description: p.description,
      user: admin._id,
      songs: p.indexes.map((idx) => created[idx]._id),
      coverKey,
      isPublic: true,
      shuffle: false,
    });
    console.log(`Created playlist: ${p.name}`);
  }

  console.log(`\nDone. ${created.length} tracks and ${PLAYLISTS.length} playlists seeded.`);
  await mongoose.disconnect();
};

main()
  .then(() => process.exit(0))
  .catch(async (err) => {
    console.error("Seed failed:", err);
    try { await mongoose.disconnect(); } catch { /* noop */ }
    process.exit(1);
  });
