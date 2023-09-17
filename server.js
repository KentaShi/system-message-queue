"use strict"

const {
    consumerToQueue,
    consumerToQueueNormal,
    consumerToQueueFail,
} = require("./src/services/consumerQueue.service")
const queueName = "test-topic"

// consumerToQueue(queueName)
//     .then(() => {
//         console.log(`Message consumer started: ${queueName}`)
//     })
//     .catch((err) => console.error(`Message consumer failed: ${err}`))

consumerToQueueNormal(queueName)
    .then(() => {
        console.log(`Message consumer normal started`)
    })
    .catch((err) => console.error(`Message consumer failed: ${err}`))

consumerToQueueFail(queueName)
    .then(() => {
        console.log(`Message consumer fail started`)
    })
    .catch((err) => console.error(`Message consumer failed: ${err}`))
