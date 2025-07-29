# Rubik's Cube Timer

A modern, feature-rich Rubik's cube timer built with Next.js, React, and TypeScript. Inspired by cstimer, this application provides a clean and professional interface for speedcubing practice and competition.

## Features

### 🎲 Core Functionality
- **Accurate Timer**: High-precision timing with millisecond accuracy
- **WCA Scramble Generator**: Official World Cube Association compliant 3x3x3 scrambles
- **Spacebar Controls**: Standard speedcubing timer controls (hold to prepare, release to start)
- **Time Tracking**: Comprehensive solve history with timestamps

### 📊 Statistics & Analysis
- **Comprehensive Stats**: Best, worst, mean, and current session statistics
- **Standard Averages**: Ao5, Ao12, Ao50, and Ao100 calculations
- **Visual Feedback**: Color-coded times based on performance
- **Time Management**: Add penalties (+2, DNF) and delete individual solves

### 🎨 User Experience
- **Modern Dark Theme**: Easy on the eyes for long practice sessions
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile
- **Visual State Indicators**: Clear feedback for timer states (ready, running, stopped)
- **Keyboard Shortcuts**: Efficient navigation and control

### 💾 Data Management
- **Local Storage**: Automatic save/restore of times and settings
- **Export/Import**: JSON-based backup and restore functionality
- **Session Management**: Clear all times with confirmation

## Getting Started

### Prerequisites
- [Bun](https://bun.sh/) (recommended) or Node.js 18+
- Modern web browser

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd RubiksCubeTimer
   ```

2. **Install dependencies**
   ```bash
   bun install
   ```

3. **Start the development server**
   ```bash
   bun run dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Build for Production

```bash
# Build the application
bun run build

# Start the production server
bun run start
```

## Usage

### Basic Timer Operation

1. **Starting a Solve**
   - Press and hold the SPACEBAR
   - The timer will show "HOLD" state (red indicator)
   - Continue holding until you see "READY" state (yellow indicator)
   - Release SPACEBAR to start the timer

2. **Stopping the Timer**
   - Press SPACEBAR while the timer is running
   - Your time will be automatically recorded
   - A new scramble will be generated

### Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `SPACE` | Start/Stop timer |
| `ESC` | Generate new scramble |
| `DELETE` | Delete last time |

### Managing Times

- **View Details**: Click on any time in the list to expand details
- **Add Penalties**: Use the +2 or DNF buttons in expanded view
- **Delete Times**: Click the trash icon to remove individual times
- **Export Data**: Use Settings → Export Times to backup your data
- **Import Data**: Use Settings → Import Times to restore from backup

### Statistics Explained

- **Best**: Your fastest solve time
- **Mean**: Average of all solve times
- **Ao5**: Average of 5 (best and worst times removed)
- **Ao12**: Average of 12 (best and worst times removed)
- **Ao50**: Average of 50 (best and worst times removed)
- **Ao100**: Average of 100 (best and worst times removed)

## Technology Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui (Radix UI primitives)
- **Icons**: Lucide React
- **Package Manager**: Bun
- **Runtime**: React 19

## Project Structure

```
src/
├── app/
│   ├── globals.css          # Global styles and Tailwind config
│   ├── layout.tsx           # Root layout component
│   └── page.tsx             # Main timer page
├── components/
│   ├── ui/                  # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── dropdown-menu.tsx
│   │   ├── tabs.tsx
│   │   └── badge.tsx
│   ├── Timer.tsx            # Main timer display
│   ├── ScrambleDisplay.tsx  # Scramble generator and display
│   ├── TimesList.tsx        # Solve history list
│   ├── Statistics.tsx       # Statistics dashboard
│   └── Settings.tsx         # Application settings
└── lib/
    ├── utils.ts             # Utility functions
    └── scramble.ts          # Scramble generation logic
```

## Scramble Generation

The scramble generator creates WCA-compliant 3x3x3 cube scrambles:

- **Standard Length**: 20 moves (configurable 15-30)
- **Valid Moves**: R, L, U, D, F, B with modifiers (', 2)
- **Smart Algorithm**: Prevents invalid sequences and ensures randomness
- **Visual Display**: Moves grouped for easy reading

### Scramble Rules

- No consecutive moves on the same face (e.g., R R')
- No alternating opposite faces (e.g., R L R)
- Proper randomization using cryptographically secure methods

## Data Format

Times are stored in JSON format with the following structure:

```json
{
  "id": "1640995200000",
  "time": 15420,
  "scramble": "R U R' U' R' F R F' U2 R U' R'",
  "date": "2023-12-31T23:59:59.999Z",
  "penalty": "+2"
}
```

### Field Descriptions

- `id`: Unique timestamp identifier
- `time`: Solve time in milliseconds
- `scramble`: WCA scramble string
- `date`: ISO 8601 timestamp
- `penalty`: Optional penalty ("DNF" or "+2")

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Use ESLint and Prettier for code formatting
- Write meaningful commit messages
- Test on multiple devices and browsers
- Maintain accessibility standards

## Performance Optimizations

- **Lazy Loading**: Components loaded on demand
- **Memoization**: React.memo and useMemo for expensive calculations
- **Local Storage**: Efficient data persistence
- **Optimized Rendering**: Minimal re-renders during timer operation
- **Tree Shaking**: Only necessary code included in build

## Accessibility

- **Keyboard Navigation**: Full keyboard support
- **Screen Reader**: ARIA labels and semantic HTML
- **Color Contrast**: WCAG 2.1 AA compliant
- **Focus Indicators**: Clear focus states
- **Reduced Motion**: Respects user preferences

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Inspired by [cstimer](https://cstimer.net/)
- WCA scramble algorithms
- The speedcubing community
- Contributors and testers

## Roadmap

### Planned Features

- [ ] Multiple puzzle support (2x2, 4x4, etc.)
- [ ] Advanced statistics and graphs
- [ ] Competition mode with inspection time
- [ ] Cloud synchronization
- [ ] Mobile app (React Native)
- [ ] Multiplayer racing
- [ ] Custom themes
- [ ] Session management
- [ ] Training modes (F2L, OLL, PLL)
- [ ] Sound effects and notifications

### Bug Reports

If you encounter any issues, please create an issue on GitHub with:

- Steps to reproduce
- Expected behavior
- Actual behavior
- Browser and version
- Screenshots (if applicable)

## FAQ

**Q: How accurate is the timer?**
A: The timer uses `performance.now()` for sub-millisecond accuracy and updates every 10ms during solving.

**Q: Are the scrambles WCA official?**
A: Yes, the scrambles follow WCA regulations for 3x3x3 cubes with proper move notation and sequence validation.

**Q: Can I use this offline?**
A: Yes, the app works offline after the initial load thanks to Next.js static optimization.

**Q: How do I backup my times?**
A: Use the Export function in Settings to download a JSON file with all your data.

**Q: Is my data private?**
A: Yes, all data is stored locally in your browser. Nothing is sent to external servers.

---

**Happy Cubing! 🎲**