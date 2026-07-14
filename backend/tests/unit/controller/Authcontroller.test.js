// tests/unit/controllers/authController.test.js
const { expect } = require("chai");
const sinon = require("sinon");
const jwt = require("jsonwebtoken");
const User = require("../../../models/User");
const { register, registerAdmin, login } = require("../../../controllers/authController");

// Helper to build a fake Express res object we can assert on
const mockRes = () => ({
    status: sinon.stub().returnsThis(),
    json: sinon.stub()
});

describe("authController", () => {

    afterEach(() => {
        sinon.restore();
    });

    describe("register", () => {
        it("returns 400 if a required field is missing", async () => {
            const req = { body: { username: "alice", email: "alice@example.com" } }; // no password
            const res = mockRes();

            await register(req, res);

            expect(res.status.calledWith(400)).to.be.true;
            expect(res.json.calledWith({ message: "All fields are required" })).to.be.true;
        });

        it("returns 400 if the email is already registered", async () => {
            const req = { body: { username: "alice", email: "dupe@example.com", password: "pass1234" } };
            const res = mockRes();

            sinon.stub(User, "findOne").resolves({ _id: "existingUserId" });

            await register(req, res);

            expect(res.status.calledWith(400)).to.be.true;
            expect(res.json.calledWith({ message: "User already exists" })).to.be.true;
        });

        it("creates the user and returns a token + user payload on success", async () => {
            const req = { body: { username: "alice", email: "alice@example.com", password: "pass1234" } };
            const res = mockRes();

            sinon.stub(User, "findOne").resolves(null);
            sinon.stub(User, "create").resolves({
                _id: "newUserId",
                username: "alice",
                email: "alice@example.com",
                role: "user"
            });
            sinon.stub(jwt, "sign").returns("fake.jwt.token");

            await register(req, res);

            expect(res.status.calledWith(201)).to.be.true;
            const responseBody = res.json.firstCall.args[0];
            expect(responseBody.token).to.equal("fake.jwt.token");
            expect(responseBody.user).to.deep.equal({
                id: "newUserId",
                username: "alice",
                email: "alice@example.com",
                role: "user"
            });
        });

        it("returns 500 if User.create throws", async () => {
            const req = { body: { username: "alice", email: "alice@example.com", password: "pass1234" } };
            const res = mockRes();

            sinon.stub(User, "findOne").resolves(null);
            sinon.stub(User, "create").throws(new Error("DB write failed"));

            await register(req, res);

            expect(res.status.calledWith(500)).to.be.true;
        });
    });

    describe("registerAdmin", () => {
        it("returns 403 if adminSecret is wrong", async () => {
            const req = {
                body: {
                    username: "admin1", email: "admin1@example.com",
                    password: "pass1234", adminSecret: "wrong-secret"
                }
            };
            const res = mockRes();
            process.env.ADMIN_SECRET = "correct-secret";

            await registerAdmin(req, res);

            expect(res.status.calledWith(403)).to.be.true;
            expect(res.json.calledWith({ message: "Invalid admin secret" })).to.be.true;
        });

        it("creates an admin user when the secret matches", async () => {
            process.env.ADMIN_SECRET = "correct-secret";
            const req = {
                body: {
                    username: "admin1", email: "admin1@example.com",
                    password: "pass1234", adminSecret: "correct-secret"
                }
            };
            const res = mockRes();

            sinon.stub(User, "findOne").resolves(null);
            const createStub = sinon.stub(User, "create").resolves({
                _id: "adminId",
                username: "admin1",
                email: "admin1@example.com",
                role: "admin"
            });
            sinon.stub(jwt, "sign").returns("fake.admin.token");

            await registerAdmin(req, res);

            // Confirm role: "admin" was explicitly passed to User.create
            expect(createStub.firstCall.args[0]).to.include({ role: "admin" });
            expect(res.status.calledWith(201)).to.be.true;
        });
    });

    describe("login", () => {
        it("returns 401 if no user is found for the email", async () => {
            const req = { body: { email: "nobody@example.com", password: "pass1234" } };
            const res = mockRes();

            sinon.stub(User, "findOne").resolves(null);

            await login(req, res);

            expect(res.status.calledWith(401)).to.be.true;
            expect(res.json.calledWith({ message: "Invalid email or password" })).to.be.true;
        });

        it("returns 401 if the password doesn't match", async () => {
            const req = { body: { email: "alice@example.com", password: "wrongpass" } };
            const res = mockRes();

            const fakeUser = {
                _id: "userId",
                matchPassword: sinon.stub().resolves(false),
                save: sinon.stub().resolves()
            };
            sinon.stub(User, "findOne").resolves(fakeUser);

            await login(req, res);

            expect(res.status.calledWith(401)).to.be.true;
        });

        it("updates lastLogin, returns token + user on successful login", async () => {
            const req = { body: { email: "alice@example.com", password: "correctpass" } };
            const res = mockRes();

            const fakeUser = {
                _id: "userId",
                username: "alice",
                email: "alice@example.com",
                role: "user",
                lastLogin: null,
                matchPassword: sinon.stub().resolves(true),
                save: sinon.stub().resolves()
            };
            sinon.stub(User, "findOne").resolves(fakeUser);
            sinon.stub(jwt, "sign").returns("fake.jwt.token");

            await login(req, res);

            expect(fakeUser.save.calledOnce).to.be.true; // lastLogin update was persisted
            expect(res.status.calledWith(200)).to.be.true;
            const responseBody = res.json.firstCall.args[0];
            expect(responseBody.token).to.equal("fake.jwt.token");
            expect(responseBody.user.email).to.equal("alice@example.com");
        });

        it("returns 500 if an unexpected error is thrown", async () => {
            const req = { body: { email: "alice@example.com", password: "pass1234" } };
            const res = mockRes();

            sinon.stub(User, "findOne").throws(new Error("DB down"));

            await login(req, res);

            expect(res.status.calledWith(500)).to.be.true;
        });
    });
});