# SSH to HTTPS Converter

A Chrome extension that converts SSH Git URLs to HTTPS URLs using Chrome's address bar (omnibox).

## Features

- 🔗 **Address Bar Integration**: Use `ssh` keyword in Chrome's address bar
- 🌐 **Universal Support**: Works with **any Git hosting service**
- 📊 **Statistics**: Track conversion usage
- 🎨 **Clean UI**: Modern, intuitive popup interface
- ⚡ **Lightweight**: Minimal permissions and resources

## How to Use

### Address Bar (Omnibox)
1. **Type `ssh`** in Chrome's address bar
2. **Press Tab** - you'll see "SSH to HTTPS Converter"
3. **Type your SSH URL** (e.g., `git@github.com:user/repo.git`)
4. **Press Enter** - automatically converts and navigates to HTTPS URL

**Example:**
```
ssh [Tab] git@github.com:facebook/react.git [Enter]
→ Navigates to: https://github.com/facebook/react
```

## Supported URL Formats

### Input (SSH)
```
git@github.com:username/repository.git
git@gitlab.com:username/repository.git
ssh://git@bitbucket.org/username/repository.git
git@ssh.dev.azure.com:v3/org/project/repository
git@git.company.com:team/project.git
```

### Output (HTTPS)
```
https://github.com/username/repository
https://gitlab.com/username/repository
https://bitbucket.org/username/repository
https://dev.azure.com/org/project/_git/repository
https://git.company.com/team/project
```

## Universal Git Server Support

This extension works with **any Git hosting service** that uses standard SSH URL format:

- ✅ **GitHub** (github.com)
- ✅ **GitLab** (gitlab.com) 
- ✅ **Bitbucket** (bitbucket.org)
- ✅ **Azure DevOps** (dev.azure.com)
- ✅ **SourceHut** (git.sr.ht)
- ✅ **Codeberg** (codeberg.org)
- ✅ **Your company's Git server**
- ✅ **Self-hosted Git servers**

**No configuration needed** - it automatically works with any hostname that follows the `git@hostname:user/repo.git` format.

## Installation

### From Chrome Web Store
*Coming soon*

### From Source (Developer Mode)

1. **Clone this repository**:
   ```bash
   git clone https://github.com/your-username/ssh-to-https-converter.git
   cd ssh-to-https-converter
   ```

2. **Generate icons** (optional):
   ```bash
   python3 generate_icons.py
   ```

3. **Load in Chrome**:
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top-right)
   - Click "Load unpacked" and select this directory

## Configuration

### Extension Settings
- **Enable/Disable**: Toggle the extension on/off
- **Statistics**: View daily and total conversion counts
- **Test Tool**: Try different SSH URLs to verify conversion

### Usage Examples

| SSH URL | Converted HTTPS URL |
|---------|-------------------|
| `git@github.com:user/repo.git` | `https://github.com/user/repo` |
| `git@gitlab.com:user/repo.git` | `https://gitlab.com/user/repo` |
| `ssh://git@bitbucket.org/user/repo.git` | `https://bitbucket.org/user/repo` |
| `git@ssh.dev.azure.com:v3/org/project/repo` | `https://dev.azure.com/org/project/_git/repo` |
| `git@git.mycompany.com:team/project.git` | `https://git.mycompany.com/team/project` |

## Development

### Project Structure
```
ssh-to-https-converter/
├── manifest.json          # Extension configuration
├── background.js          # Service worker (omnibox functionality)
├── popup/
│   ├── popup.html         # Settings interface
│   ├── popup.css          # Styling
│   └── popup.js           # Popup functionality
├── icons/                 # Extension icons
├── generate_icons.py      # Icon generation script
└── README.md             # This file
```

### Building
```bash
# Validate manifest
npm run validate

# Generate icons
npm run icons

# Package for distribution
npm run package
```

### Testing
1. **Load extension** in Chrome developer mode
2. **Type `ssh` + Tab** in address bar
3. **Test with various SSH URLs**
4. **Check statistics** in popup

## Privacy

- **No data collection**: All processing happens locally
- **No external requests**: No data sent to external servers
- **Minimal permissions**: Only requires omnibox, storage, and notifications
- **Open source**: Full transparency

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Changelog

### v1.0.0
- Initial release
- Address bar integration via omnibox
- Universal support for any Git hosting service
- Statistics tracking
- Clean popup interface

---

**Universal**: Works with any Git server using standard SSH URL format - no configuration required!
