FROM mcr.microsoft.com/playwright:v1.47.0-noble

# Copy frontscope (including tests)
COPY . /test

WORKDIR /test

# Clean out any sources/tests/build that happened to be there
RUN rm -r src dist e2e/results/* e2e/tests

# Install system dependencies
RUN apt update && apt install python3.12-venv -y

# Install node dependencies
RUN npm install

# Install browsers
RUN npx playwright install
