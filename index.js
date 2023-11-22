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
           console.log(JSON.stringify(bodyParam.entry))
           console.log(typeof bodyParam.entry["changes"])
           for (const changes of Array.from(bodyParam.entry.changes)) {
               if (changes.value.messages && changes.value.messages.length > 0) {
                   for (const message of Array.from(changes.value.messages)) {
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
               } else {
                   const prisma = new PrismaClient({
                       log: ["query", "info", "error", "warn"]
                   });

                   const otherMessage = await prisma.otherMessage.create({
                       data: {
                           message: JSON.stringify(request.body)
                       }
                   })

                   return otherMessage;
               }
           }
       }
   }

   response.send(JSON.stringify(response.body))
});
