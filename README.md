# Linker - Cross-Device Clipboard

Linker is a premium tool designed to share text, links, and images between your PC/Laptop and iPhone seamlessly.

## Getting Started

To run the application locally, follow these steps:

1.  **Install Dependencies**:
    ```bash
    npm install
    ```

2.  **Start the Development Server**:
    ```bash
    npm run dev
    ```

3.  **Access on PC**:
    Open [http://localhost:3000](http://localhost:3000) in your browser.

4.  **Connect your iPhone**:
    - Ensure your iPhone and PC are on the same Wi-Fi network.
    - Find your PC's local IP address (e.g., `192.168.1.10`).
        - On Linux: Run `hostname -I`
        - On Windows: Run `ipconfig`
    - Enter this IP address in the "Connect iPhone" section on the Linker dashboard.
    - Scan the generated QR code with your iPhone's camera.

## Features

- **Instant Text Sync**: Paste links or text on one device and see them on the other.
- **Image Sharing**: Upload images to a shared gallery.
- **Glassmorphic UI**: A modern, premium design for a great user experience.
- **Auto-polling**: Keeps your clipboard in sync without manual refreshes.

## Tech Stack

- **Frontend**: Next.js (App Router), React, Lucide Icons, Framer Motion.
- **Styling**: Vanilla CSS with a custom design system.
- **Persistence**: Local JSON storage (`clipboard.json`).
