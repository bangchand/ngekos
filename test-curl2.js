const jwt = require('jsonwebtoken');
const { execSync } = require('child_process');
require('dotenv').config();

const token = jwt.sign({ id: 'b426d650-044b-4b02-93fd-857fc1144374', role: 'OWNER' }, process.env.JWT_SECRET || 'secret', { expiresIn: '1h' });
const curlCmd = `curl --request POST \
  --url http://localhost:3000/api/v1/1zCg1406d2x331wM/kosts \
  --header 'Authorization: Bearer ${token}' \
  --header 'content-type: multipart/form-data' \
  --form 'data={
  "name": "Kost Bangkit Jaya",
  "description": "Kost nyaman dan asri dekat kampus",
  "type": "MALE",
  "address": "Jl. Sukamaju No 99",
  "city": "Bandung"
}' \
  --form 'images=@dummy.jpg'`;

try {
  const result = execSync(curlCmd).toString();
  console.log(result);
} catch (e) {
  console.log(e.stdout.toString());
}
