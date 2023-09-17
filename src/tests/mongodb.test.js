"use strict"

const mongoose = require("mongoose")
const connectionString = "mongodb://localhost:27017/shopDev"

const TestSchema = new mongoose.Schema({ name: String })
const Test = mongoose.model("Test", TestSchema)

describe("Mongoose Connection", () => {
    let connection
    beforeAll(async () => {
        connection = await mongoose.connect(connectionString)
    })
    afterAll(async () => {
        await connection.disconnect()
    })

    it("should connect to mongoose", () => {
        expect(mongoose.connection.readyState).toBe(1)
    })

    it("should save a document to the database", async () => {
        const user = new Test({ name: "Kenta" })
        await user.save()
        expect(user.isNew).toBe(false)
    })
    it("should find a document to the database", async () => {
        const user = await Test.findOne({ name: "Kenta" })
        expect(user).toBeDefined()
        expect(user.name).toBe("Kenta")
    })
})
