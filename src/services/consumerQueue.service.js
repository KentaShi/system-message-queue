"use strict"

const { consumerQueue, connectToRabbitMQ } = require("../dbs/init.rabbit")
const { ForBiddenError } = require("../core/error.response")

// const log = console.log
// console.log = function () {
//     log.apply(console, [new Date()].concat(arguments))
// }

const messageService = {
    consumerToQueue: async (queueName) => {
        try {
            const { channel, connection } = await connectToRabbitMQ()
            await consumerQueue(channel, queueName)
        } catch (error) {
            console.error(`Error consume to queue::`, error)
        }
    },
    //case processing normal
    consumerToQueueNormal: async (queueName) => {
        try {
            const { channel, connection } = await connectToRabbitMQ()
            const notiQueue = "notificationQueueProcess" // assertQueue

            // 1. case TTL
            // const timeExpire = 15000
            // setTimeout(() => {
            //     channel.consume(notiQueue, (msg) => {
            //         console.log(
            //             `Sending message to queue successfully:`,
            //             msg.content.toString()
            //         )
            //         channel.ack(msg)
            //     })
            // }, timeExpire)

            // 2. case Logic
            channel.consume(notiQueue, (msg) => {
                try {
                    const numberTest = Math.random()
                    console.log(`numberTest: ${numberTest}`)
                    if (numberTest < 0.8) {
                        throw new ForBiddenError(
                            "Send notification failed::hotfix"
                        )
                    }
                    console.log(
                        `Sending message to queue successfully:`,
                        msg.content.toString()
                    )
                    channel.ack(msg)
                } catch (error) {
                    //console.error(`Send notification error: `, error)
                    channel.nack(msg, false, false)

                    /*
                        nack: nagative acknowledgement
                        param[0]: failed message to push to queue to process
                        param[1]: false => do not push to normal queue, do push to hotfix queue
                        param[2]: false => just this message denied
                    */
                }
            })
        } catch (error) {
            console.error(`Error consume to queue normal::`, error)
        }
    },
    //case processing fail
    consumerToQueueFail: async (queueName) => {
        try {
            const { channel, connection } = await connectToRabbitMQ()
            const notificationExchangeDLX = "notificationExDLX" // notificationExDLX direct
            const notificationRoutingKeyDLX = "notificationRoutingKeyDLX" // notificationRoutingKeyDLX
            const notiQueueHandler = "notificationQueueHotFix"

            await channel.assertExchange(notificationExchangeDLX, "direct", {
                durable: true,
            })

            const queueResult = await channel.assertQueue(notiQueueHandler, {
                exclusive: false,
            })

            await channel.bindQueue(
                queueResult.queue,
                notificationExchangeDLX,
                notificationRoutingKeyDLX
            )
            await channel.consume(
                queueResult.queue,
                (msgFail) => {
                    console.log(
                        "This notification failed, pls hot fix:: ",
                        msgFail.content.toString()
                    )
                },
                {
                    noAck: true,
                }
            )
        } catch (error) {
            console.error(error)
            throw error
        }
    },
}

module.exports = messageService
