# Emmet-Blue-Ui
AngularJS Frontend for EmmetBlue

# Run with Docker
Run the following on your terminal and ensure port 4040 is available for use.
Update <pwd> to reflect your project path

1. `docker build . -t emmetblue-ui:project-condra-dev`
2. `docker run -d -p 4040:80 --name emmetblue-ui-dev --mount type=bind,source=<pwd>,target=/usr/local/apache2/htdocs/ emmetblue-ui:project-condra-dev`

To access the container, run

`docker exec -it emmetblue-ui-dev bash`
