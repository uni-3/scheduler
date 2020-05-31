
set -e

yarn add express-generator

npx -p express-generator -c "express --view=pug ./" 