# Emmet-Blue-Ui
AngularJS Frontend for EmmetBlue

# Run with Docker
1. docker build . -t emmetblue-ui:project-condra-dev
2. docker run -d -p 80:4040 --name emmetblue-ui-dev --mount type=bind,source=.,target=/usr/local/apache2/htdocs/ emmetblue-ui:project-condra-dev
