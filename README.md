# Connect 4 - A Cloud-Native Deployment

This project is a web-based, real-time multiplayer Connect 4 game. It features a full CI/CD pipeline and a cloud-native architecture designed for scalability and automated deployment.

This README documents the project's architecture, the technologies used, and the manual deployment process to AWS.

## Project Architecture

The application is designed with a microservices-oriented architecture that separates concerns and allows for independent scaling and development.

-   **Frontend:** A dynamic and responsive React.js single-page application that serves as the user interface for the game.
-   **Backend:** A Node.js and Express server that provides the core game logic, user management, and API endpoints.
-   **Database:** A PostgreSQL database that persists game state, user information, and match history.
-   **Messaging Queue:** Apache Kafka is used to handle real-time, in-game events, such as player moves. This creates a resilient and scalable system for real-time communication.
-   **CI/CD:** A Jenkins pipeline automates the entire process of building, testing, and deploying the application.

## Technologies Used

| Technology | Area | Why it was chosen |
| :--- | :--- | :--- |
| **React.js** | Frontend | To build a fast, modern, and dynamic user interface with a component-based architecture that is easy to maintain and scale. |
| **Node.js & Express** | Backend | For a lightweight, high-performance backend capable of handling many concurrent connections. Using JavaScript on both frontend and backend simplifies development. |
| **PostgreSQL** | Database | A powerful, reliable, and open-source relational database perfect for storing structured data like user profiles and game history. |
| **Apache Kafka** | Messaging | To provide a robust, fault-tolerant, and scalable messaging system for real-time game events. It decouples the backend services and ensures no moves are lost. |
| **Docker & Docker Compose** | Containerization | To package each part of the application (frontend, backend, database, etc.) into isolated containers. This ensures consistency across development, testing, and production environments. Docker Compose simplifies the orchestration of this multi-container setup. |
| **Jenkins** | CI/CD | To automate the software delivery pipeline. The `Jenkinsfile` defines the entire build, test, and deploy process as code, enabling one-click or automated deployments. |
| **Amazon Web Services (AWS)** | Cloud Deployment | A leading cloud platform providing all the necessary services for a scalable and secure deployment. We used **EC2** for the virtual server, **ECR** for the private Docker image registry, and **IAM** for secure permissions management. |

## Manual AWS Deployment

The application has been manually deployed to an AWS EC2 instance. The high-level steps were:

1.  **Setup AWS:** An AWS account was created and the AWS CLI was configured locally.
2.  **Containerize:** The frontend and backend applications were built into Docker images locally.
3.  **Store Images:** The Docker images were pushed to a private repository in Amazon Elastic Container Registry (ECR).
4.  **Launch Server:** A `t3.micro` EC2 instance was launched using the Amazon Linux 2023 AMI. Security groups were configured to allow public access on the required ports (3000 for the frontend, 5000 for the backend).
5.  **Configure Server:** Docker, Docker Compose, and Git were installed on the EC2 instance. An IAM Role was attached to the instance to grant it secure permission to pull images from ECR.
6.  **Deploy:** The project repository was cloned to the server. The `docker-compose.yml` file was modified to use the ECR image URLs instead of building locally.
7.  **Launch:** The application was launched using `docker-compose up -d`.

The final, deployed application is accessible at: **http://15.207.190.7:3000**

## Local Development

To run the entire application stack on your local machine:

```bash
# This command builds the images from the local Dockerfiles and starts the containers.
docker-compose up --build
```

Then, visit [http://localhost:3000](http://localhost:3000) in your browser.

## Team
Uday Agarwal - Tanish Raj Singh
