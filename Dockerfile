FROM httpd:2.4
MAINTAINER myclinic.ng
COPY . /usr/local/apache2/htdocs/
EXPOSE 80