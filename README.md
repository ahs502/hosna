# How to Deploy our server/web/landing to a single VPS

Deploying to a new VPS can be straightforward. Follow the steps below to get your application up and running.

## Step 1: Create and Set Up Ubuntu VPS

1. **Create Ubuntu VPS**:

   - Ideally, use a VPS with Docker pre-installed.
   - If Docker is not installed, follow the [Docker Installation Guide](https://docs.docker.com/engine/install/ubuntu/).

2. **Generate SSH Key**:

   - Inside the VPS, generate an SSH key by running:
     ```sh
     ssh-keygen
     ```
   - Follow the prompts to save the key.

3. **Add SSH Key to GitHub**:
   - Copy the public key:
     ```sh
     cat ~/.ssh/id_rsa.pub
     ```
   - Go to your GitHub account settings and add the SSH key.

## Step 2: Clone the Repository

1. **Clone the maxclicks Repo**:
   - Navigate to your desired directory and run:
     ```sh
     git clone git@github.com:maxclickshq/maxclicks.git
     ```
   - Move into the cloned repository:
     ```sh
     cd maxclicks
     ```

## Step 3: Build Docker Containers

1. **Build the Server Container**:

   - In the root of the maxclicks repository, run:
     ```sh
     docker build -f server/Dockerfile -t maxclicks/app-server:latest .
     ```

2. **Build the Web Container**:

   - Again, in the root of the maxclicks repository, run:
     ```sh
     docker build -f web/Dockerfile -t maxclicks/app-web:latest .
     ```

3. **Build the Landing Container**:
   - Clone the landing repo inside the maxclicks repository and navigate to the landing directory:
     ```sh
     git clone git@https://github.com/maxclickshq/landing.git landing
     cd landing
     ```
   - Build the landing container:
     ```sh
     docker build -f landing.Dockerfile -t maxclicks/app-landing:latest .
     ```

## Step 4: Run Docker Compose

1. **Run Docker Compose**:
   - Navigate back to the root of the maxclicks repository and run:
     ```sh
     docker-compose up -d
     ```

That's it! Your application should now be deployed and running on your VPS.
