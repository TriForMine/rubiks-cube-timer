# Security Policy

## Supported Versions

We release patches for security vulnerabilities. Which versions are eligible for receiving such patches depends on the CVSS v3.0 Rating:

| Version | Supported          |
| ------- | ------------------ |
| 0.1.x   | :white_check_mark: |

## Reporting a Vulnerability

The Rubik's Cube Timer team takes security bugs seriously. We appreciate your efforts to responsibly disclose your findings, and will make every effort to acknowledge your contributions.

### How to Report a Security Vulnerability

**Please do not report security vulnerabilities through public GitHub issues.**

Instead, please report them using one of the following methods:

1. **GitHub Security Advisory** (Preferred)
   - Go to https://github.com/TriForMine/rubiks-cube-timer/security/advisories
   - Click "Report a vulnerability"
   - Fill out the form with details

2. **Email** (Alternative)
   - Send an email to the repository owner through GitHub
   - Include "SECURITY" in the subject line
   - Provide detailed information about the vulnerability

### What to Include

Please include the following information in your report:

- **Type of issue** (e.g., XSS, CSRF, injection, etc.)
- **Full paths** of source file(s) related to the manifestation of the issue
- **Location** of the affected source code (tag/branch/commit or direct URL)
- **Step-by-step instructions** to reproduce the issue
- **Proof-of-concept or exploit code** (if possible)
- **Impact** of the issue, including how an attacker might exploit it
- **Special configuration** required to reproduce the issue (if any)

### Response Timeline

We will acknowledge receipt of your vulnerability report within **72 hours** and will send a more detailed response within **7 days** indicating the next steps in handling your report.

After the initial reply to your report, we will:

- Confirm the problem and determine the affected versions
- Audit code to find any potential similar problems
- Prepare fixes for all releases still under support
- Release patched versions as soon as possible

### Disclosure Policy

- We will coordinate the release of security fixes with you
- We follow responsible disclosure and will credit you for the discovery
- We will notify the community about the vulnerability after a fix is available
- We may request that you keep the vulnerability confidential until we can release a fix

## Security Considerations

### Client-Side Security

This application runs entirely in the browser and handles:

- **Local Storage**: Times and settings are stored locally in the browser
- **No Server Communication**: No data is transmitted to external servers
- **No User Authentication**: No login system or user accounts
- **Static Hosting**: Can be served from any static file server

### Potential Security Areas

While this is a client-side timer application, potential security considerations include:

1. **XSS Prevention**: Proper sanitization of user inputs
2. **Local Storage**: Secure handling of stored data
3. **Dependencies**: Regular updates of npm packages
4. **Build Process**: Secure build and deployment pipeline

### Data Privacy

- **No Data Collection**: We don't collect any user data
- **Local Storage Only**: All data remains on the user's device
- **No Analytics**: No tracking or analytics are implemented
- **No Cookies**: No cookies are used for tracking

## Security Best Practices for Contributors

When contributing to this project, please follow these security guidelines:

### Code Review

- All code changes must be reviewed before merging
- Security-sensitive changes require additional scrutiny
- Dependencies should be regularly updated and audited

### Input Validation

- Validate all user inputs, even for client-side applications
- Sanitize data before storing in localStorage
- Be cautious with dynamic content rendering

### Dependencies

- Use `npm audit` or `bun audit` to check for vulnerabilities
- Keep dependencies up to date
- Remove unused dependencies
- Pin dependency versions in production

### Build Security

- Use trusted base images and build environments
- Verify the integrity of downloaded packages
- Use lock files to ensure reproducible builds

## Automated Security Measures

We employ several automated security measures:

### GitHub Security Features

- **Dependabot**: Automatic dependency updates for security patches
- **Security Advisories**: Monitoring for known vulnerabilities
- **Code Scanning**: Automated analysis of code for security issues

### CI/CD Security

- **Automated Testing**: Security tests run on every pull request
- **Dependency Auditing**: Regular checks for vulnerable dependencies
- **Build Verification**: Ensuring builds are reproducible and secure

## Security Updates

Security updates will be published through:

1. **GitHub Releases**: With clear security advisory information
2. **GitHub Security Advisories**: For detailed vulnerability information
3. **README Updates**: For any security-related configuration changes

## Hall of Fame

We recognize security researchers who help keep our project secure:

<!-- This section will be updated as we receive and validate security reports -->

*No security issues have been reported yet.*

## Additional Resources

- [OWASP Top Ten](https://owasp.org/www-project-top-ten/)
- [GitHub Security Features](https://docs.github.com/en/code-security)
- [NPM Security Best Practices](https://docs.npmjs.com/security)
- [Web Security Guidelines](https://developer.mozilla.org/en-US/docs/Web/Security)

## Contact

For any questions about this security policy, please:

- Open a GitHub Discussion
- Create a GitHub Issue (for non-security matters)
- Contact the repository maintainers

Thank you for helping keep Rubik's Cube Timer secure! 🔒