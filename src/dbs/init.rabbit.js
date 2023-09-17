"use strict"

const amqp = require("amqplib")

const connectToRabbitMQ = async () => {
    try {
        const connection = await amqp.connect("amqp://guest:1234@localhost")
        if (!connection) throw new Error("Couldn't connect to RabbitMQ")
        const channel = await connection.createChannel()

        return { channel, connection }
    } catch (error) {
        console.log("Error connecting to RabbitMQ: ", error)
    }
}

const connectToRabbitMQForTest = async () => {
    try {
        const { channel, connection } = await connectToRabbitMQ()

        //Publish messages to queue
        const queue = "test-queue"
        const message = "Hello, Ecommerce shop by Kenta"
        await channel.assertQueue(queue)
        await channel.sendToQueue(queue, Buffer.from(message))

        //Close the connection
        await connection.close()
    } catch (error) {
        console.log("Error connecting to RabbitMQ: ", error)
    }
}

const consumerQueue = async (channel, queueName) => {
    try {
        await channel.assertQueue(queueName, { durable: true })
        console.log("Waiting for message...")
        channel.consume(
            queueName,
            (message) => {
                console.log(
                    `Received message from ${queueName}::`,
                    message.content.toString()
                )
                // 1. Find user that follows the Shop
                // 2. Send message to user
                // 3. if successful => ok
                // 4. if failed => setup DLX
            },
            {
                noAck: true,
            }
        )
    } catch (error) {
        console.log("Error publishing message to queue:", error)
        throw error
    }
}

module.exports = {
    connectToRabbitMQ,
    connectToRabbitMQForTest,
    consumerQueue,
}
