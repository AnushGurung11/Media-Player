// tests/unit/middleware/authMiddleware.test.js
const { expect } = require("chai");
const sinon = require("sinon");
const jwt = require("jsonwebtoken");
const User = require("../../../models/User");
const { protect } = require("../../../middleware/authMiddleware");

describe("authMiddleware - protect", () => {
    let req, res, next;

    beforeEach(() => {
        req = { headers: {} };
        res = {
            status: sinon.stub().returnsThis(),
            json: sinon.stub()
        };
        next = sinon.stub();
    });

    afterEach(() => {
        sinon.restore();
    });

    it("responds 401 when no Authorization header is present", async () => {
        await protect(req, res, next);

        expect(next.called).to.be.false;
        expect(res.status.calledWith(401)).to.be.true;
        expect(res.json.calledWith({ message: "Not authorized, no token" })).to.be.true;
    });

    it("responds 401 when Authorization header doesn't start with 'Bearer'", async () => {
        req.headers.authorization = "Basic sometoken";

        await protect(req, res, next);

        expect(next.called).to.be.false;
        expect(res.status.calledWith(401)).to.be.true;
    });

    it("responds 401 when the token is invalid/expired (jwt.verify throws)", async () => {
        req.headers.authorization = "Bearer badtoken";
        sinon.stub(jwt, "verify").throws(new Error("invalid signature"));

        await protect(req, res, next);

        expect(next.called).to.be.false;
        expect(res.status.calledWith(401)).to.be.true;
        expect(res.json.calledWith({ message: "Not authorized, token failed" })).to.be.true;
    });

    it("attaches req.user (minus password) and calls next() for a valid token", async () => {
        req.headers.authorization = "Bearer validtoken";
        sinon.stub(jwt, "verify").returns({ id: "user123", role: "user" });

        const fakeUser = { _id: "user123", username: "alice", role: "user" };
        // protect() does: User.findById(decoded.id).select("-password")
        const selectStub = sinon.stub().resolves(fakeUser);
        sinon.stub(User, "findById").returns({ select: selectStub });

        await protect(req, res, next);

        expect(User.findById.calledWith("user123")).to.be.true;
        expect(selectStub.calledWith("-password")).to.be.true;
        expect(req.user).to.deep.equal(fakeUser);
        expect(next.calledOnce).to.be.true;
        expect(res.status.called).to.be.false;
    });

    it("responds 401 if User.findById throws (e.g. DB error)", async () => {
        req.headers.authorization = "Bearer validtoken";
        sinon.stub(jwt, "verify").returns({ id: "user123", role: "user" });
        sinon.stub(User, "findById").throws(new Error("DB down"));

        await protect(req, res, next);

        expect(next.called).to.be.false;
        expect(res.status.calledWith(401)).to.be.true;
    });
});