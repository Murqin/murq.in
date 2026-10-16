FROM nginx:alpine-slim

# Remove default nginx static assets
RUN rm -rf /usr/share/nginx/html/*

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy static assets
COPY index.html style.css script.js /usr/share/nginx/html/
COPY assets/ /usr/share/nginx/html/assets/

# Stamp the commit into the ?v= query on style.css and script.js. Cloudflare keeps CSS/JS for hours whatever the
# origin says, so a new URL per build is what makes a deploy show up at once.
ARG REVISION=dev
RUN sed -i -E "s/\?v=[A-Za-z0-9]+/?v=$(echo "$REVISION" | cut -c1-7)/g" /usr/share/nginx/html/index.html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
