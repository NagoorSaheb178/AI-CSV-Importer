# Hey there! 👋 Welcome to the GrowEasy AI CSV Importer

So, here's my submission for the Software Developer role at GrowEasy.ai (sent over to varun@groweasy.ai). I really wanted to build something that feels seamless, so I put together this AI-powered CSV importer. It takes messy CSV files from pretty much any source and intelligently maps them directly to the GrowEasy CRM schema. 

---

## 🚀 See it in action

[Live Demo URL] <!-- Add after deployment -->

---

## ✨ What makes it cool?

I tried to pack in as many nice touches as I could:

- **AI does the heavy lifting:** I hooked it up to a blazing fast backend powered by Groq (llama-3.3-70b). It looks at your crazy column names and figures out what CRM field they actually map to. No manual mapping required!
- **Just drag and drop:** The upload process is super straightforward. Just drop your CSV file and you're good to go.
- **Peek before you process:** There's a slick, scrollable preview table so you can verify your data before the AI even touches it.
- **It chunks the work:** To keep things smooth, the AI processes records in batches of 10. You get a nice progress bar to watch it work.
- **Self-healing:** If the AI hiccups, the system automatically retries the batch up to 3 times.
- **Clear results:** Once it's done, you get a dashboard showing exactly what imported successfully and what got skipped. You can even download the processed records back as a clean CSV.
- **Looks great:** I threw in a premium dark mode with some nice glassmorphism effects, and made sure it works on your phone too.
- **Actually saves data:** Yep, it's connected to MongoDB Atlas, so everything gets saved properly.

---

## 🛠️ What I used to build this

I kept the stack modern but focused on what works best for this specific problem:

- **Frontend:** Next.js 14 (App Router) with TypeScript.
- **Backend:** Next.js API Routes (`/api/process` for AI, `/api/leads` for DB).
- **AI Brain:** Groq API SDK (`llama-3.3-70b-versatile`) — insanely fast server-side AI extraction.
- **Database:** MongoDB Atlas + Mongoose.
- **Styling:** Good ol' Vanilla CSS with CSS Variables for that clean dark mode.
- **CSV Magic:** PapaParse.
- **Bonus:** Full Docker & docker-compose support!

---

## 💻 Want to run it yourself?

It's super easy to get this running locally. Here's how:

### 1. Grab the code
```bash
git clone <your-repo-url>
cd crm
```

### 2. Install everything
```bash
npm install
```

### 3. Set up the environment
You'll need a MongoDB database and a Groq API key. Create a `.env.local` file in the root folder and add:

```env
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/?appName=<appName>
GROQ_API_KEY=your_groq_api_key_here
```

### 4. Fire it up!
```bash
npm run dev
```
Then just head over to [http://localhost:3000](http://localhost:3000) and you're golden.

### 5. Docker (Bonus!)
If you prefer Docker, you can run the whole stack with:
```bash
docker-compose up --build
```
This runs the app in production mode on port 3000.

---

## 🧠 How the AI actually works

I thought a lot about how to make the AI mapping robust. Here's the flow I went with:

1. PapaParse reads the CSV right in the browser to show you the preview.
2. The records get chopped up into batches of 10.
3. We send each batch to our secure Next.js backend `/api/process`.
4. The backend hits Groq with a very strict prompt. It tells the AI to:
   - Figure out the right CRM fields based on context.
   - Only use valid `crm_status` values (`GOOD_LEAD_FOLLOW_UP`, `DID_NOT_CONNECT`, `BAD_LEAD`, `SALE_DONE`).
   - Match the `data_source` correctly.
   - Shove any extra emails or phone numbers into the `crm_note` field.
5. If the API fails, we don't panic—it retries up to 3 times using exponential backoff.
6. The backend returns the extracted data, and our local frontend code skips any leads that don't have an email or a phone number (100% mathematical accuracy).
7. Finally, the clean data gets fired off to the `/api/leads` route and saved into MongoDB.

---

## 📊 What data are we extracting?

Here's exactly what the AI pulls out to match the CRM:

- `created_at` (When we got the lead)
- `name` (Who they are)
- `email` (Their primary email)
- `country_code` (Like +91 or +1)
- `mobile_without_country_code` (Just the digits)
- `company` (Where they work)
- `city`, `state`, `country` (Where they live)
- `lead_owner` (Who's handling them)
- `crm_status` (Where they're at in the funnel)
- `crm_note` (Any extra context or contact info)
- `data_source` (Where the lead came from, e.g. leads_on_demand, meridian_tower, etc.)
- `possession_time` (When they take possession)
- `description` (Anything else worth noting)

---

## 🧪 Will it read my weird CSV?

Probably! I've tested it against a bunch of common formats:
- Facebook Lead Exports
- Google Ads Exports
- Standard Excel / Google Sheets
- Real Estate CRM exports
- Sales reports
- Marketing agency lists
- Hand-typed messy spreadsheets

---

## 📡 API Stuff

If you want to poke at the backend, here are the routes:

### `POST /api/process`
Takes raw CSV rows and returns structured CRM JSON using Groq AI.

### `POST /api/leads`
Saves the good stuff to the database.

**What you send:**
```json
{
  "imported": [{ /* clean records */ }],
  "skipped": [{ /* records that didn't make the cut */ }]
}
```

**What you get back:**
```json
{
  "success": true,
  "total_imported": 42,
  "total_skipped": 3,
  "batch_id": "some-uuid",
  "imported": [...],
  "skipped": [...]
}
```

### `GET /api/leads?batch_id=<id>`
Grabs the leads we just saved (you can filter by `batch_id`).

---

## 👋 Thanks for checking it out!

I really enjoyed building this. If you have any questions, you know where to find me.

**Role:** Software Developer (Full-Time)  
**Submitted to:** varun@groweasy.ai
