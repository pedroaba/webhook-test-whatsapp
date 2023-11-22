const express = require("express");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");

const PrismaClient = require("@prisma/client").PrismaClient;

dotenv.config();

const app = express();

app.use(bodyParser.json());

app.listen(process.env.PORT, () => {
    console.log("webhook is running")
})

app.get("/", (_request, response) => {
    response.send("hello webhook")
})

app.get("/webhook", (request, response) => {
    const mode = request.query["hub.mode"];
    const challenge = request.query["hub.challenge"];
    const token = request.query["hub.verify_token"];

    const myToken = "edson";
    if (mode && token) {
        if (mode === "subscribe" && token === myToken) {
            response.status(200).send(challenge);
        } else {
            response.status(403);
        }
    }
});

app.post("/webhook", async (request, response) => {
   const bodyParam = request.body;

   console.log(JSON.stringify(bodyParam));

   if (bodyParam.object) {
       if (bodyParam.entry) {
           for await (const changes of bodyParam.entry) {
               if (changes.changes.value.message && changes.changes.value.message.length > 0) {
                   for await (const message of changes.value.message) {
                       const phoneNumberId = changes.value.metadata.phone_number_id;
                       const from = message.from;
                       const textMessage = message.text.body;

                       const prisma = new PrismaClient({
                           log: ["query", "info", "error", "warn"]
                       });

                       const message = await prisma.textMessage.create({
                           data: {
                               phoneNumber: phoneNumberId,
                               from,
                               message: textMessage
                           }
                       })

                       return response.send(JSON.stringify(message))
                   }
               } else if (changes.changes.value.metadata.phone_number_id) {
                   const phoneNumberId = changes.changes.value.metadata.phone_number_id;
                   const from = changes.statuses[0].recipient_id;
                   const textMessage = "kajbckasjcbakjs";

                   const prisma = new PrismaClient({
                       log: ["query", "info", "error", "warn"]
                   });

                   const message = await prisma.textMessage.create({
                       data: {
                           phoneNumber: phoneNumberId,
                           from,
                           message: textMessage
                       }
                   })
               }
           }
       }
   }

   response.send(JSON.stringify(response.body))
});
