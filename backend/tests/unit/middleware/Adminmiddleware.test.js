// tests/unit/middleware/adminMiddleware.test.js
const { expect } = require("chai");
const sinon = require("sinon");
const { adminOnly } = require("../../../middleware/adminMiddleware");

describe("adminMiddleware - adminOnly", () => {
    let req, res, next;

    beforeEach(() => {
        req = { user: null };
        res = {
            status: sinon.stub().returnsThis(),
            json: sinon.stub()
        };
        next = sinon.stub();
    });

    it("calls next() when req.user.role is 'admin'", () => {
        req.user = { role: "admin" };

        adminOnly(req, res, next);

        expect(next.calledOnce).to.be.true;
        expect(res.status.called).to.be.false;
    });

    it("responds 403 when req.user.role is 'user'", () => {
        req.user = { role: "user" };

        adminOnly(req, res, next);

        expect(next.called).to.be.false;
        expect(res.status.calledWith(403)).to.be.true;
        expect(res.json.calledWith({ message: "Admin access only" })).to.be.true;
    });

    it("responds 403 when req.user is undefined (no auth ran first)", () => {
        req.user = undefined;

        adminOnly(req, res, next);

        expect(next.called).to.be.false;
        expect(res.status.calledWith(403)).to.be.true;
    });

    it("responds 403 when req.user.role is missing entirely", () => {
        req.user = { username: "noRoleField" };

        adminOnly(req, res, next);

        expect(next.called).to.be.false;
        expect(res.status.calledWith(403)).to.be.true;
    });
});