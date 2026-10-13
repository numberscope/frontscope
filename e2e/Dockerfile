FROM mcr.microsoft.com/playwright:v1.64.0-jammy

# Copy frontscope (including tests)
COPY . /test

WORKDIR /test

# Clean out any sources/tests/build that happened to be there
RUN rm -rf src dist e2e/results/* e2e/tests

# Install system dependencies
RUN apt update && apt install python3.10-venv -y

# Install node dependencies
RUN npm install

# Install browsers
RUN npx playwright install
