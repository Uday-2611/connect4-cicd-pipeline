FROM jenkins/jenkins:lts
USER root
RUN apt-get update && apt-get install -y libatomic1
USER jenkins
