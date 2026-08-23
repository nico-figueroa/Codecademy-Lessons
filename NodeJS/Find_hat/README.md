# 🎩 Find Your Hat

A terminal-based maze game built with Node.js where you navigate a field of obstacles to find your lost hat — without falling into a hole!

---

## 📖 Overview

**Find Your Hat** is an interactive command-line game in which the player moves through a randomly generated grid filled with safe paths (`░`), dangerous holes (`O`), and their lost hat (`^`). Navigate carefully using WASD keys — one wrong step into a hole and the game is over. Reach your hat to win!

The game supports a **Hard Mode** that keeps the challenge alive by dynamically generating new holes as you move, and adapts the grid size automatically to fit your terminal window.

---

## 🚀 How to Run

### Prerequisites

- [Node.js](https://nodejs.org/) v14 or higher
- npm

### Installation

```bash
# Clone the repository
git clone https://github.com/nico-figueroa/Codecademy-Lessons
cd ./NodeJS/Find_hat

# Install dependencies
npm install
```

### Start the Game

```bash
node main.js
```

---

## 🎮 How to Play

1. **Launch the game** and follow the setup prompts:
   - Enter the desired **hole percentage** (e.g., `30` for 30% of the grid filled with holes)
   - Choose whether to enable **Hard Mode**

2. **Navigate the field** using your keyboard in real time — no Enter key required:

   | Key | Direction |
   |-----|-----------|
   | `W` | Move Up   |
   | `A` | Move Left |
   | `S` | Move Down |
   | `D` | Move Right|

3. **Avoid the holes** (`O`) — stepping into one ends the game immediately.

4. **Find your hat** (`^`) to win!

### Map Legend

| Symbol | Meaning          |
|--------|------------------|
| `*`    | Your position    |
| `░`    | Safe path        |
| `O`    | Hole             |
| `^`    | Your hat (goal!) |

---

## ⚙️ Features

- **Real-Time Movement** — Keypresses are registered instantly via raw terminal input; no need to press Enter after each move.
- **Dynamic Terminal Sizing** — The game grid automatically scales to fill your current terminal window dimensions at startup, giving you a different experience on every screen.
- **Configurable Hole Percentage** — You decide how treacherous the field is. Enter any percentage from 1–90 at the start of each game.
- **Hard Mode** — New holes are randomly added to the field after every move, making safe paths disappear over time and dramatically increasing difficulty.
- **Chalk-Powered Colored Output** — Each element on the map is rendered in a distinct color using the [Chalk](https://github.com/chalk/chalk) library for a vivid, readable terminal display.
- **Out-of-Bounds Detection** — Moving outside the grid boundaries immediately ends the game with an appropriate message.
- **Win/Loss Feedback** — Clear, colored terminal messages notify you when you win or lose, with the reason displayed.

---

## 🛠️ Technologies Used

| Technology | Purpose |
|------------|---------|
| **Node.js** | Runtime environment |
| **Chalk** | Colored terminal output |
| **readline** / raw mode | Real-time keypress input (no Enter required) |
| **`process.stdout`** | Dynamic terminal dimension detection |

---

## 📁 Project Structure

```
find-your-hat/
├── main.js          # Full game entry point, logic and input handling
├── package.json     # Project metadata and dependencies
└── README.md        # You are here
```

---

## 💡 Tips

- Start with a lower hole percentage (10–20%) while learning the layout.
- In Hard Mode, try to move quickly and plan several steps ahead — the field degrades fast.
- Resize your terminal before launching to get a larger or smaller grid.

---

## 📄 License

This project was built as a learning exercise. Feel free to fork and extend it! Copilot was used in the generation of the code.
