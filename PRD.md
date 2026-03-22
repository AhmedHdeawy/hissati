# Product Requirements Document (PRD): Maryam’s Lesson Companion (V2.0)

## 1. Executive Summary
**Project Name:** Maryam’s Lesson Companion (MLC)  
**Target User:** Maryam (Child)  
**Primary Goal:** A dedicated tablet application to automate online lesson reminders and streamline the process of joining Zoom/Google Meet sessions via a child-friendly, animated interface.

---

## 2. Problem Statement
* **Manual Friction:** Parents must manually copy/paste links from WhatsApp/Telegram to the tablet for every session.
* **Time Management:** Relying on memory for multiple weekly lessons is prone to human error.
* **Complexity:** Standard messaging apps are distracting and not intuitive for a child to navigate independently to a virtual classroom.

---

## 3. Functional Requirements

### 3.1 Data Synchronization & Offline-First Logic
* **JSON-Driven Logic:** The app fetches a remote `config.json` file from a provided URL.
* **Asset Caching:** Upon "Update," the app downloads and stores the JSON data, subject icons, and all audio reminder files locally.
* **Reliability:** Once synced, all reminders and animations must function **offline** to ensure 100% reliability regardless of internet stability.

### 3.2 Automated Multi-Stage Audio Reminders
Each lesson triggers four specific audio events to guide Maryam through the preparation process:
1.  **T-60 Minutes (Motivation):** A calm, pleasant audio clip/chime to signal that a lesson is approaching in one hour.
2.  **T-30 Minutes (Preparation):** A specific voice message (e.g., "Prepare your books and water, Maryam") recorded by the parent.
3.  **T-5 Minutes (Action Alert):** A high-energy, cheerful audio alert signaling that the class is starting and the "Join" button is active.
4.  **Success Sound:** A celebratory "Success" sound played immediately after Maryam taps the meeting link.

### 3.3 Interactive Dashboard (UI/UX)
* **Minimalist Interface:** Large, high-contrast icons representing "Quran" and "English."
* **Live Animation:** At **T-5 minutes**, the relevant subject icon begins a **"Shake & Pulse"** animation to provide a clear visual cue for interaction.
* **Focus Mode:** After joining, the UI displays a simple countdown timer based on the `duration_minutes` field and a "Study Hard" message.

### 3.4 Gamification & Rewards
* **Star Counter:** Every successful "Join" action awards Maryam a digital star.
* **Weekly Milestones:** The app tracks stars against a weekly goal. Reaching the goal triggers a full-screen "Confetti" animation and a special congratulatory audio message from the parent.

### 3.5 Parental Observability
* **Activity Logging:** The app records local timestamps of when a lesson link was clicked.
* **Status Signal (Optional):** Sends an HTTP POST request to a parent-managed webhook (e.g., NestJS backend) to confirm Maryam has joined her class in real-time.

---

## 4. Technical Specifications

### 4.1 Enhanced JSON Schema
```json
{
  "parental_control": { 
    "notify_parent": true, 
    "webhook_url": "[https://api.your-backend.com/logs](https://api.your-backend.com/logs)" 
  },
  "subjects": [
    {
      "id": "eng_01",
      "title": "English Class",
      "duration_minutes": 45,
      "schedule": [
        {"day": "Monday", "time": "21:00"},
        {"day": "Wednesday", "time": "21:00"}
      ],
      "assets": {
        "icon": "[https://server.com/assets/eng_icon.png](https://server.com/assets/eng_icon.png)",
        "audio_60": "[https://server.com/audio/calm.mp3](https://server.com/audio/calm.mp3)",
        "audio_30": "[https://server.com/audio/prep.mp3](https://server.com/audio/prep.mp3)",
        "audio_5": "[https://server.com/audio/hurry.mp3](https://server.com/audio/hurry.mp3)",
        "audio_success": "[https://server.com/audio/star_gain.mp3](https://server.com/audio/star_gain.mp3)"
      },
      "meeting_url": "[https://zoom.us/j/12345678](https://zoom.us/j/12345678)"
    }
  ]
}
