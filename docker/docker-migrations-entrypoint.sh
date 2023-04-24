#!/bin/sh
>&2 echo "Starting migrations..."
npm run migration:run

#!/bin/sh
>&2 echo "Start to generate new migrations..."
npm run migration:generate

>&2 echo "Starting server..."
npm run start:dev