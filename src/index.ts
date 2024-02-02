import { Elysia } from "elysia";
import twilio from "twilio";

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;
const VoiceResponse = twilio.twiml.VoiceResponse;

if (!accountSid || !authToken || !twilioPhoneNumber) {
  throw new Error("TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_PHONE_NUMBER are required");
}

const client = twilio(accountSid, authToken);

// const app = new Elysia().get("/", () => "Hello Elysia").listen(3000);
const app = new Elysia();

app.get("/", () => "Hello Elysia");

app.get("/call/:number", async ({ params: { number } }) => {
  try {
    const response = new VoiceResponse();

    const gather = response.gather({
      input: 'speech',
      action: '/completed'
    });

    gather.say('Please tell me your name.');
    response.say('We didn\'t receive any name. Goodbye!');

    const call = await client.calls.create({
      twiml: response.toString(),
      to: number,
      from: twilioPhoneNumber,
      method: "POST"
    });

    return new Response(call.sid, {
      status: 200,
      statusText: "OK"
    });


  }
  catch (error) {
    console.error(error);
    return new Response("An error occurred", {
      status: 500,
      statusText: "Internal Server Error"
    });
  }
});

app.post("/completed", ({ body }) => {
  console.log(body);
  return new Response("OK", {
    status: 200,
    statusText: "OK"
  });
});

app.listen(3000);


console.log(
  `🦊 Elysia is running at http://${app.server?.hostname}:${app.server?.port}`
);
