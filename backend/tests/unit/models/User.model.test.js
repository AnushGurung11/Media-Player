// tests/unit/models/user.model.test.js
const { expect } = require("chai");
const User = require("../../../models/User");

describe("User Model", () => {

    describe("password hashing (pre-save hook)", () => {
        it("hashes the plain-text password before saving", async () => {
            const user = await User.create({
                username: "alice",
                email: "alice@example.com",
                password: "plaintext123"
            });

            expect(user.password).to.not.equal("plaintext123");
            // bcrypt hashes always start with $2a$, $2b$ or $2y$
            expect(user.password).to.match(/^\$2[aby]\$/);
        });

        it("does not re-hash the password if it wasn't modified", async () => {
            const user = await User.create({
                username: "bob",
                email: "bob@example.com",
                password: "originalpass"
            });
            const firstHash = user.password;

            // Change an unrelated field and save again
            user.username = "bobby";
            await user.save();

            expect(user.password).to.equal(firstHash);
        });

        it("re-hashes the password when it IS modified", async () => {
            const user = await User.create({
                username: "carol",
                email: "carol@example.com",
                password: "originalpass"
            });
            const firstHash = user.password;

            user.password = "newpassword";
            await user.save();

            expect(user.password).to.not.equal(firstHash);
            expect(user.password).to.match(/^\$2[aby]\$/);
        });
    });

    describe("schema defaults & validation", () => {
        it("defaults role to 'user'", async () => {
            const user = await User.create({
                username: "dave",
                email: "dave@example.com",
                password: "pass1234"
            });
            expect(user.role).to.equal("user");
        });

        it("rejects an invalid role value", async () => {
            const user = new User({
                username: "eve",
                email: "eve@example.com",
                password: "pass1234",
                role: "superadmin" // not in enum
            });

            let err;
            try {
                await user.validate();
            } catch (e) {
                err = e;
            }
            expect(err).to.exist;
            expect(err.errors.role).to.exist;
        });

        it("requires username, email and password", async () => {
            const user = new User({});
            let err;
            try {
                await user.validate();
            } catch (e) {
                err = e;
            }
            expect(err).to.exist;
            expect(err.errors.username).to.exist;
            expect(err.errors.email).to.exist;
            expect(err.errors.password).to.exist;
        });

        it("rejects duplicate emails", async () => {
            await User.create({
                username: "frank",
                email: "dupe@example.com",
                password: "pass1234"
            });

            let err;
            try {
                await User.create({
                    username: "frank2",
                    email: "dupe@example.com",
                    password: "pass5678"
                });
            } catch (e) {
                err = e;
            }
            expect(err).to.exist;
            expect(err.code).to.equal(11000); // Mongo duplicate key error
        });
    });

    describe("matchPassword()", () => {
        it("returns true for the correct password", async () => {
            const user = await User.create({
                username: "grace",
                email: "grace@example.com",
                password: "correcthorse"
            });

            const result = await user.matchPassword("correcthorse");
            expect(result).to.be.true;
        });

        it("returns false for an incorrect password", async () => {
            const user = await User.create({
                username: "heidi",
                email: "heidi@example.com",
                password: "correcthorse"
            });

            const result = await user.matchPassword("wrongpassword");
            expect(result).to.be.false;
        });
    });

    describe("isOnline()", () => {
        it("returns true when lastLogin was within the last 15 minutes", async () => {
            const user = await User.create({
                username: "ivan",
                email: "ivan@example.com",
                password: "pass1234",
                lastLogin: new Date() // just now
            });

            expect(user.isOnline()).to.be.true;
        });

        it("returns false when lastLogin was more than 15 minutes ago", async () => {
            const twentyMinAgo = new Date(Date.now() - 20 * 60 * 1000);
            const user = await User.create({
                username: "judy",
                email: "judy@example.com",
                password: "pass1234",
                lastLogin: twentyMinAgo
            });

            expect(user.isOnline()).to.be.false;
        });

        it("returns false when lastLogin is exactly at the 15 minute boundary", async () => {
            // Slightly over 15 min to avoid a flaky millisecond-timing pass
            const justOver = new Date(Date.now() - (15 * 60 * 1000 + 100));
            const user = await User.create({
                username: "kevin",
                email: "kevin@example.com",
                password: "pass1234",
                lastLogin: justOver
            });

            expect(user.isOnline()).to.be.false;
        });
    });
});