# Contributing to Rubik's Cube Timer

Thank you for your interest in contributing to the Rubik's Cube Timer project! We welcome contributions from developers of all skill levels and appreciate your help in making this project better.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [How to Contribute](#how-to-contribute)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Testing Guidelines](#testing-guidelines)
- [Issue Guidelines](#issue-guidelines)
- [Community](#community)

## Code of Conduct

This project and everyone participating in it is governed by our [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code. Please report unacceptable behavior to the project maintainers.

## Getting Started

### Prerequisites

- [Bun](https://bun.sh/) (recommended) or Node.js 18+
- Git
- A modern web browser
- Basic knowledge of React, TypeScript, and Next.js

### Development Setup

1. **Fork the repository**
   ```bash
   # Click the "Fork" button on GitHub, then clone your fork
   git clone https://github.com/YOUR_USERNAME/rubiks-cube-timer.git
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

5. **Create a new branch for your feature**
   ```bash
   git checkout -b feature/your-feature-name
   ```

## How to Contribute

### Types of Contributions

We welcome several types of contributions:

- **Bug fixes**: Fix existing issues or bugs
- **Feature enhancements**: Improve existing features
- **New features**: Add new functionality
- **Documentation**: Improve or add documentation
- **Performance improvements**: Optimize code performance
- **UI/UX improvements**: Enhance user interface and experience
- **Tests**: Add or improve test coverage
- **Accessibility**: Improve accessibility features
- **Internationalization**: Add support for multiple languages

### Finding Work

- Check the [Issues](https://github.com/TriForMine/rubiks-cube-timer/issues) page for open issues
- Look for issues labeled `good first issue` if you're new to the project
- Issues labeled `help wanted` are specifically looking for contributors
- Feel free to propose new features by opening an issue first

## Pull Request Process

### Before You Submit

1. **Search existing PRs**: Check if someone else is already working on similar changes
2. **Open an issue**: For significant changes, open an issue first to discuss your approach
3. **Update documentation**: Ensure any new features are documented
4. **Test your changes**: Verify your changes work as expected
5. **Check browser compatibility**: Test on multiple browsers if possible

### Submitting Your PR

1. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat: add awesome new feature"
   ```

2. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```

3. **Create a Pull Request**
   - Go to the original repository on GitHub
   - Click "New Pull Request"
   - Select your branch and create the PR

### PR Requirements

- **Clear title and description**: Explain what your PR does and why
- **Link related issues**: Use "Fixes #123" or "Closes #123" syntax
- **Small, focused changes**: Keep PRs focused on a single feature or fix
- **Follow coding standards**: Ensure your code follows project conventions
- **Update tests**: Add or update tests for your changes
- **No breaking changes**: Avoid breaking existing functionality without discussion

### PR Review Process

1. **Automated checks**: Ensure all CI checks pass
2. **Code review**: Maintainers will review your code
3. **Address feedback**: Make requested changes promptly
4. **Final approval**: Once approved, your PR will be merged

## Coding Standards

### TypeScript

- Use TypeScript for all new code
- Define proper types and interfaces
- Avoid `any` type unless absolutely necessary
- Use meaningful variable and function names

### React & Next.js

- Use functional components with hooks
- Follow React best practices (keys, effects, etc.)
- Use Next.js App Router conventions
- Implement proper error boundaries where needed

### Code Style

- **Formatting**: We use Prettier for code formatting
- **Linting**: Follow ESLint rules defined in the project
- **File naming**: Use kebab-case for files and PascalCase for components
- **Import order**: Group imports logically (external, internal, relative)

### Example Code Style

```typescript
// Good
interface TimerState {
  isRunning: boolean;
  startTime: number | null;
  currentTime: number;
}

const Timer: React.FC<TimerProps> = ({ onTimeUpdate }) => {
  const [state, setState] = useState<TimerState>({
    isRunning: false,
    startTime: null,
    currentTime: 0
  });

  const handleStart = useCallback(() => {
    setState(prev => ({
      ...prev,
      isRunning: true,
      startTime: performance.now()
    }));
  }, []);

  return (
    <div className="timer-container">
      {/* Timer UI */}
    </div>
  );
};
```

### CSS & Styling

- Use Tailwind CSS for styling
- Follow mobile-first responsive design
- Maintain consistent spacing and typography
- Use CSS custom properties for theme values
- Ensure proper contrast ratios for accessibility

## Testing Guidelines

### Running Tests

```bash
# Run all tests
bun run test

# Run tests in watch mode
bun run test:watch

# Run tests with coverage
bun run test:coverage
```

### Writing Tests

- **Unit tests**: Test individual functions and components
- **Integration tests**: Test component interactions
- **E2E tests**: Test complete user workflows
- **Accessibility tests**: Ensure features are accessible

### Test Structure

```typescript
describe('Timer Component', () => {
  it('should start timer when spacebar is pressed', () => {
    // Arrange
    render(<Timer />);
    
    // Act
    fireEvent.keyDown(document, { key: ' ' });
    
    // Assert
    expect(screen.getByText(/running/i)).toBeInTheDocument();
  });
});
```

## Issue Guidelines

### Reporting Bugs

When reporting bugs, please include:

- **Clear title**: Describe the issue concisely
- **Steps to reproduce**: Detailed steps to recreate the bug
- **Expected behavior**: What should happen
- **Actual behavior**: What actually happens
- **Environment**: Browser, OS, device type
- **Screenshots**: If applicable
- **Console errors**: Any error messages

### Feature Requests

For feature requests, please include:

- **Problem description**: What problem does this solve?
- **Proposed solution**: How would you like it to work?
- **Alternatives considered**: Other approaches you've thought of
- **Additional context**: Screenshots, mockups, or examples

### Issue Labels

- `bug`: Something isn't working
- `enhancement`: New feature or request
- `documentation`: Improvements or additions to documentation
- `good first issue`: Good for newcomers
- `help wanted`: Extra attention is needed
- `priority: high/medium/low`: Issue priority
- `type: feature/bug/docs`: Issue type

## Community

### Getting Help

- **GitHub Discussions**: For questions and general discussion
- **Issues**: For bug reports and feature requests
- **Code Reviews**: Learn from feedback on your PRs

### Communication Guidelines

- Be respectful and inclusive
- Use clear, concise language
- Provide context for your questions
- Search existing issues before creating new ones
- Tag relevant people when appropriate

### Recognition

Contributors are recognized in several ways:

- Listed in the project's contributors
- Mentioned in release notes for significant contributions
- Special recognition for first-time contributors

## Development Tips

### Useful Commands

```bash
# Development
bun run dev              # Start dev server
bun run build           # Build for production
bun run start           # Start production server

# Code Quality
bun run lint            # Run ESLint
bun run lint:fix        # Fix ESLint issues
bun run type-check      # Run TypeScript compiler

# Utilities
bun run clean           # Clean build artifacts
bun run analyze         # Analyze bundle size
```

### Debugging

- Use browser DevTools for debugging
- Add console.log statements for quick debugging
- Use React DevTools extension
- Check the Network tab for API issues

### Performance

- Use React DevTools Profiler
- Monitor bundle size with `bun run build:analyze`
- Test on slower devices and networks
- Use lighthouse for performance audits

## Release Process

1. **Version bumping**: Follow semantic versioning (semver)
2. **Changelog**: Update CHANGELOG.md with new features and fixes
3. **Testing**: Ensure all tests pass and manual testing is complete
4. **Documentation**: Update documentation for new features
5. **Release**: Create a GitHub release with release notes

## Questions?

If you have questions about contributing, feel free to:

- Open a GitHub Discussion
- Create an issue with the `question` label
- Reach out to the maintainers

## Internationalization (i18n)

### Language Support

We're planning to add support for multiple languages to make the timer accessible to the global speedcubing community. Here's how you can contribute:

#### Supported Languages (Planned)

**High Priority Languages:**
- English (en) - Default ✅
- Spanish (es) - Large speedcubing community
- Chinese Simplified (zh-CN) - Major cubing market
- French (fr) - Strong European presence
- German (de) - Active community
- Portuguese (pt) - Growing community
- Japanese (ja) - Cubing innovation hub

**Additional Languages:**
- Russian (ru)
- Korean (ko) 
- Italian (it)
- Dutch (nl)
- Polish (pl)

#### Translation Guidelines

1. **Technical Accuracy**: Maintain speedcubing terminology consistency
2. **WCA Standards**: Follow World Cube Association terminology where applicable
3. **Context Awareness**: Consider cultural differences in time formats and measurements
4. **Completeness**: Translate all user-facing text including:
   - Timer interface elements
   - Statistics labels and descriptions
   - Settings and configuration options
   - Error messages and notifications
   - Help text and tooltips

#### Implementation Notes

When internationalization is implemented, it will use modern i18n practices:

- Support for multiple languages with proper localization
- Maintain speedcubing terminology consistency across languages
- Follow WCA terminology standards where applicable
- Consider cultural differences in time formats and measurements

#### Contributing Translations

1. Check existing translation issues on GitHub
2. Create a new issue for your target language
3. Follow the translation key structure
4. Test translations in the UI
5. Submit PR with complete language pack

Thank you for contributing to Rubik's Cube Timer! 🎲