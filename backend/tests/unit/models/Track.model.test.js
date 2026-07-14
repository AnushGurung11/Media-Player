// tests/unit/models/track.model.test.js
const { expect } = require("chai");
const mongoose = require("mongoose");
const Track = require("../../../models/Track");

// Helper: minimal valid track payload, override fields per test
const validTrack = (overrides = {}) => ({
    title: "Test Song",
    artist: "Test Artist",
    duration: 180,
    audioKey: "audio/abc123.mp3",
    license: "all-rights-reserved",
    uploaderId: new mongoose.Types.ObjectId(),
    ...overrides
});

describe("Track Model", () => {

    describe("isDownloadable pre-save hook", () => {
        it("sets isDownloadable = true for a CC0 licensed track", async () => {
            const track = await Track.create(validTrack({ license: "CC0" }));
            expect(track.isDownloadable).to.be.true;
        });

        it("sets isDownloadable = true for CC-BY", async () => {
            const track = await Track.create(validTrack({ license: "CC-BY" }));
            expect(track.isDownloadable).to.be.true;
        });

        it("sets isDownloadable = true for CC-BY-SA", async () => {
            const track = await Track.create(validTrack({ license: "CC-BY-SA" }));
            expect(track.isDownloadable).to.be.true;
        });

        it("sets isDownloadable = false for all-rights-reserved", async () => {
            const track = await Track.create(validTrack({ license: "all-rights-reserved" }));
            expect(track.isDownloadable).to.be.false;
        });

        it("sets isDownloadable = false for CC-BY-NC (non-commercial, not in downloadable list)", async () => {
            const track = await Track.create(validTrack({ license: "CC-BY-NC" }));
            expect(track.isDownloadable).to.be.false;
        });

        it("re-evaluates isDownloadable if the license changes on update", async () => {
            const track = await Track.create(validTrack({ license: "all-rights-reserved" }));
            expect(track.isDownloadable).to.be.false;

            track.license = "CC0";
            await track.save();

            expect(track.isDownloadable).to.be.true;
        });
    });

    describe("optional fields (album, genre, coverKey)", () => {
        it("allows creation without album, genre or coverKey", async () => {
            const track = await Track.create(validTrack());
            expect(track.album).to.equal("");
            expect(track.genre).to.equal("");
            expect(track.coverKey).to.be.null;
        });

        it("still stores album/genre/coverKey when provided", async () => {
            const track = await Track.create(validTrack({
                album: "Greatest Hits",
                genre: "Rock",
                coverKey: "covers/xyz.jpg"
            }));
            expect(track.album).to.equal("Greatest Hits");
            expect(track.genre).to.equal("Rock");
            expect(track.coverKey).to.equal("covers/xyz.jpg");
        });
    });

    describe("required field validation", () => {
        it("requires title, artist, duration, audioKey, license and uploaderId", async () => {
            const track = new Track({});
            let err;
            try {
                await track.validate();
            } catch (e) {
                err = e;
            }
            expect(err).to.exist;
            expect(err.errors.title).to.exist;
            expect(err.errors.artist).to.exist;
            expect(err.errors.duration).to.exist;
            expect(err.errors.audioKey).to.exist;
            expect(err.errors.license).to.exist;
            expect(err.errors.uploaderId).to.exist;
        });

        it("rejects a license value outside the allowed enum", async () => {
            const track = new Track(validTrack({ license: "some-random-license" }));
            let err;
            try {
                await track.validate();
            } catch (e) {
                err = e;
            }
            expect(err).to.exist;
            expect(err.errors.license).to.exist;
        });
    });

    describe("defaults", () => {
        it("defaults uploadState to 'pending'", async () => {
            const track = await Track.create(validTrack());
            expect(track.uploadState).to.equal("pending");
        });

        it("defaults playCount to 0", async () => {
            const track = await Track.create(validTrack());
            expect(track.playCount).to.equal(0);
        });

        it("rejects an invalid uploadState value", async () => {
            const track = new Track(validTrack({ uploadState: "in-progress" }));
            let err;
            try {
                await track.validate();
            } catch (e) {
                err = e;
            }
            expect(err).to.exist;
            expect(err.errors.uploadState).to.exist;
        });
    });
});