# Deploying Habit Tracker to Render

Follow these steps to deploy your Flask + SQLite application on Render.

## 1. Prerequisites

Ensure your project is pushed to a **GitHub repository**.

## 2. Create a Web Service

1.  Log in to [Render.com](https://render.com/).
2.  Click **New +** and select **Web Service**.
3.  Connect your GitHub repository `habit-tracker`.

## 3. Configure Settings

Fill in the details as follows:

| Setting | Value |
| :--- | :--- |
| **Name** | `habit-tracker` (or your choice) |
| **Region** | Choose the one closest to you |
| **Branch** | `main` (or `master`) |
| **Root Directory** | (Leave empty) |
| **Runtime** | **Python 3** |
| **Build Command** | `pip install -r requirements.txt` |
| **Start Command** | `cd backend && gunicorn app:app` |
| **Plan** | Free (or Individual) |

Click **Create Web Service**.

## 4. SQLite Persistence (Crucial!)

**⚠️ Important:** On Render's **Free Tier**, the file system is *ephemeral*. This means every time you deploy or the server restarts, **your `database.db` file will be deleted**, and your habits will disappear.

### How to Persist Data (Options)

#### Option A: Use a Persistent Disk (Paid Plan Required)
To keep your SQLite database, you need to upgrade to a paid plan and attach a **Disk**.

1.  In your Render Dashboard, go to the **Disks** tab.
2.  Click **New Disk**.
3.  **Name**: `sqlite-data`.
4.  **Mount Path**: `/opt/render/project/src/backend`.
    *   *Note: This mounts the disk directly to where the code expects the DB.*
    *   *Warning: Mounting a disk over the source code directory can obscure files. Ideally, you should update the code to look for the DB in a dedicated folder like `/backend/data`, but for this simple app, you can try mounting to `/opt/render/project/src/backend`.*

#### Option B: Switch to PostgreSQL (Free Tier Available) - Recommended
For free persistence, it is better to use Render's **PostgreSQL** database instead of SQLite.
*   This requires changing the Python code to use `psycopg2` or `SQLAlchemy` and connecting to the `DATABASE_URL` environment variable.

## 5. Verify Deployment

1.  Wait for the build to finish.
2.  Click the URL provided (e.g., `https://habit-tracker.onrender.com`).
3.  The app should load!
