// tests/unit/controllers/itunesController.test.js
const { expect } = require("chai");
const sinon = require("sinon");
const axios = require("axios");
const { searchItunes } = require("../../../controllers/itunesController");

// Helper to build a fake Express res object we can assert on
const mockRes = () => ({
    status: sinon.stub().returnsThis(),
    json: sinon.stub()
});

describe("itunesController", () => {

    afterEach(() => {
        sinon.restore();
    });

    describe("searchItunes", () => {
        it("returns 400 if no query is provided", async () => {
            const req = { query: {} };
            const res = mockRes();

            await searchItunes(req, res);

            expect(res.status.calledWith(400)).to.be.true;
            expect(res.json.calledWith({ message: "Search query is required" })).to.be.true;
        });

        it("calls the iTunes API with the correct search params", async () => {
            const req = { query: { q: "arctic monkeys" } };
            const res = mockRes();

            const getStub = sinon.stub(axios, "get").resolves({ data: { results: [] } });

            await searchItunes(req, res);

            expect(getStub.calledOnce).to.be.true;
            expect(getStub.firstCall.args[0]).to.equal("https://itunes.apple.com/search");
            expect(getStub.firstCall.args[1].params).to.deep.equal({
                term: "arctic monkeys",
                media: "music",
                limit: 20
            });
        });

        it("maps iTunes results onto our Track-like shape", async () => {
            const req = { query: { q: "arctic monkeys" } };
            const res = mockRes();

            sinon.stub(axios, "get").resolves({
                data: {
                    results: [{
                        trackId: 1440841500,
                        trackName: "Do I Wanna Know?",
                        artistName: "Arctic Monkeys",
                        collectionName: "AM",
                        trackTimeMillis: 272394,
                        previewUrl: "https://audio-preview.example.com/track.m4a",
                        artworkUrl100: "https://artwork.example.com/100x100bb.jpg",
                        primaryGenreName: "Alternative"
                    }]
                }
            });

            await searchItunes(req, res);

            expect(res.status.calledWith(200)).to.be.true;
            const songs = res.json.firstCall.args[0];
            expect(songs).to.have.lengthOf(1);
            expect(songs[0]).to.deep.equal({
                _id: "itunes-1440841500",
                source: "itunes",
                title: "Do I Wanna Know?",
                artist: "Arctic Monkeys",
                album: "AM",
                duration: 272,
                url: "https://audio-preview.example.com/track.m4a",
                coverUrl: "https://artwork.example.com/300x300bb.jpg",
                genre: "Alternative",
                itunesId: 1440841500
            });
        });

        it("sets duration to null when trackTimeMillis is missing", async () => {
            const req = { query: { q: "obscure track" } };
            const res = mockRes();

            sinon.stub(axios, "get").resolves({
                data: {
                    results: [{
                        trackId: 999,
                        trackName: "Untitled",
                        artistName: "Unknown Artist",
                        collectionName: "Unknown Album",
                        trackTimeMillis: null,
                        previewUrl: null,
                        artworkUrl100: null,
                        primaryGenreName: null
                    }]
                }
            });

            await searchItunes(req, res);

            const songs = res.json.firstCall.args[0];
            expect(songs[0].duration).to.be.null;
            expect(songs[0].coverUrl).to.be.null;
        });

        it("returns 500 if the iTunes API call fails", async () => {
            const req = { query: { q: "arctic monkeys" } };
            const res = mockRes();

            sinon.stub(axios, "get").rejects(new Error("Network error"));

            await searchItunes(req, res);

            expect(res.status.calledWith(500)).to.be.true;
            const responseBody = res.json.firstCall.args[0];
            expect(responseBody.message).to.equal("Server error");
            expect(responseBody.error).to.equal("Network error");
        });
    });
});