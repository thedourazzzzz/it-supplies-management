
Built by https://www.blackbox.ai

---

# IT Supplies Management Application

## Project Overview
The IT Supplies Management Application is designed to help organizations manage their IT supplies effectively. It allows users to track and manage different types of IT supplies, making it easier to maintain an organized inventory.

## Installation
To set up the project on your local machine, follow these steps:

1. **Clone the repository**:
   ```bash
   git clone https://github.com/yourusername/it-supplies-management.git
   cd it-supplies-management
   ```

2. **Install the dependencies**:
   Run the following command to install both server and client dependencies:
   ```bash
   npm run install-all
   ```

## Usage
To start the application in development mode, use the following command:
```bash
npm run dev
```
This will concurrently start the server and client applications, allowing you to use them seamlessly.

## Features
- Manage IT supplies efficiently.
- Track inventory in real-time.
- User-friendly interface for ease of use.
- Support for importing and exporting data using CSV.

## Dependencies
This project has the following dependencies:

- **csv-parser**: Used for parsing CSV files.
  - Version: ^3.2.0

### Development Dependencies
- **concurrently**: Enables running multiple commands concurrently.
  - Version: ^8.2.0

## Project Structure
The project is structured into two main parts: `client` and `server`.

```
it-supplies-management/
│
├── client/              # Frontend application
│   ├── src/             # Source files for the client application
│   └── public/          # Public assets
│
├── server/              # Backend application
│   ├── src/             # Source files for the server application
│   └── test/            # Test files for server functionalities
│
├── package.json         # Project metadata and dependencies
└── README.md            # Project documentation
```

## Conclusion
The IT Supplies Management Application is a robust solution for managing your IT supplies. With an intuitive interface and efficient management capabilities, it helps streamline your inventory processes.