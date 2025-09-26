# Dictate: Voice-Powered System Overlay

A MacOS/Windows compatible Electron overlay app which allows fully automated browser actions through simple voice commands. Powered by LLM Agents and Model Context Protocols (MCPs)  

Example tasks include browsing the web, searching for articles, or creating a Craigslist ad. Future plans aim to extend the application context to all system components.  

Steps for development  

### 1. Clone the repository

```bash
git clone https://github.com/ShakeefAhmedRakin/electron-react-ts-tailwind-shadcn-fastapi-template.git
cd electron-react-ts-tailwind-shadcn-fastapi-template
```

### 2. Install Frontend Dependencies

```bash
npm install
```

### 3. Set Up the Python Backend

#### Create a Virtual Environment

> _Requires Python 3.8.0+ (Tested with 3.8.0)_

#### On **Windows**:

```bash
cd backend
python -m venv venv
venv\Scripts\activate
```

#### On **macOS/Linux**:

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
```

#### 📦 Install Python Dependencies

```bash
pip install -r requirements.txt
```

## Development Mode

Make sure your Python **virtual environment** is activated before running `npm run dev`

```bash
npm run dev
```

This will:

- Start the FastAPI backend
- Launch the Electron app with hot reload for React

## Production Build

To create a production build of the app:

```bash
npm run build
```

Build output will be located under the `release/{version}` folder.

> _The build output is platform-specific._
>
> - Running `npm run build` on **Windows** will generate a **Windows executable**.
> - Running it on **macOS** will generate a **macOS app bundle**.
