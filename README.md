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
- **Desktop Focused**: Optimized for desktop use with keyboard controls
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
   git clone https://github.com/TriForMine/rubiks-cube-timer.git
   cd rubiks-cube-timer
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
| `N` | Generate new scramble |
| `DELETE` | Delete last time |

**Note**: The timer currently requires a physical keyboard and is optimized for desktop use. Mobile device support is planned for future releases.

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
- **Performance**: Rust WebAssembly (WASM) for cube simulation

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
│   ├── Cube3DViewer.tsx     # 3D cube visualization
│   ├── TimesList.tsx        # Solve history list
│   ├── Statistics.tsx       # Statistics dashboard
│   └── Settings.tsx         # Application settings
├── lib/
│   ├── utils.ts             # Utility functions
│   ├── cube-wasm.ts         # WASM module interface
│   ├── cube-3d-renderer.ts  # Three.js 3D renderer
│   └── scramble.ts          # Scramble generation logic
└── cube-wasm/               # Rust WASM module
    ├── src/                 # Rust source code
    ├── pkg/                 # Compiled WASM files (committed)
    ├── Cargo.toml           # Rust package config
    └── README.md            # WASM module documentation
```

## High-Performance WASM Engine

This application features a custom Rust WebAssembly module for optimal performance:

### Key Benefits
- **Blazing Fast**: Cube simulation runs at native speeds
- **Zero-Copy Memory**: Direct memory access between JS and WASM
- **WCA Compliance**: Official scramble generation algorithms
- **Type Safety**: Full TypeScript integration with WASM bindings

### WASM Module Features
- **Optimized Algorithms**: Efficient cube state representation and move execution
- **Smart Scrambling**: Prevents invalid move sequences and ensures proper randomization
- **Memory Efficient**: Minimal memory footprint with zero-copy data access
- **Cross-Platform**: Compiled WASM files work across all browsers and platforms

### Why WASM Files Are Committed
The compiled WASM files (`.wasm`, `.js`, `.d.ts`) are intentionally committed to the repository because:
- **Deployment Compatibility**: Cloudflare Pages and similar platforms don't support Rust compilation
- **Build Reliability**: Ensures consistent performance across all environments
- **Zero Dependencies**: No need for Rust toolchain in production builds

For more details, see the [WASM module documentation](./cube-wasm/README.md).

## Scramble Generation

The scramble generator creates WCA-compliant 3x3x3 cube scrambles:

- **Standard Length**: 20 moves (configurable 15-30)
- **Valid Moves**: R, L, U, D, F, B with modifiers (', 2)
- **Smart Algorithm**: Prevents invalid sequences and ensures randomness
- **Visual Display**: Moves grouped for easy reading
- **3D Visualization**: Optional step-by-step 3D cube preview

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

We welcome contributions from developers of all skill levels! Please see our [Contributing Guidelines](CONTRIBUTING.md) for detailed information on how to get started.

### Quick Start for Contributors

1. Fork the repository on GitHub
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes following our coding standards
4. Test your changes thoroughly
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

### Development Guidelines

- Follow TypeScript and React best practices
- Use ESLint and Prettier for code formatting
- Write meaningful commit messages
- Test on multiple devices and browsers
- Maintain accessibility standards
- Read our [Code of Conduct](CODE_OF_CONDUCT.md)

For detailed contribution guidelines, development setup, and coding standards, please refer to [CONTRIBUTING.md](CONTRIBUTING.md).

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

- Chrome 90+ (desktop)
- Firefox 88+ (desktop)
- Safari 14+ (desktop)
- Edge 90+ (desktop)

**Note**: Requires physical keyboard for timer controls. Mobile browsers are not currently supported.

## License

This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for details.

### Apache 2.0 License Summary

- ✅ Commercial use allowed
- ✅ Modification allowed  
- ✅ Distribution allowed
- ✅ Patent use allowed
- ✅ Private use allowed
- ℹ️ License and copyright notice required
- ℹ️ State changes required

For the full license text, see [LICENSE](LICENSE).

## Acknowledgments

- Inspired by [cstimer](https://cstimer.net/) - the gold standard for online cube timers
- [World Cube Association (WCA)](https://www.worldcubeassociation.org/) for scramble algorithms and regulations
- The global speedcubing community for feedback and support
- All contributors who help make this project better
- Open source libraries and tools that make this project possible

## Security

If you discover a security vulnerability, please follow our [Security Policy](SECURITY.md) for responsible disclosure. Do not report security issues through public GitHub issues.

## Roadmap

### Planned Features

#### High Priority
- [ ] Mobile touch controls and responsive interface
- [ ] Internationalization (i18n) and multiple language support
- [ ] Multiple puzzle support (2x2, 4x4, etc.)
- [ ] Advanced statistics and graphs
- [ ] Competition mode with inspection time

#### Medium Priority
- [ ] Cloud synchronization
- [ ] Custom themes
- [ ] Session management
- [ ] Training modes (F2L, OLL, PLL)
- [ ] Sound effects and notifications

#### Future Considerations
- [ ] Mobile app (React Native)
- [ ] Multiplayer racing
- [ ] Advanced scramble algorithms
- [ ] Competition timing features

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

**Q: Does this work on mobile devices?**
A: Currently, the timer requires a physical keyboard for proper operation and is optimized for desktop use. Mobile support is planned for future releases.

**Q: How do I backup my times?**
A: Use the Export function in Settings to download a JSON file with all your data.

**Q: Is my data private?**
A: Yes, all data is stored locally in your browser. Nothing is sent to external servers. See our [Security Policy](SECURITY.md) for more details.

**Q: Can I contribute to this project?**
A: Absolutely! We welcome contributions. Please read our [Contributing Guidelines](CONTRIBUTING.md) and [Code of Conduct](CODE_OF_CONDUCT.md) to get started.

---

**Happy Cubing! 🎲**