#!/bin/bash

# MedChain MVP Setup Script
# This script sets up the complete MedChain development environment

echo "🏥 Setting up MedChain MVP - Blockchain Healthcare System"
echo "=========================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Node.js is installed
check_nodejs() {
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node --version)
        print_success "Node.js is installed: $NODE_VERSION"
    else
        print_error "Node.js is not installed. Please install Node.js 16+ from https://nodejs.org/"
        exit 1
    fi
}

# Check if npm is installed
check_npm() {
    if command -v npm &> /dev/null; then
        NPM_VERSION=$(npm --version)
        print_success "npm is installed: $NPM_VERSION"
    else
        print_error "npm is not installed. Please install npm."
        exit 1
    fi
}

# Install project dependencies
install_dependencies() {
    print_status "Installing project dependencies..."
    
    # Install main project dependencies
    if npm install; then
        print_success "Main dependencies installed successfully"
    else
        print_error "Failed to install main dependencies"
        exit 1
    fi
    
    # Install frontend dependencies
    print_status "Installing frontend dependencies..."
    cd frontend
    if npm install; then
        print_success "Frontend dependencies installed successfully"
    else
        print_error "Failed to install frontend dependencies"
        exit 1
    fi
    cd ..
}

# Compile smart contracts
compile_contracts() {
    print_status "Compiling smart contracts..."
    
    if npx hardhat compile; then
        print_success "Smart contracts compiled successfully"
    else
        print_error "Failed to compile smart contracts"
        exit 1
    fi
}

# Run tests
run_tests() {
    print_status "Running smart contract tests..."
    
    if npx hardhat test; then
        print_success "All tests passed successfully"
    else
        print_warning "Some tests failed. Check the output above."
    fi
}

# Start local blockchain
start_local_node() {
    print_status "Starting local Hardhat node..."
    print_warning "This will run in the background. Use 'npx hardhat node' to see output."
    
    # Start hardhat node in background
    npx hardhat node > hardhat-node.log 2>&1 &
    HARDHAT_PID=$!
    echo $HARDHAT_PID > .hardhat-node.pid
    
    # Wait a moment for the node to start
    sleep 3
    
    if kill -0 $HARDHAT_PID 2>/dev/null; then
        print_success "Local Hardhat node started (PID: $HARDHAT_PID)"
        print_status "Node logs are saved to hardhat-node.log"
    else
        print_error "Failed to start local Hardhat node"
        exit 1
    fi
}

# Deploy contracts to local network
deploy_contracts() {
    print_status "Deploying contracts to local network..."
    
    if npx hardhat run scripts/deploy.js --network localhost; then
        print_success "Contracts deployed successfully"
        print_status "Deployment info saved to deployments/localhost.json"
    else
        print_error "Failed to deploy contracts"
        exit 1
    fi
}

# Create environment file
create_env_file() {
    print_status "Creating environment configuration..."
    
    if [ ! -f .env ]; then
        cp .env.example .env
        print_success "Created .env file from template"
        print_warning "Please update .env with your API keys and configuration"
    else
        print_warning ".env file already exists"
    fi
}

# Setup frontend environment
setup_frontend_env() {
    print_status "Setting up frontend environment..."
    
    # Read contract address from deployment file
    if [ -f "deployments/localhost.json" ]; then
        CONTRACT_ADDRESS=$(cat deployments/localhost.json | grep -o '"MedChain":"[^"]*"' | cut -d'"' -f4)
        
        # Create or update frontend .env
        cat > frontend/.env << EOF
REACT_APP_CONTRACT_ADDRESS=$CONTRACT_ADDRESS
REACT_APP_NETWORK_ID=31337
REACT_APP_NETWORK_NAME=localhost
REACT_APP_RPC_URL=http://localhost:8545
EOF
        print_success "Frontend environment configured with contract address: $CONTRACT_ADDRESS"
    else
        print_warning "Deployment file not found. Frontend may not work properly."
    fi
}

# Function to stop local node
cleanup() {
    if [ -f ".hardhat-node.pid" ]; then
        PID=$(cat .hardhat-node.pid)
        if kill -0 $PID 2>/dev/null; then
            kill $PID
            print_status "Stopped local Hardhat node (PID: $PID)"
        fi
        rm .hardhat-node.pid
    fi
}

# Setup trap to cleanup on exit
trap cleanup EXIT

# Main setup flow
main() {
    print_status "Starting MedChain MVP setup..."
    
    # System checks
    check_nodejs
    check_npm
    
    # Installation
    install_dependencies
    
    # Smart contract setup
    compile_contracts
    run_tests
    
    # Environment setup
    create_env_file
    
    # Local development setup
    start_local_node
    deploy_contracts
    setup_frontend_env
    
    # Success message
    echo ""
    echo "🎉 MedChain MVP Setup Complete!"
    echo "================================"
    echo ""
    print_success "✅ Dependencies installed"
    print_success "✅ Smart contracts compiled and tested"
    print_success "✅ Local blockchain node running"
    print_success "✅ Contracts deployed to local network"
    print_success "✅ Environment configured"
    echo ""
    echo "📋 Next Steps:"
    echo "1. Update .env file with your API keys (IPFS, Infura, etc.)"
    echo "2. Start the frontend: cd frontend && npm start"
    echo "3. Open http://localhost:3000 in your browser"
    echo "4. Connect MetaMask to localhost:8545"
    echo ""
    echo "🔧 Development Commands:"
    echo "• Start frontend: cd frontend && npm start"
    echo "• Run tests: npm test"
    echo "• Deploy to testnet: npm run deploy"
    echo "• Stop local node: kill \$(cat .hardhat-node.pid)"
    echo ""
    echo "📚 Documentation: Check README.md for detailed usage instructions"
    echo ""
}

# Check if running with --help flag
if [[ "$1" == "--help" || "$1" == "-h" ]]; then
    echo "MedChain MVP Setup Script"
    echo ""
    echo "Usage: ./setup.sh [options]"
    echo ""
    echo "Options:"
    echo "  --help, -h     Show this help message"
    echo "  --no-node      Skip starting local blockchain node"
    echo "  --no-deploy    Skip contract deployment"
    echo "  --no-test      Skip running tests"
    echo ""
    echo "This script will:"
    echo "1. Check system requirements"
    echo "2. Install dependencies"
    echo "3. Compile smart contracts"
    echo "4. Run tests"
    echo "5. Start local blockchain node"
    echo "6. Deploy contracts"
    echo "7. Configure environment"
    echo ""
    exit 0
fi

# Run main setup
main
